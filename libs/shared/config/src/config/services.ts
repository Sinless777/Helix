import type { ServicesConfig } from '../types/services';

export const servicesConfig: ServicesConfig = {
    discord: {
        discordBotUrl: process.env.DISCORD_BOT_URL,
    }
}