import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's database ID from clerk_id
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'created_at'; // created_at, view_count, likes_count
    const order = searchParams.get('order') || 'desc'; // asc, desc

    // Build query
    let query = supabase
      .from('posts_with_metrics')
      .select('*')
      .eq('user_id', (user as any).id);

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
      .eq('user_id', (user as any).id);

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
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error: any) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
