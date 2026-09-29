import { ClaimedSubdomain, DnsRecord, DomainZone, UrlRedirect, CloudflareConfig } from './types';

export const RESERVED_SUBDOMAINS = new Set([
  'admin', 'administrator', 'root', 'api', 'mail', 'email', 'smtp', 'pop', 'imap',
  'ns1', 'ns2', 'ns3', 'ns4', 'dns', 'dns1', 'dns2',
  'cloudflare', 'verifications', 'ssl', 'cpanel', 'whm', 'webmail',
  'internal', 'status', 'auth', 'login', 'signup', 'billing', 'support',
  'gateway', 'proxy', 'router', 'server', 'edge', 'origin'
]);

export const DEFAULT_CLOUDFLARE_CONFIG: CloudflareConfig = {
  apiToken: '',
  zoneIdXiasTr: '',
  zoneIdXiasInfo: '',
  autoProxyNewRecords: true,
};

export const INITIAL_SUBDOMAINS: ClaimedSubdomain[] = [
  {
    id: 'sub-1',
    name: 'dev',
    domainZone: 'xias.tr',
    fullDomain: 'dev.xias.tr',
    description: 'Portfolio & Next.js Vercel Deploy',
    status: 'active',
    isProxied: true,
    lastPingMs: 14,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    dnsRecords: [
      {
        id: 'rec-1',
        subdomainId: 'sub-1',
        type: 'CNAME',
        name: '@',
        content: 'cname.vercel-dns.com',
        ttl: 1,
        proxied: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'rec-2',
        subdomainId: 'sub-1',
        type: 'TXT',
        name: '_vercel',
        content: 'vc-domain-verify=dev.xias.tr',
        ttl: 300,
        proxied: false,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      }
    ],
  },
  {
    id: 'sub-2',
    name: 'app',
    domainZone: 'xias.info',
    fullDomain: 'app.xias.info',
    description: 'Production VPS Backend (FastAPI / Docker)',
    status: 'active',
    isProxied: true,
    lastPingMs: 22,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dnsRecords: [
      {
        id: 'rec-3',
        subdomainId: 'sub-2',
        type: 'A',
        name: '@',
        content: '185.199.108.153',
        ttl: 1,
        proxied: true,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      }
    ],
  },
  {
    id: 'sub-3',
    name: 'github',
    domainZone: 'xias.tr',
    fullDomain: 'github.xias.tr',
    description: 'Direct 301 URL Forwarding to GitHub Profile',
    status: 'active',
    isProxied: true,
    lastPingMs: 9,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    dnsRecords: [
      {
        id: 'rec-4',
        subdomainId: 'sub-3',
        type: 'A',
        name: '@',
        content: '192.0.2.1', // dummy IP for Cloudflare page rule redirect
        ttl: 1,
        proxied: true,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    ],
    redirect: {
      id: 'redir-1',
      subdomainId: 'sub-3',
      destinationUrl: 'https://github.com/devtolga',
      statusCode: 301,
      preservePath: true,
      active: true,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    }
  }
];

const LOCAL_STORAGE_KEY = 'xias_cloud_subdomains_v1';
const CF_CONFIG_KEY = 'xias_cloudflare_config_v1';

export function getStoredSubdomains(): ClaimedSubdomain[] {
  if (typeof window === 'undefined') {
    return INITIAL_SUBDOMAINS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SUBDOMAINS));
      return INITIAL_SUBDOMAINS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read stored subdomains', e);
    return INITIAL_SUBDOMAINS;
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
