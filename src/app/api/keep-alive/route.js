import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Supabase 무료 플랜 pause 방지용 헬스체크.
 * Vercel Cron(vercel.json)에서 주기적으로 호출됩니다.
 *
 * CRON_SECRET 설정 시 Authorization: Bearer <CRON_SECRET> 필요.
 * Vercel Cron 호출 시 해당 헤더가 자동으로 붙습니다.
 */
export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.headers.get('x-cron-secret');

    if (token !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const { error } = await supabaseAdmin
      .from('setting')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Keep-alive Supabase error:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
