import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 특정 Theme 조회
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('theme')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Theme not found' },
          { status: 404 }
        );
      }
      console.error('Theme fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch theme', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Theme GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Theme 수정
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const updateData = { title };
    if (order !== undefined && order !== null) {
      updateData.order = order;
    }

    const { data, error } = await supabaseAdmin
      .from('theme')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Theme update error:', error);
      return NextResponse.json(
        { error: 'Failed to update theme', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Theme updated successfully'
    });

  } catch (error) {
    console.error('Theme PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Theme 삭제
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('theme')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Theme delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete theme', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Theme deleted successfully'
    });

  } catch (error) {
    console.error('Theme DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
