import { DnsRecord, DomainZone } from './types';

export interface CloudflareApiParams {
  apiToken?: string;
  zoneId?: string;
}

export function getZoneIdForDomain(domainZone: DomainZone, envOverride?: { zoneXiasTr?: string; zoneXiasInfo?: string }): string {
  if (domainZone === 'xias.tr') {
    return envOverride?.zoneXiasTr || process.env.CLOUDFLARE_ZONE_ID_XIASTR || '';
  }
  return envOverride?.zoneXiasInfo || process.env.CLOUDFLARE_ZONE_ID_XIASINFO || '';
}

export async function testCloudflareToken(token: string): Promise<{ success: boolean; message: string }> {
  if (!token) {
    return { success: false, message: 'Cloudflare API Token belirtilmedi.' };
  }

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: 'Cloudflare API Token başarıyla doğrulandı.' };
    }
    return {
      success: false,
      message: data.errors?.[0]?.message || 'Cloudflare API Token geçersiz veya yetkisi yetersiz.',
    };
  } catch (error: any) {
    return { success: false, message: error.message || 'Cloudflare API sunucusuna bağlanılamadı.' };
  }
}

export async function syncRecordToCloudflare(
  record: DnsRecord,
  fullDomain: string,
  domainZone: DomainZone,
  customToken?: string,
  customZoneId?: string
): Promise<{ success: boolean; cloudflareId?: string; error?: string }> {
  const token = customToken || process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = customZoneId || getZoneIdForDomain(domainZone);

  // If credentials are not set up yet, simulate success cleanly
  if (!token || !zoneId) {
    return {
      success: true,
      cloudflareId: `mock_cf_${Date.now()}`,
      error: undefined,
    };
  }

  try {
    const recordName = record.name === '@' ? fullDomain : `${record.name}.${fullDomain}`;
    const payload = {
      type: record.type,
      name: recordName,
      content: record.content,
      ttl: record.ttl === 1 ? 1 : record.ttl, // 1 is 'automatic' in Cloudflare
      proxied: record.type === 'TXT' || record.type === 'MX' ? false : record.proxied,
      priority: record.priority,
      comment: 'Managed by XIAS Cloud Subdomain Platform',
    };

    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, cloudflareId: data.result?.id };
    }

    return {
      success: false,
      error: data.errors?.[0]?.message || 'Cloudflare DNS kaydı oluşturulamadı.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Cloudflare API çağrısı sırasında hata oluştu.',
    };
  }
}

export async function deleteRecordFromCloudflare(
  cloudflareRecordId: string,
  domainZone: DomainZone,
  customToken?: string,
  customZoneId?: string
): Promise<{ success: boolean; error?: string }> {
  const token = customToken || process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = customZoneId || getZoneIdForDomain(domainZone);

  if (!token || !zoneId || cloudflareRecordId.startsWith('mock_')) {
    return { success: true };
  }

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${cloudflareRecordId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return { success: res.ok && data.success, error: data.errors?.[0]?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
