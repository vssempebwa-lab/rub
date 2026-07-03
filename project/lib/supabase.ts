import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'photographer' | 'client';
          phone: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'photographer' | 'client';
          phone?: string | null;
          bio?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'photographer' | 'client';
          phone?: string | null;
          bio?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
      };
      services: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          features: string[] | null;
          starting_price: number | null;
          image_url: string | null;
          sort_order: number;
          created_at: string;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          client_id: string | null;
          photographer_id: string | null;
          category_id: string | null;
          event_date: string | null;
          location: string | null;
          description: string | null;
          cover_image_url: string | null;
          gallery_url: string | null;
          qr_code_url: string | null;
          status: 'draft' | 'active' | 'completed' | 'archived';
          password: string | null;
          expiration_date: string | null;
          download_limit: number;
          allow_favorites: boolean;
          allow_downloads: boolean;
          allow_comments: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      albums: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
      };
      photos: {
        Row: {
          id: string;
          album_id: string | null;
          event_id: string;
          url: string;
          thumbnail_url: string | null;
          watermarked_url: string | null;
          filename: string | null;
          file_size: number | null;
          width: number | null;
          height: number | null;
          mime_type: string | null;
          sort_order: number;
          created_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          event_date: string | null;
          event_type: string | null;
          package_name: string | null;
          message: string | null;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          created_at: string;
          updated_at: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          photo_id: string;
          event_id: string;
          client_name: string | null;
          client_email: string | null;
          created_at: string;
        };
      };
      comments: {
        Row: {
          id: string;
          photo_id: string;
          event_id: string;
          author_name: string | null;
          author_email: string | null;
          content: string;
          created_at: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          photo_id: string | null;
          event_id: string | null;
          downloader_name: string | null;
          downloader_email: string | null;
          download_type: string;
          created_at: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          client_name: string;
          client_title: string | null;
          content: string;
          rating: number;
          image_url: string | null;
          is_featured: boolean;
          created_at: string;
        };
      };
      pricing_packages: {
        Row: {
          id: string;
          name: string;
          tier: string;
          price: number | null;
          description: string | null;
          features: string[] | null;
          is_popular: boolean;
          sort_order: number;
          created_at: string;
        };
      };
    };
  };
};
