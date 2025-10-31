import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 특정 Site 조회
export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
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
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Site not found' },
          { status: 404 }
        );
      }
      console.error('Site fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch site', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Site GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Site 수정
export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, address, latitude, longitude, contents, cluster_id, icon_id, order } = body;
    const normalizedClusterId = (cluster_id === '' ? null : cluster_id);
    const normalizedIconId = (icon_id === '' ? null : icon_id);

    if (!id) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // cluster_id가 변경되는 경우 유효성 검사
    if (normalizedClusterId !== undefined && normalizedClusterId !== null) {
      const { data: clusterExists, error: clusterError } = await supabaseAdmin
        .from('cluster')
        .select('id')
        .eq('id', normalizedClusterId)
        .single();

      if (clusterError || !clusterExists) {
        return NextResponse.json(
          { error: 'Invalid cluster ID' },
          { status: 400 }
        );
      }
    }

    // icon_id가 변경되는 경우 유효성 검사
    if (normalizedIconId !== undefined && normalizedIconId !== null) {
      const { data: iconExists, error: iconError } = await supabaseAdmin
        .from('icon')
        .select('id')
        .eq('id', normalizedIconId)
        .single();

      if (iconError || !iconExists) {
        return NextResponse.json(
          { error: 'Invalid icon ID' },
          { status: 400 }
        );
      }
    }

    const updateData = { title };
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (contents !== undefined) updateData.contents = contents;
    if (normalizedClusterId !== undefined) updateData.cluster_id = normalizedClusterId;
    if (normalizedIconId !== undefined) updateData.icon_id = normalizedIconId;
    if (order !== undefined && order !== null) updateData.order = order;

    const { data, error } = await supabaseAdmin
      .from('sites')
      .update(updateData)
      .eq('id', id)
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
      console.error('Site update error:', error);
      return NextResponse.json(
        { error: 'Failed to update site', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Site updated successfully'
    });

  } catch (error) {
    console.error('Site PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Site 삭제
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('sites')
      .delete()
      .eq('id', id)
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
      console.error('Site delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete site', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Site deleted successfully'
    });

  } catch (error) {
    console.error('Site DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
