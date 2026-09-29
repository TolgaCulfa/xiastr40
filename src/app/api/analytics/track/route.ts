import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const domain = body.domain || 'xias.tr';
    const isThreat = Boolean(body.isThreat);
    const threatType = body.threatType || null;
    const path = body.path || '/';
    const bytesSent = Number(body.bytesSent || 1420);

    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const country = req.headers.get('x-vercel-ip-country') || 'TR';
    const userAgent = req.headers.get('user-agent') || '';

    await query(`
      INSERT INTO xias_analytics_traffic (
        domain, ip_address, country_code, user_agent, path, status_code, is_threat, threat_type, bytes_sent
      ) VALUES ($1, $2, $3, $4, $5, 200, $6, $7, $8)
    `, [domain, ip, country, userAgent, path, isThreat, threatType, bytesSent]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
