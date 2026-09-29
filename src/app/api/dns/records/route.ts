import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET all records for a domain
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || '';

  if (!domain) {
    return NextResponse.json({ success: false, message: 'Domain parametresi gereklidir' }, { status: 400 });
  }

  try {
    const res = await query(`
      SELECT r.id, r.name, r.type, r.content, r.ttl, r.prio as priority
      FROM records r
      JOIN domains d ON r.domain_id = d.id
      WHERE d.name = $1 OR r.name LIKE '%' || $1
      ORDER BY r.type ASC, r.name ASC
    `, [domain]);

    return NextResponse.json({
      success: true,
      records: res?.rows || []
    });
  } catch (error: any) {
    console.error('Error fetching DNS records from PostgreSQL:', error);
    return NextResponse.json({ success: false, message: 'Veritabanı okuma hatası' }, { status: 500 });
  }
}

// POST create a new DNS record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, name, type, content, ttl = 300, priority = 10 } = body;

    if (!domain || !name || !type || !content) {
      return NextResponse.json({ success: false, message: 'Eksik kayıt parametreleri' }, { status: 400 });
    }

    // Ensure domain exists in domains table
    await query(`
      INSERT INTO domains (name, type) 
      VALUES ($1, 'NATIVE') 
      ON CONFLICT DO NOTHING
    `, [domain]);

    const domainRes = await query(`SELECT id FROM domains WHERE name = $1`, [domain]);
    const domainId = domainRes?.rows[0]?.id;

    if (!domainId) {
      return NextResponse.json({ success: false, message: 'Domain bölgesi bulunamadı' }, { status: 500 });
    }

    // Format full record name
    const fullName = name === '@' ? domain : name.endsWith(domain) ? name : `${name}.${domain}`;

    const insertRes = await query(`
      INSERT INTO records (domain_id, name, type, content, ttl, prio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, type, content, ttl, prio as priority
    `, [domainId, fullName, type, content, ttl, priority]);

    return NextResponse.json({
      success: true,
      record: insertRes?.rows[0]
    });
  } catch (error: any) {
    console.error('Error inserting DNS record into PostgreSQL:', error);
    return NextResponse.json({ success: false, message: 'Kayıt eklenirken hata oluştu' }, { status: 500 });
  }
}

// DELETE a DNS record
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Kayıt ID gereklidir' }, { status: 400 });
    }

    await query(`DELETE FROM records WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, message: 'Kayıt başarıyla silindi' });
  } catch (error: any) {
    console.error('Error deleting DNS record from PostgreSQL:', error);
    return NextResponse.json({ success: false, message: 'Kayıt silinirken hata oluştu' }, { status: 500 });
  }
}
