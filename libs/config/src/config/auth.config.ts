import type { AuthConfig } from '../types/auth';

export const authConfig: AuthConfig = {
    nextAuth: {
      secret: process.env.NEXTAUTH_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
}