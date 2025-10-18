import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkPosts() {
  console.log('Checking database connection...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  try {
    // Check posts table
    console.log('\n=== Checking posts table ===');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
    } else {
      console.log(`Found ${posts?.length || 0} posts in database`);
      if (posts && posts.length > 0) {
        console.log('\nPosts:');
        posts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (by ${post.username || post.user_id})`);
          console.log(`   Category: ${post.category}, Model: ${post.ai_model || 'N/A'}`);
          console.log(`   Created: ${post.created_at}`);
        });
      }
    }

    // Check posts_with_metrics view
    console.log('\n=== Checking posts_with_metrics view ===');
    const { data: postsWithMetrics, error: metricsError } = await supabase
      .from('posts_with_metrics')
      .select('*')
      .order('created_at', { ascending: false });

    if (metricsError) {
      console.error('Error fetching posts_with_metrics:', metricsError);
    } else {
      console.log(`Found ${postsWithMetrics?.length || 0} posts in posts_with_metrics view`);
      if (postsWithMetrics && postsWithMetrics.length > 0) {
        console.log('\nPosts with metrics:');
        postsWithMetrics.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`);
          console.log(
            `   Views: ${post.view_count}, Likes: ${post.total_likes_count}, Comments: ${post.comment_count}`
          );
        });
      }
    }

    // Check if the view exists
    console.log('\n=== Checking database objects ===');
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .in('table_name', ['posts', 'posts_with_metrics'])
      .eq('table_schema', 'public');

    console.log('Database objects:', tables);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkPosts();
