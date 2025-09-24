export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          description: string | null;
          category: 'gif' | 'video' | 'storybook' | 'photo';
          file_url: string;
          thumbnail_url: string | null;
          is_featured: boolean;
          view_count: number;
          download_count: number;
          ai_model: string | null;
          prompt: string | null;
          generation_details: Json | null;
          anonymous_likes_count: number;
          comments_count: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: 'gif' | 'video' | 'storybook' | 'photo';
          file_url: string;
          thumbnail_url?: string | null;
          is_featured?: boolean;
          view_count?: number;
          download_count?: number;
          ai_model?: string | null;
          prompt?: string | null;
          generation_details?: Json | null;
          anonymous_likes_count?: number;
          comments_count?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: 'gif' | 'video' | 'storybook' | 'photo';
          file_url?: string;
          thumbnail_url?: string | null;
          is_featured?: boolean;
          view_count?: number;
          download_count?: number;
          ai_model?: string | null;
          prompt?: string | null;
          generation_details?: Json | null;
          anonymous_likes_count?: number;
          comments_count?: number;
        };
      };
      likes: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          post_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          post_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          post_id?: string;
        };
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          clerk_id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          clerk_id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          created_at: string;
          post_id: string;
          user_id: string | null;
          anonymous_name: string | null;
          anonymous_id: string | null;
          content: string;
          is_anonymous: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          post_id: string;
          user_id?: string | null;
          anonymous_name?: string | null;
          anonymous_id?: string | null;
          content: string;
          is_anonymous?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          post_id?: string;
          user_id?: string | null;
          anonymous_name?: string | null;
          anonymous_id?: string | null;
          content?: string;
          is_anonymous?: boolean;
        };
      };
      hashtags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          usage_count: number;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          usage_count?: number;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          usage_count?: number;
        };
      };
      post_hashtags: {
        Row: {
          id: string;
          post_id: string;
          hashtag_id: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          hashtag_id: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          hashtag_id?: string;
        };
      };
      anonymous_likes: {
        Row: {
          id: string;
          created_at: string;
          post_id: string;
          session_id: string;
          ip_hash: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          post_id: string;
          session_id: string;
          ip_hash?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          post_id?: string;
          session_id?: string;
          ip_hash?: string | null;
        };
      };
      ai_models: {
        Row: {
          id: string;
          name: string;
          provider: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          provider?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      posts_with_metrics: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          file_url: string;
          thumbnail_url: string | null;
          user_id: string;
          username: string;
          avatar_url: string | null;
          ai_model: string | null;
          prompt: string | null;
          authenticated_likes_count: number;
          anonymous_likes_count: number;
          total_likes_count: number;
          comments_count: number;
          hashtags: string[];
          view_count: number;
          download_count: number;
          created_at: string;
        };
      };
      weekly_top_posts: {
        Row: {
          id: string;
          title: string;
          category: string;
          file_url: string;
          thumbnail_url: string | null;
          user_id: string;
          username: string;
          likes_count: number;
          created_at: string;
        };
      };
      top_liked_posts: {
        Row: {
          id: string;
          title: string;
          category: string;
          file_url: string;
          thumbnail_url: string | null;
          user_id: string;
          username: string;
          likes_count: number;
          created_at: string;
        };
      };
    };
    Functions: {
      get_post_with_likes: {
        Args: { post_id: string };
        Returns: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          file_url: string;
          thumbnail_url: string | null;
          user_id: string;
          username: string;
          avatar_url: string | null;
          likes_count: number;
          view_count: number;
          download_count: number;
          created_at: string;
        };
      };
      toggle_anonymous_like: {
        Args: { p_post_id: string; p_session_id: string; p_ip_hash?: string };
        Returns: boolean;
      };
      add_hashtags_to_post: {
        Args: { p_post_id: string; p_hashtags: string[] };
        Returns: void;
      };
    };
    Enums: {
      post_category: 'gif' | 'video' | 'storybook' | 'photo';
    };
  };
}

export type Post = Database['public']['Tables']['posts']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Hashtag = Database['public']['Tables']['hashtags']['Row'];
export type PostHashtag = Database['public']['Tables']['post_hashtags']['Row'];
export type AnonymousLike = Database['public']['Tables']['anonymous_likes']['Row'];
export type AIModel = Database['public']['Tables']['ai_models']['Row'];
export type PostCategory = Database['public']['Enums']['post_category'];
export type PostWithMetrics = Database['public']['Views']['posts_with_metrics']['Row'];