import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 특정 Icon 조회
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Icon ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('icon')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Icon not found' },
          { status: 404 }
        );
      }
      console.error('Icon fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch icon', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Icon GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Icon 수정
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { img } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Icon ID is required' },
        { status: 400 }
      );
    }

    if (!img) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('icon')
      .update({ img })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Icon update error:', error);
      return NextResponse.json(
        { error: 'Failed to update icon', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Icon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Icon updated successfully'
    });

  } catch (error) {
    console.error('Icon PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Icon 삭제
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Icon ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('icon')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Icon delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete icon', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Icon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Icon deleted successfully'
    });

  } catch (error) {
    console.error('Icon DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}



