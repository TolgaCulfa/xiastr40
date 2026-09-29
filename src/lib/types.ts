export type DomainZone = 'xias.tr' | 'xias.info';

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';

export interface DnsRecord {
  id: string;
  subdomainId: string;
  type: DnsRecordType;
  name: string; // e.g. "@" or "api"
  content: string; // IP or target hostname
  ttl: number; // 60, 300, 3600 or 1 for auto
  proxied: boolean; // Cloudflare Orange Cloud (CDN/DDoS) vs Grey Cloud (DNS only)
  priority?: number; // for MX
  createdAt: string;
  updatedAt: string;
}

export interface UrlRedirect {
  id: string;
  subdomainId: string;
  destinationUrl: string;
  statusCode: 301 | 302;
  preservePath: boolean;
  active: boolean;
  createdAt: string;
}

export interface ClaimedSubdomain {
  id: string;
  name: string; // e.g. "tolga"
  domainZone: DomainZone; // 'xias.tr' | 'xias.info'
  fullDomain: string; // 'tolga.xias.tr'
  description?: string;
  status: 'active' | 'propagating' | 'paused';
  dnsRecords: DnsRecord[];
  redirect?: UrlRedirect;
  createdAt: string;
  lastPingMs?: number;
  isProxied: boolean;
  ddosShieldEnabled: boolean; // Cloudflare Under Attack Mode Challenge
}

export interface CloudflareConfig {
  apiToken: string;
  zoneIdXiasTr: string;
  zoneIdXiasInfo: string;
  autoProxyNewRecords: boolean;
}

export interface AvailabilityResult {
  subdomain: string;
  domainZone: DomainZone;
  fullDomain: string;
  available: boolean;
  reason?: 'available' | 'taken' | 'reserved' | 'invalid_format';
  message: string;
}
