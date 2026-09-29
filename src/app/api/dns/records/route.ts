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

// POST create a new DNS record (Saves to PowerDNS + Cloudflare)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, name, type, content, ttl = 300, priority = 10, proxied = true } = body;

    if (!domain || !name || !type || !content) {
      return NextResponse.json({ success: false, message: 'Eksik kayıt parametreleri' }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim();
    const fullName = name === '@' ? cleanDomain : name.endsWith(cleanDomain) ? name : `${name}.${cleanDomain}`;

    // 1. Sync to Cloudflare if domain belongs to xias.tr or xias.info
    let cloudflareId = null;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = cleanDomain.endsWith('xias.tr') 
      ? process.env.CLOUDFLARE_ZONE_ID_XIASTR 
      : cleanDomain.endsWith('xias.info')
      ? process.env.CLOUDFLARE_ZONE_ID_XIASINFO
      : null;

    if (token && zoneId) {
      try {
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            name: fullName,
            content: content.trim(),
            ttl: ttl === 300 || ttl === 1 ? 1 : ttl,
            proxied: ['A', 'AAAA', 'CNAME'].includes(type) ? proxied : false,
            priority: ['MX', 'SRV'].includes(type) ? priority : undefined,
            comment: 'Managed via XiasTr Dashboard',
          }),
        });
        const cfData = await cfRes.json();
        if (cfData.success && cfData.result?.id) {
          cloudflareId = cfData.result.id;
        }
      } catch (cfErr) {
        console.error('Cloudflare sync error:', cfErr);
      }
    }

    // 2. Ensure domain exists in domains table in PostgreSQL
    await query(`
      INSERT INTO domains (name, type) 
      VALUES ($1, 'NATIVE') 
      ON CONFLICT DO NOTHING
    `, [cleanDomain]);

    const domainRes = await query(`SELECT id FROM domains WHERE name = $1`, [cleanDomain]);
    const domainId = domainRes?.rows[0]?.id;

    if (!domainId) {
      return NextResponse.json({ success: false, message: 'Domain bölgesi bulunamadı' }, { status: 500 });
    }

    const insertRes = await query(`
      INSERT INTO records (domain_id, name, type, content, ttl, prio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, type, content, ttl, prio as priority
    `, [domainId, fullName, type, content, ttl, priority]);

    return NextResponse.json({
      success: true,
      record: insertRes?.rows[0],
      cloudflareId,
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
