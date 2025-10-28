import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 환경변수에서 API 키 가져오기 (서버사이드에서만)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apiKey: apiKey
    });

  } catch (error) {
    console.error('Map script API error:', error);
    return NextResponse.json(
      { error: 'Failed to get API key' },
      { status: 500 }
    );
  }
}