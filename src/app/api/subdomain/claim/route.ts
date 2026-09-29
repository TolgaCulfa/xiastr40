import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DomainZone } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subdomain, domainZone, type = 'A', content = '191.44.68.250', proxied = true } = body;

    if (!subdomain || !domainZone) {
      return NextResponse.json({ success: false, message: 'Subdomain ve domainZone zorunludur' }, { status: 400 });
    }

    const cleanSub = subdomain.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const fullDomain = `${cleanSub}.${domainZone}`;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = domainZone === 'xias.tr' 
      ? process.env.CLOUDFLARE_ZONE_ID_XIASTR 
      : process.env.CLOUDFLARE_ZONE_ID_XIASINFO;

    let cloudflareRecordId = null;
    let cloudflareError = null;

    // 1. Create real record in Cloudflare API
    if (token && zoneId) {
      try {
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: type,
            name: fullDomain,
            content: content.trim(),
            ttl: 1, // Auto
            proxied: type === 'TXT' || type === 'MX' ? false : proxied,
            comment: 'Created via XiasTr Platform',
          }),
        });

        const cfData = await cfRes.json();
        if (cfData.success && cfData.result?.id) {
          cloudflareRecordId = cfData.result.id;
        } else {
          cloudflareError = cfData.errors?.[0]?.message || 'Cloudflare kayıt oluşturulamadı';
          console.error('Cloudflare error:', cfData.errors);
        }
      } catch (err: any) {
        console.error('Cloudflare fetch error:', err);
        cloudflareError = err.message;
      }
    }

    // 2. Insert into PostgreSQL (PowerDNS)
    try {
      // Find or insert domainZone in domains table
      const domRes = await query(`SELECT id FROM domains WHERE name = $1`, [domainZone]);
      let zoneDomainId = domRes?.rows?.[0]?.id;

      if (!zoneDomainId) {
        const newDom = await query(`INSERT INTO domains (name, type) VALUES ($1, 'NATIVE') RETURNING id`, [domainZone]);
        zoneDomainId = newDom?.rows?.[0]?.id;
      }

      if (zoneDomainId) {
        await query(`
          INSERT INTO records (domain_id, name, type, content, ttl)
          VALUES ($1, $2, $3, $4, 300)
          ON CONFLICT DO NOTHING
        `, [zoneDomainId, fullDomain, type, content]);
      }
    } catch (dbErr) {
      console.error('PostgreSQL insert error:', dbErr);
    }

    return NextResponse.json({
      success: true,
      fullDomain,
      cloudflareRecordId,
      cloudflareError,
      message: `${fullDomain} başarıyla Cloudflare ve PowerDNS altyapısında oluşturuldu.`,
    });
  } catch (error: any) {
    console.error('Subdomain claim error:', error);
    return NextResponse.json({ success: false, message: error.message || 'İşlem başarısız' }, { status: 500 });
  }
}
