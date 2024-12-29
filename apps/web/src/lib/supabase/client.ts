import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

type Platform = Database['public']['Tables']['platforms']['Row'];
type PlatformInsert = Database['public']['Tables']['platforms']['Insert'];
type PlatformUpdate = Database['public']['Tables']['platforms']['Update'];

type Language = Database['public']['Tables']['programming_languages']['Row'];
type LanguageInsert = Database['public']['Tables']['programming_languages']['Insert'];
type LanguageUpdate = Database['public']['Tables']['programming_languages']['Update'];

export const db = {
  platforms: {
    async getAll() {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('name');

      if (error) throw new Error(`Failed to fetch platforms: ${error.message}`);
      if (!data) throw new Error('Failed to fetch platforms: No data returned');

      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(`Failed to fetch platform: ${error.message}`);
      if (!data) throw new Error('Failed to fetch platform: No data returned');

      return data;
    },

    async create(platform: PlatformInsert): Promise<Platform> {
      const { data, error } = await supabase
        .from('platforms')
        .insert(platform)
        .select()
        .single();

      if (error) throw new Error(`Failed to create platform: ${error.message}`);
      if (!data) throw new Error('Failed to create platform: No data returned');

      return data;
    },

    async update(id: string, updates: PlatformUpdate): Promise<Platform> {
      const { data, error } = await supabase
        .from('platforms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update platform: ${error.message}`);
      if (!data) throw new Error('Failed to update platform: No data returned');

      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Failed to delete platform: ${error.message}`);
    }
  },

  programmingLanguages: {
    async getAll() {
      const { data, error } = await supabase
        .from('programming_languages')
        .select('*')
        .order('name');

      if (error) throw new Error(`Failed to fetch programming languages: ${error.message}`);
      if (!data) throw new Error('Failed to fetch programming languages: No data returned');

      return data;
    },

    async getByName(name: string) {
      const { data, error } = await supabase
        .from('programming_languages')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw new Error(`Failed to fetch programming language: ${error.message}`);
      if (!data) throw new Error('Failed to fetch programming language: No data returned');

      return data;
    },

    async create(language: LanguageInsert): Promise<Language> {
      const { data, error } = await supabase
        .from('programming_languages')
        .insert(language)
        .select()
        .single();

      if (error) throw new Error(`Failed to create programming language: ${error.message}`);
      if (!data) throw new Error('Failed to create programming language: No data returned');

      return data;
    },

    async update(id: string, updates: LanguageUpdate): Promise<Language> {
      const { data, error } = await supabase
        .from('programming_languages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update programming language: ${error.message}`);
      if (!data) throw new Error('Failed to update programming language: No data returned');

      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('programming_languages')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Failed to delete programming language: ${error.message}`);
    }
  }
};
