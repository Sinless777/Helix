import { GithubConfig } from '../types/github';

export const githubConfig: GithubConfig = {
    clientId: process.env.GITHUB_CLIENT_ID || undefined,
    redirectUri: process.env.GITHUB_REDIRECT_URI || undefined,
    repoUrl: 'https://github.com/Sinless777/Helix',
}