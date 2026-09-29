import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Geçersiz domain adı belirtildi.' },
        { status: 400 }
      );
    }

    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const expectedNS = ['ns1.xias.tr', 'ns2.xias.tr'];

    let currentNameservers: string[] = [];
    let verified = false;

    // 1. Query Cloudflare DoH (DNS over HTTPS)
    try {
      const dohRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=NS`, {
        headers: { Accept: 'application/dns-json' },
        next: { revalidate: 0 }
      });
      if (dohRes.ok) {
        const dohData = await dohRes.json();
        if (dohData.Answer && Array.isArray(dohData.Answer)) {
          currentNameservers = dohData.Answer
            .filter((a: any) => a.type === 2) // NS type = 2
            .map((a: any) => a.data.replace(/\.$/, '').toLowerCase());
        }
      }
    } catch (e) {
      console.warn('Cloudflare DoH query failed, trying Google DoH fallback:', e);
    }

    // 2. Fallback to Google DoH if empty
    if (currentNameservers.length === 0) {
      try {
        const gRes = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=NS`, {
          next: { revalidate: 0 }
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.Answer && Array.isArray(gData.Answer)) {
            currentNameservers = gData.Answer
              .filter((a: any) => a.type === 2)
              .map((a: any) => a.data.replace(/\.$/, '').toLowerCase());
          }
        }
      } catch (e) {
        console.warn('Google DoH query error:', e);
      }
    }

    // Check if expected NS match
    const hasNs1 = currentNameservers.some(ns => ns.includes('ns1.xias.tr') || ns.includes('191.44.68.250'));
    const hasNs2 = currentNameservers.some(ns => ns.includes('ns2.xias.tr') || ns.includes('191.44.68.250'));

    verified = hasNs1 || hasNs2;

    const checkedAt = new Date().toISOString();

    if (verified) {
      return NextResponse.json({
        success: true,
        verified: true,
        currentNameservers,
        expectedNameservers: expectedNS,
        message: `Tebrikler! "${cleanDomain}" alan adınızın nameserver kayıtları doğrulandı ve XIAS Anycast WAF koruması aktif edildi.`,
        checkedAt
      });
    } else {
      return NextResponse.json({
        success: true,
        verified: false,
        currentNameservers,
        expectedNameservers: expectedNS,
        message: currentNameservers.length > 0 
          ? `Mevcut NS kayıtları (${currentNameservers.join(', ')}) henüz ns1.xias.tr / ns2.xias.tr ile eşleşmedi. DNS yayılımı (TTL) 5-30 dakika sürebilir.`
          : `Alan adınız için henüz genel DNS kayıtları bulunamadı. Lütfen registrar firmanızdan NS adreslerini güncelleyin.`,
        checkedAt
      });
    }
  } catch (error: any) {
    console.error('NS verify API error:', error);
    return NextResponse.json(
      { success: false, message: 'Doğrulama sırasında bir ağ hatası oluştu.' },
      { status: 500 }
    );
  }
}
