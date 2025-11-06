import type { HypertuneConfig } from '../types/hypertune';

export const hypertuneConfig: HypertuneConfig = {
    token: process.env.NEXT_PUBLIC_HYPERTUNE_TOKEN || '',
    configItemKey: process.env.EXPERIMENTATION_CONFIG_ITEM_KEY || '',
    configUrl: process.env.EXPERIMENTATION_CONFIG || '',
    framework: process.env.HYPERTUNE_FRAMEWORK || '',
    outputDir: process.env.HYPERTUNE_OUTPUT_DIRECTORY_PATH || '',
}