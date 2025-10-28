import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { domain, referer } = await request.json();

    // 허용된 도메인 목록 (환경변수에서 가져오거나 하드코딩)
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      'yourdomain.com', // 실제 도메인으로 변경
      'yourdomain.vercel.app' // Vercel 배포 도메인
    ];

    // 도메인 검증
    const isValidDomain = allowedDomains.some(allowedDomain =>
      domain.includes(allowedDomain) || referer?.includes(allowedDomain)
    );

    if (!isValidDomain) {
      return NextResponse.json({
        error: 'Unauthorized domain',
        allowed: false
      }, { status: 403 });
    }

    // API 키 반환 (도메인이 유효한 경우에만)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    return NextResponse.json({
      apiKey,
      allowed: true,
      domain: domain
    });

  } catch (error) {
    console.error('Error validating domain:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
