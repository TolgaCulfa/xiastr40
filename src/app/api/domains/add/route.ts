import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ success: false, message: 'Domain adı zorunludur' }, { status: 400 });
    }

    const cleanDomain = domain.toLowerCase().trim();

    // 1. Insert domain into domains table
    await query(`
      INSERT INTO domains (name, type)
      VALUES ($1, 'NATIVE')
      ON CONFLICT (name) DO UPDATE SET type = 'NATIVE'
    `, [cleanDomain]);

    const domRes = await query(`SELECT id FROM domains WHERE name = $1`, [cleanDomain]);
    const domainId = domRes?.rows?.[0]?.id;

    if (!domainId) {
      return NextResponse.json({ success: false, message: 'Bölge oluşturulamadı' }, { status: 500 });
    }

    // 2. Insert SOA Record
    await query(`
      DELETE FROM records WHERE domain_id = $1 AND type = 'SOA'
    `, [domainId]);

    await query(`
      INSERT INTO records (domain_id, name, type, content, ttl)
      VALUES ($1, $2, 'SOA', $3, 300)
    `, [domainId, cleanDomain, `ns1.xias.tr hostmaster.xias.tr ${Date.now().toString().slice(0, 10)} 10800 3600 604800 300`]);

    // 3. Insert NS Records (ns1.xias.tr, ns2.xias.tr)
    await query(`
      DELETE FROM records WHERE domain_id = $1 AND type = 'NS'
    `, [domainId]);

    await query(`
      INSERT INTO records (domain_id, name, type, content, ttl)
      VALUES ($1, $2, 'NS', 'ns1.xias.tr', 300),
             ($1, $2, 'NS', 'ns2.xias.tr', 300)
    `, [domainId, cleanDomain]);

    // 4. Insert Default A Record (Points to 191.44.68.250)
    await query(`
      INSERT INTO records (domain_id, name, type, content, ttl)
      VALUES ($1, $2, 'A', '191.44.68.250', 300)
      ON CONFLICT DO NOTHING
    `, [domainId, cleanDomain]);

    await query(`
      INSERT INTO records (domain_id, name, type, content, ttl)
      VALUES ($1, $2, 'A', '191.44.68.250', 300)
      ON CONFLICT DO NOTHING
    `, [domainId, `www.${cleanDomain}`]);

    return NextResponse.json({
      success: true,
      message: `"${cleanDomain}" bölgesi PowerDNS üzerinde başarıyla oluşturuldu ve nameserver'lara bağlandı.`,
      domainId,
    });
  } catch (error: any) {
    console.error('Error adding custom domain:', error);
    return NextResponse.json({ success: false, message: error.message || 'Domain eklenemedi' }, { status: 500 });
  }
}
