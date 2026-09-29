import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const useSsl = connectionString.includes('sslmode=require');
    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const p = getDbPool();
  if (!p) {
    return null;
  }
  return p.query(text, params);
}
