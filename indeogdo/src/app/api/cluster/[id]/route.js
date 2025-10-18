import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 특정 Cluster 조회
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Cluster ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('cluster')
      .select(`
        *,
        theme:theme_id (
          id,
          title
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Cluster not found' },
          { status: 404 }
        );
      }
      console.error('Cluster fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cluster', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Cluster GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Cluster 수정
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, theme_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Cluster ID is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // theme_id가 변경되는 경우 유효성 검사
    if (theme_id) {
      const { data: themeExists, error: themeError } = await supabaseAdmin
        .from('theme')
        .select('id')
        .eq('id', theme_id)
        .single();

      if (themeError || !themeExists) {
        return NextResponse.json(
          { error: 'Invalid theme ID' },
          { status: 400 }
        );
      }
    }

    const updateData = { title };
    if (theme_id) {
      updateData.theme_id = theme_id;
    }

    const { data, error } = await supabaseAdmin
      .from('cluster')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        theme:theme_id (
          id,
          title
        )
      `);

    if (error) {
      console.error('Cluster update error:', error);
      return NextResponse.json(
        { error: 'Failed to update cluster', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Cluster not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Cluster updated successfully'
    });

  } catch (error) {
    console.error('Cluster PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Cluster 삭제
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Cluster ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('cluster')
      .delete()
      .eq('id', id)
      .select(`
        *,
        theme:theme_id (
          id,
          title
        )
      `);

    if (error) {
      console.error('Cluster delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete cluster', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Cluster not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Cluster deleted successfully'
    });

  } catch (error) {
    console.error('Cluster DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
