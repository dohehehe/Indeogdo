import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Sites 테이블 전체 조회 (cluster, icon 정보 포함)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const offset = searchParams.get('offset') || '0';
    const clusterId = searchParams.get('cluster_id'); // 특정 클러스터의 사이트만 조회
    const iconId = searchParams.get('icon_id'); // 특정 아이콘의 사이트만 조회

    let query = supabaseAdmin
      .from('sites')
      .select(`
        *,
        cluster:cluster_id (
          id,
          title
        ),
        icon:icon_id (
          id,
          img
        )
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // 특정 클러스터의 사이트만 조회하는 경우
    if (clusterId) {
      query = query.eq('cluster_id', clusterId);
    }

    // 특정 아이콘의 사이트만 조회하는 경우
    if (iconId) {
      query = query.eq('icon_id', iconId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Sites fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sites', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Sites GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Site 생성
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, address, latitude, longitude, contents, cluster_id, icon_id } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!cluster_id) {
      return NextResponse.json(
        { error: 'Cluster ID is required' },
        { status: 400 }
      );
    }

    // cluster_id가 유효한지 확인
    const { data: clusterExists, error: clusterError } = await supabaseAdmin
      .from('cluster')
      .select('id')
      .eq('id', cluster_id)
      .single();

    if (clusterError || !clusterExists) {
      return NextResponse.json(
        { error: 'Invalid cluster ID' },
        { status: 400 }
      );
    }

    // icon_id가 제공된 경우 유효성 확인
    if (icon_id) {
      const { data: iconExists, error: iconError } = await supabaseAdmin
        .from('icon')
        .select('id')
        .eq('id', icon_id)
        .single();

      if (iconError || !iconExists) {
        return NextResponse.json(
          { error: 'Invalid icon ID' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('sites')
      .insert([{
        title,
        address,
        latitude,
        longitude,
        contents,
        cluster_id,
        icon_id
      }])
      .select(`
        *,
        cluster:cluster_id (
          id,
          title
        ),
        icon:icon_id (
          id,
          img
        )
      `);

    if (error) {
      console.error('Site create error:', error);
      return NextResponse.json(
        { error: 'Failed to create site', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Site created successfully'
    });

  } catch (error) {
    console.error('Sites POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}



