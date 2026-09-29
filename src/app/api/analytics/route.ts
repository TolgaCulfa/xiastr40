import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || '';
  const timeRange = searchParams.get('timeRange') || '24h';

  try {
    let interval = "1 day";
    if (timeRange === '7d') interval = "7 days";
    if (timeRange === '30d') interval = "30 days";

    // If database connection is active, query real metrics
    const statsResult = await query(`
      SELECT 
        COUNT(*)::int AS total_requests,
        COUNT(DISTINCT ip_address)::int AS unique_visitors,
        COUNT(CASE WHEN is_threat = TRUE THEN 1 END)::int AS threats_mitigated,
        COALESCE(SUM(bytes_sent), 0)::bigint AS total_bytes
      FROM xias_analytics_traffic
      WHERE (domain = $1 OR $1 = '')
        AND timestamp >= NOW() - INTERVAL '${interval}'
    `, [domain]);

    const stats = statsResult?.rows[0] || {
      total_requests: 0,
      unique_visitors: 0,
      threats_mitigated: 0,
      total_bytes: 0,
    };

    // Calculate human readable bandwidth
    const bytes = Number(stats.total_bytes || 0);
    let bandwidthStr = '0 MB';
    if (bytes >= 1024 * 1024 * 1024) {
      bandwidthStr = `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else if (bytes >= 1024 * 1024) {
      bandwidthStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      bandwidthStr = `${(bytes / 1024).toFixed(0)} KB`;
    }

    // Time buckets for line chart (12 buckets)
    const timelineResult = await query(`
      SELECT 
        TO_CHAR(bucket, 'HH24:00') AS hour_label,
        COUNT(t.id)::int AS req_count
      FROM generate_series(
        NOW() - INTERVAL '${interval}',
        NOW(),
        INTERVAL '${timeRange === '24h' ? '2 hours' : timeRange === '7d' ? '14 hours' : '60 hours'}'
      ) AS bucket
      LEFT JOIN xias_analytics_traffic t ON 
        t.timestamp >= bucket 
        AND t.timestamp < bucket + INTERVAL '${timeRange === '24h' ? '2 hours' : timeRange === '7d' ? '14 hours' : '60 hours'}'
        AND (t.domain = $1 OR $1 = '')
      GROUP BY bucket
      ORDER BY bucket ASC
      LIMIT 12
    `, [domain]);

    const timeline = timelineResult?.rows?.map(r => ({
      label: r.hour_label,
      requests: Number(r.req_count || 0)
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        totalRequests: Number(stats.total_requests || 0),
        uniqueVisitors: Number(stats.unique_visitors || 0),
        threatsMitigated: Number(stats.threats_mitigated || 0),
        bandwidth: bandwidthStr,
        timeline: timeline.length > 0 ? timeline : [
          { label: '00:00', requests: 0 },
          { label: '02:00', requests: 0 },
          { label: '04:00', requests: 0 },
          { label: '06:00', requests: 0 },
          { label: '08:00', requests: 0 },
          { label: '10:00', requests: 0 },
          { label: '12:00', requests: 0 },
          { label: '14:00', requests: 0 },
          { label: '16:00', requests: 0 },
          { label: '18:00', requests: 0 },
          { label: '20:00', requests: 0 },
          { label: '22:00', requests: 0 }
        ]
      }
    });
  } catch (error: any) {
    console.error('Analytics DB query error:', error);
    // If DB is offline or table empty, return clean zero metrics - NEVER FAKE DATA
    return NextResponse.json({
      success: true,
      data: {
        totalRequests: 0,
        uniqueVisitors: 0,
        threatsMitigated: 0,
        bandwidth: '0 MB',
        timeline: [
          { label: '00:00', requests: 0 },
          { label: '02:00', requests: 0 },
          { label: '04:00', requests: 0 },
          { label: '06:00', requests: 0 },
          { label: '08:00', requests: 0 },
          { label: '10:00', requests: 0 },
          { label: '12:00', requests: 0 },
          { label: '14:00', requests: 0 },
          { label: '16:00', requests: 0 },
          { label: '18:00', requests: 0 },
          { label: '20:00', requests: 0 },
          { label: '22:00', requests: 0 }
        ]
      }
    });
  }
}
