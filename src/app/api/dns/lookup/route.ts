import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const type = searchParams.get('type') || 'A';

  if (!domain) {
    return NextResponse.json({ error: 'Domain parametresi zorunludur.' }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    // Real Cloudflare DNS-over-HTTPS (DoH) API query
    const cfDohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
    const response = await fetch(cfDohUrl, {
      headers: {
        Accept: 'application/dns-json',
      },
      next: { revalidate: 0 },
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return NextResponse.json({
        domain,
        type,
        status: 'Error',
        latencyMs,
        answers: [],
        message: 'DoH sunucusundan yanıt alınamadı.',
      });
    }

    const data = await response.json();
    const statusCodes: Record<number, string> = {
      0: 'NOERROR (Yayılım Başarılı)',
      1: 'FORMERR',
      2: 'SERVFAIL',
      3: 'NXDOMAIN (Kayıt Henüz Bulunamadı)',
      4: 'NOTIMP',
      5: 'REFUSED',
    };

    const statusText = statusCodes[data.Status] || `STATUS_${data.Status}`;
    const answers = (data.Answer || []).map((ans: any) => ({
      name: ans.name,
      type: ans.type,
      ttl: ans.TTL,
      data: ans.data,
    }));

    return NextResponse.json({
      domain,
      type,
      status: statusText,
      statusCode: data.Status,
      latencyMs,
      edge: 'Cloudflare Anycast PoP (IST)',
      answers,
      resolved: answers.length > 0,
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return NextResponse.json({
      domain,
      type,
      status: 'Hata',
      latencyMs,
      error: error.message,
      resolved: false,
    }, { status: 500 });
  }
}
