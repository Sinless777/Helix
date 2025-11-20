// libs/shared/config/src/config/auth.config.ts

import type { NextAuthOptions } from 'next-auth';
import type { User } from '@helix-ai/db';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createHash, randomUUID } from 'crypto';

type LoginResponse = {
  userId: string;
  sessionToken: string;
  expires: string;
};

const hashPassword = (email: string, password: string) =>
  createHash('sha256')
    .update(`${email.toLowerCase()}:${password}`, 'utf8')
    .digest('hex');

// Prefer explicit URL, fall back to dev default pointing at local user-service
const userServiceBase =
  process.env.USER_SERVICE_URL ??
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ??
  'http://localhost:3001/api';


async function getUserByEmail(email: string): Promise<User | null> {
  if (!userServiceBase) return null;
  const res = await fetch(
    `${userServiceBase}/users/email/${encodeURIComponent(email.toLowerCase())}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  );
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return (await res.json()) as User;
}

async function createUserFromOAuth(params: {
  email: string;
  displayName: string;
  provider: string;
  providerAccountId?: string | null;
  avatarUrl?: string | null;
}): Promise<User | null> {
  if (!userServiceBase) return null;
  const res = await fetch(`${userServiceBase}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email.toLowerCase(),
      displayName: params.displayName,
      metadata: {
        auth: {
          providers: [
            {
              provider: params.provider,
              providerAccountId: params.providerAccountId,
            },
          ],
          avatarUrl: params.avatarUrl,
        },
      },
    }),
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as User;
}

async function createSessionForUser(userId: string, ttlMs = 7 * 24 * 60 * 60 * 1000) {
  if (!userServiceBase) return null;
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + ttlMs).toISOString();

  const res = await fetch(`${userServiceBase}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      sessionToken,
      expires,
    }),
  });

  if (!res.ok) return null;

  return { sessionToken, expires };
}

export const authConfig: NextAuthOptions = {
  providers: [
    // --- OAuth providers ---

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),

    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),

    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),

    // --- Credentials provider: delegate to User Service /login ---

    CredentialsProvider({
      id: 'credentials',
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const baseUrl = process.env.USER_SERVICE_URL;
        if (!baseUrl) {
          console.error(
            '[NextAuth] Missing USER_SERVICE_URL for credentials authorize()',
          );
          return null;
        }

        const hashedPassword = hashPassword(
          credentials.email,
          credentials.password,
        );

        try {
          const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              hashedPassword,
            }),
          });

          if (!loginRes.ok) {
            // 401/403/etc → invalid credentials
            console.error(
              '[NextAuth] /login returned non-OK',
              loginRes.status,
              await loginRes.text().catch(() => ''),
            );
            return null;
          }

          const login = (await loginRes.json()) as LoginResponse;

          if (!login?.userId || !login.sessionToken) {
            console.error(
              '[NextAuth] /login response missing userId or sessionToken',
            );
            return null;
          }

          const userRes = await fetch(`${baseUrl}/users/${login.userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!userRes.ok) {
            console.error(
              '[NextAuth] /users/:id returned non-OK',
              userRes.status,
              await userRes.text().catch(() => ''),
            );
            return null;
          }

          const user = (await userRes.json()) as any;

          return {
            id: login.userId,
            email: user.email,
            name: user.displayName ?? user.email,
            displayName: user.displayName,
            roles: user.roles,
            orgId: user.orgId,
            sessionToken: login.sessionToken,
            sessionExpires: login.expires,
          };
        } catch (err) {
          console.error('[NextAuth] Error in credentials authorize():', err);
          return null;
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    generateSessionToken: () => {
      // Secure random session token
      return randomUUID();
    },
  },

  callbacks: {
    /**
     * signIn is called for ALL providers (OAuth + credentials).
     *
     * For OAuth providers we:
     *  - upsert the user in the User Service
     *  - create a session token there
     *  - attach that info to `user` so jwt() can store it in the token
     */
    async signIn({ user, account, profile }) {
      // credentials flow is fully handled in authorize()
      if (!account || account.provider === 'credentials') {
        return true;
      }

      if (!userServiceBase) {
        console.error(
          '[NextAuth] Missing USER_SERVICE_URL for OAuth sign-in callback',
        );
        // In dev, don't completely block sign-in so you can iterate
        if (process.env.NODE_ENV !== 'production') return true;
        return false;
      }

      try {
        const email =
          user.email ??
          (profile as any)?.email ??
          (profile as any)?.user?.email ??
          null;

        if (!email) {
          console.error(
            `[NextAuth] OAuth sign-in (${account.provider}) without email – refusing`,
            { profile },
          );
          return false;
        }

        const displayName =
          user.name ??
          (profile as any)?.name ??
          (profile as any)?.login ??
          (profile as any)?.username ??
          email;

        const avatarUrl =
          (profile as any)?.picture ??
          (profile as any)?.image ??
          (profile as any)?.avatar_url ??
          undefined;

        // Ensure the user exists (create if missing)
        let backendUser: User | null =
          (await getUserByEmail(email)) ??
          (await createUserFromOAuth({
            email,
            displayName,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            avatarUrl,
          }));

        // Create a session for this user in the User Service
        const session = backendUser
          ? await createSessionForUser(backendUser.id)
          : null;
        const sessionToken = session?.sessionToken ?? randomUUID();
        const sessionExpires =
          session?.expires ??
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        // Mutate `user` so jwt() callback sees the canonical values
        (user as any).id = backendUser?.id ?? randomUUID();
        (user as any).email = backendUser?.email ?? email;
        (user as any).name = backendUser?.displayName ?? displayName;
        (user as any).displayName = backendUser?.displayName ?? displayName;
        (user as any).sessionToken = sessionToken;
        (user as any).sessionExpires = sessionExpires;

        return true;
      } catch (err) {
        console.error('[NextAuth] Error in OAuth signIn callback:', err);

        // In dev, allow sign-in even if the User Service call exploded
        if (process.env.NODE_ENV !== 'production') return true;

        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Attach user info on first sign-in
      if (user) {
        token.id = (user as any).id ?? token.sub;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;

        if ((user as any).roles) token.roles = (user as any).roles;
        if ((user as any).orgId) token.orgId = (user as any).orgId;
        if ((user as any).sessionToken)
          token.sessionToken = (user as any).sessionToken;
        if ((user as any).sessionExpires)
          token.sessionExpires = (user as any).sessionExpires;
      }

      if (account?.provider) {
        token.provider = account.provider;
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        (session as any).user.id = token.id;
      }
      if (token?.roles) {
        (session as any).user.roles = token.roles;
      }
      if (token?.orgId) {
        (session as any).user.orgId = token.orgId;
      }
      if (token?.provider) {
        (session as any).user.provider = token.provider;
      }
      if (token?.sessionToken) {
        (session as any).sessionToken = token.sessionToken;
      }
      if (token?.sessionExpires) {
        (session as any).sessionExpires = token.sessionExpires;
      }

      return session;
    },
  },
};
