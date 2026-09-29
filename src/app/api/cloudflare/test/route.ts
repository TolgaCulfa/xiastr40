import { NextRequest, NextResponse } from 'next/server';
import { testCloudflareToken } from '@/lib/cloudflare';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.apiToken || process.env.CLOUDFLARE_API_TOKEN;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Cloudflare API Token bulunamadı. Lütfen token girin veya .env.local dosyasına ekleyin.' },
        { status: 400 }
      );
    }

    const result = await testCloudflareToken(token);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
