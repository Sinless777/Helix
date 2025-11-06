export interface HypertuneConfig {
    token?: string; // NEXT_PUBLIC_HYPERTUNE_TOKEN
    configItemKey?: string; // EXPERIMENTATION_CONFIG_ITEM_KEY
    configUrl?: string; // EXPERIMENTATION_CONFIG
    framework?: string; // HYPERTUNE_FRAMEWORK
    outputDir?: string; // HYPERTUNE_OUTPUT_DIRECTORY_PATH
}