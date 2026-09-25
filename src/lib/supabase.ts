import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('YOUR_') &&
    supabaseUrl.startsWith('http')
);

/** AsyncStorage works on native + web; SecureStore is native-only. */
const storage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
  }
  return client;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          created_at: string;
        };
      };
      agencies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string;
          cover_url: string;
          bio: string;
          verified: boolean;
          rating: number;
          review_count: number;
          phone: string;
          whatsapp: string;
          email: string;
          counties: string[];
          years_active: number;
          response_rate: number;
          featured: boolean;
          created_at: string;
        };
      };
      properties: {
        Row: {
          id: string;
          agency_id: string;
          title: string;
          description: string;
          transaction_type: string;
          property_type: string;
          price_kes: number;
          rent_period: string | null;
          bedrooms: number;
          bathrooms: number;
          sqm: number | null;
          parking: number | null;
          county: string;
          city: string;
          estate: string;
          lat: number;
          lng: number;
          amenities: string[];
          images: string[];
          featured: boolean;
          status: string;
          created_at: string;
        };
      };
      favorites: {
        Row: {
          user_id: string;
          property_id: string;
          created_at: string;
        };
      };
      leads: {
        Row: {
          id: string;
          property_id: string;
          agency_id: string;
          user_id: string | null;
          name: string | null;
          phone: string | null;
          message: string;
          status: string;
          created_at: string;
        };
      };
    };
  };
};
