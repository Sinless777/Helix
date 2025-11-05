// content/constants/oauth.ts
// OAuth provider configuration for Helix's custom account linking flow.

export type OAuthProviderKey =
  | 'google'
  | 'discord'
  | 'github'
  | 'facebook'
  | 'twitch'
  | 'steam'
  | 'epicGames';

export interface OAuthProviderConfig {
  name: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectPath: string;
}

export const oauthProviders: Record<OAuthProviderKey, OAuthProviderConfig> = {
  google: {
    name: 'Google',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    userInfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopes: ['openid', 'email', 'profile'],
    clientIdEnv: 'GOOGLE_OAUTH_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_OAUTH_CLIENT_SECRET',
    redirectPath: '/api/oauth/google/callback',
  },
  discord: {
    name: 'Discord',
    authorizationEndpoint: 'https://discord.com/api/oauth2/authorize',
    tokenEndpoint: 'https://discord.com/api/oauth2/token',
    userInfoEndpoint: 'https://discord.com/api/users/@me',
    scopes: ['identify', 'email'],
    clientIdEnv: 'DISCORD_OAUTH_CLIENT_ID',
    clientSecretEnv: 'DISCORD_OAUTH_CLIENT_SECRET',
    redirectPath: '/api/oauth/discord/callback',
  },
  github: {
    name: 'GitHub',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    userInfoEndpoint: 'https://api.github.com/user',
    scopes: ['read:user', 'user:email'],
    clientIdEnv: 'GITHUB_OAUTH_CLIENT_ID',
    clientSecretEnv: 'GITHUB_OAUTH_CLIENT_SECRET',
    redirectPath: '/api/oauth/github/callback',
  },
  facebook: {
    name: 'Facebook',
    authorizationEndpoint: 'https://www.facebook.com/v17.0/dialog/oauth',
    tokenEndpoint: 'https://graph.facebook.com/v17.0/oauth/access_token',
    userInfoEndpoint: 'https://graph.facebook.com/me',
    scopes: ['email', 'public_profile'],
    clientIdEnv: 'FACEBOOK_OAUTH_CLIENT_ID',
    clientSecretEnv: 'FACEBOOK_OAUTH_CLIENT_SECRET',
    redirectPath: '/api/oauth/facebook/callback',
  },
  twitch: {
    name: 'Twitch',
    authorizationEndpoint: 'https://id.twitch.tv/oauth2/authorize',
    tokenEndpoint: 'https://id.twitch.tv/oauth2/token',
    userInfoEndpoint: 'https://api.twitch.tv/helix/users',
    scopes: ['user:read:email'],
    clientIdEnv: 'TWITCH_OAUTH_CLIENT_ID',
    clientSecretEnv: 'TWITCH_OAUTH_CLIENT_SECRET',
    redirectPath: '/api/oauth/twitch/callback',
  },
  steam: {
    name: 'Steam',
    authorizationEndpoint: 'https://steamcommunity.com/openid/login',
    tokenEndpoint: 'https://steamcommunity.com/openid/login',
    userInfoEndpoint: 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
    scopes: [],
    clientIdEnv: 'STEAM_OAUTH_CLIENT_ID',
    clientSecretEnv: 'STEAM_OAUTH_CLIENT_SECRET',
    redirectPath: '/api/oauth/steam/callback',
  },
  epicGames: {
    name: 'Epic Games',
    authorizationEndpoint: 'https://www.epicgames.com/id/authorize',
    tokenEndpoint: 'https://api.epicgames.dev/epic/oauth/v1/token',
    userInfoEndpoint: 'https://api.epicgames.dev/epic/oauth/v1/userInfo',
    scopes: ['basic_profile'],
    clientIdEnv: 'EPIC_OAUTH_CLIENT_ID',
    clientSecretEnv: 'EPIC_OAUTH_CLIENT_SECRET',
    redirectPath: '/api/oauth/epicGames/callback',
  },
};
