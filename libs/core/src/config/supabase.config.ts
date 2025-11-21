import { SupabaseConfig } from '@helix-ai/types';

// libs/shared/config/src/config/supabase.config.ts

export const supabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  // Fallback to POSTGRES_HOST if SUPABASE_HOST is not set
  host: process.env.SUPABASE_HOST || process.env.POSTGRES_HOST || '',
  postgres: {
    url: process.env.POSTGRES_URL || '',
    prismaUrl: process.env.POSTGRES_PRISMA_URL || '',
    urlNonPooling: process.env.POSTGRES_URL_NON_POOLING || '',
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DATABASE || '',
  },
  public: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
};
