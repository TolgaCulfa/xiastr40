import { NextRequest, NextResponse } from 'next/server';
import { testCloudflareToken } from '@/lib/cloudflare';

export async function GET() {
  try {
    const token = process.env.CLOUDFLARE_API_TOKEN;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Cloudflare API Token ortam değişkeninde bulunamadı.' }, { status: 400 });
    }
    const result = await testCloudflareToken(token);
    return NextResponse.json({
      ...result,
      tokenMasked: `${token.substring(0, 8)}...${token.slice(-4)}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.apiToken || process.env.CLOUDFLARE_API_TOKEN;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Cloudflare API Token belirtilmedi.' }, { status: 400 });
    }

    const result = await testCloudflareToken(token);
    return NextResponse.json({
      ...result,
      tokenMasked: `${token.substring(0, 8)}...${token.slice(-4)}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

