import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'created_at'; // created_at, view_count, likes_count
    const order = searchParams.get('order') || 'desc'; // asc, desc

    // Build query
    let query = supabase.from('posts_with_metrics').select('*').eq('user_id', userId);

    // Apply category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error } = await query;

    if (error) throw error;

    // Get total count for pagination
    let countQuery = supabase
      .from('posts_with_metrics')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}
