import { NextRequest, NextResponse } from 'next/server';
import { RESERVED_SUBDOMAINS, validateSubdomainFormat, sanitizeSubdomainName } from '@/lib/storage';
import { DomainZone } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawSubdomain = searchParams.get('subdomain') || '';
  const zone = (searchParams.get('zone') || 'xias.tr') as DomainZone;

  if (zone !== 'xias.tr' && zone !== 'xias.info') {
    return NextResponse.json(
      { available: false, reason: 'invalid_zone', message: 'Geçersiz domain bölgesi seçildi.' },
      { status: 400 }
    );
  }

  const subdomain = sanitizeSubdomainName(rawSubdomain);
  const formatValidation = validateSubdomainFormat(subdomain);

  if (!formatValidation.valid) {
    return NextResponse.json({
      subdomain,
      domainZone: zone,
      fullDomain: `${subdomain}.${zone}`,
      available: false,
      reason: 'invalid_format',
      message: formatValidation.error,
    });
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return NextResponse.json({
      subdomain,
      domainZone: zone,
      fullDomain: `${subdomain}.${zone}`,
      available: false,
      reason: 'reserved',
      message: `"${subdomain}" sistem tarafından rezerve edilmiştir ve alınamaz.`,
    });
  }

  // Pre-configured system demo taken subdomains
  const takenList = ['demo', 'admin', 'test', 'portal', 'status'];
  if (takenList.includes(subdomain) && zone === 'xias.tr') {
    return NextResponse.json({
      subdomain,
      domainZone: zone,
      fullDomain: `${subdomain}.${zone}`,
      available: false,
      reason: 'taken',
      message: `"${subdomain}.${zone}" daha önce başka bir kullanıcı tarafından alınmış.`,
    });
  }

  return NextResponse.json({
    subdomain,
    domainZone: zone,
    fullDomain: `${subdomain}.${zone}`,
    available: true,
    reason: 'available',
    message: `Tebrikler! "${subdomain}.${zone}" şu anda müsait ve ücretsiz kaydedilebilir.`,
  });
}
