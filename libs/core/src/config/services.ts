import type { ServicesConfig } from '@helix-ai/types';

export const servicesConfig: ServicesConfig = {
    discord: {
        discordBotUrl: process.env.DISCORD_BOT_URL,
    }
}
