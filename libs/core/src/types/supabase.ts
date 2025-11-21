export interface SupabaseConfig {
    url?: string;
    jwtSecret?: string;
    serviceRoleKey?: string;
    host?: string;
    postgres: {
      url?: string;
      prismaUrl?: string;
      urlNonPooling?: string;
      user?: string;
      password?: string;
      database?: string;
    };
    public: {
      url?: string; // NEXT_PUBLIC_SUPABASE_URL
      anonKey?: string; // NEXT_PUBLIC_SUPABASE_ANON_KEY
    };
}