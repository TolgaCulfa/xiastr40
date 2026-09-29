export type DomainZone = 'xias.tr' | 'xias.info';

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'SRV' | 'CAA' | 'NS' | 'PTR';

export interface DnsRecord {
  id: string;
  subdomainId: string;
  type: DnsRecordType;
  name: string; // e.g. "@" or "api"
  content: string; // IP or target hostname
  ttl: number; // 60, 300, 3600 or 1 for auto
  proxied: boolean; // Cloudflare Orange Cloud (CDN/DDoS) vs Grey Cloud (DNS only)
  priority?: number; // for MX & SRV
  weight?: number; // for SRV
  port?: number; // for SRV
  tag?: string; // for CAA (issue, issuewild, iodef)
  flags?: number; // for CAA (0 or 128)
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

export type MaintenanceTemplate = 'minimal-dark' | 'corporate' | 'cloudflare-503' | 'custom-html';

export interface MaintenanceConfig {
  enabled: boolean;
  template: MaintenanceTemplate;
  title?: string;
  message?: string;
  customHtml?: string;
  contactEmail?: string;
  estimatedMinutes?: number;
  updatedAt: string;
}

export interface SslCertificate {
  issued: boolean;
  issuer: string;
  validFrom: string;
  validUntil: string;
  cipher: string;
  serialNumber: string;
  autoRenew: boolean;
}

export interface DomainAnalytics {
  totalRequests: number;
  uniqueVisitors: number;
  threatsBlocked: number;
  bandwidthBytes: number;
  cacheHitRate: number;
  history24h: { time: string; requests: number; threats: number }[];
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
  maintenanceConfig?: MaintenanceConfig;
  sslCert?: SslCertificate;
  analytics?: DomainAnalytics;
  isCustomDomain?: boolean;
  nameserverStatus?: 'pending' | 'active';
  assignedNameservers?: string[];
  lastNsCheckAt?: string;
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
