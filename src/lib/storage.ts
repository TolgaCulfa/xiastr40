import { ClaimedSubdomain, DnsRecord, DomainZone, UrlRedirect, CloudflareConfig } from './types';

export const RESERVED_SUBDOMAINS = new Set([
  'admin', 'administrator', 'root', 'api', 'mail', 'email', 'smtp', 'pop', 'imap',
  'ns1', 'ns2', 'ns3', 'ns4', 'dns', 'dns1', 'dns2',
  'cloudflare', 'verifications', 'ssl', 'cpanel', 'whm', 'webmail',
  'internal', 'status', 'auth', 'login', 'signup', 'billing', 'support',
  'gateway', 'proxy', 'router', 'server', 'edge', 'origin'
]);

export const DEFAULT_CLOUDFLARE_CONFIG: CloudflareConfig = {
  apiToken: process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN || '',
  zoneIdXiasTr: '3c63f4f5930fc94160578dc3a3651912',
  zoneIdXiasInfo: 'b495538d749e90614c9b86c8abc1c2f5',
  autoProxyNewRecords: true,
};

// SIFIR SAHTE VERI - Tamamen gerçek kullanıcı verileriyle başlar
export const INITIAL_SUBDOMAINS: ClaimedSubdomain[] = [];

const LOCAL_STORAGE_KEY = 'xias_cloud_subdomains_v2';
const CF_CONFIG_KEY = 'xias_cloudflare_config_v2';

export function getStoredSubdomains(): ClaimedSubdomain[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredSubdomains(subdomains: ClaimedSubdomain[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subdomains));
  } catch (e) {
    console.error('Failed to save subdomains', e);
  }
}

export function getStoredCloudflareConfig(): CloudflareConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_CLOUDFLARE_CONFIG;
  }
  try {
    const raw = localStorage.getItem(CF_CONFIG_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CLOUDFLARE_CONFIG;
  } catch {
    return DEFAULT_CLOUDFLARE_CONFIG;
  }
}

export function saveStoredCloudflareConfig(config: CloudflareConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CF_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Cloudflare config', e);
  }
}

export function sanitizeSubdomainName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function validateSubdomainFormat(name: string): { valid: boolean; error?: string } {
  const clean = sanitizeSubdomainName(name);
  if (!clean) {
    return { valid: false, error: 'Subdomain boş bırakılamaz.' };
  }
  if (clean.length < 2) {
    return { valid: false, error: 'Subdomain en az 2 karakter olmalıdır.' };
  }
  if (clean.length > 63) {
    return { valid: false, error: 'Subdomain en fazla 63 karakter olabilir.' };
  }
  if (clean.startsWith('-') || clean.endsWith('-')) {
    return { valid: false, error: 'Subdomain tire (-) ile başlayamaz veya bitemez.' };
  }
  if (/^[0-9]+$/.test(clean)) {
    return { valid: false, error: 'Subdomain yalnızca rakamlardan oluşamaz.' };
  }
  return { valid: true };
}
