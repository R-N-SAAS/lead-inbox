import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase Client (für React Components)
export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// Server-side Supabase Client (für API Routes)
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Type-safe Database Types
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          org_id: string;
          name: string | null;
          email: string;
          phone: string | null;
          message: string | null;
          status: string;
          priority: string;
          source: string;
          website: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          scraped_from: string | null;
          raw_data: Record<string, any> | null;
          is_duplicate: boolean;
          duplicate_of: string | null;
          first_reply_sent_at: string | null;
          last_contact_at: string | null;
          custom_fields: Record<string, any> | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          lead_id: string;
          org_id: string;
          direction: 'inbound' | 'outbound';
          channel: string;
          subject: string | null;
          content: string;
          sent_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          replied_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      campaigns: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          subject: string;
          body_html: string;
          body_text: string | null;
          from_name: string;
          from_email: string;
          reply_to: string | null;
          status: string;
          settings: Record<string, any>;
          stats: Record<string, any>;
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
      };
      campaign_recipients: {
        Row: {
          id: string;
          campaign_id: string;
          lead_id: string;
          status: string;
          sent_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          replied_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['campaign_recipients']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['campaign_recipients']['Insert']>;
      };
      follow_up_sequences: {
        Row: {
          id: string;
          campaign_id: string;
          step_number: number;
          delay_days: number;
          subject: string;
          body_html: string;
          body_text: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['follow_up_sequences']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['follow_up_sequences']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: string | null;
          website: string | null;
          email_settings: Record<string, any> | null;
          widget_settings: Record<string, any> | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: string;
          org_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
};
