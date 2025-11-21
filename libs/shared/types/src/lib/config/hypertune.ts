export interface FeatureFlag {
    /**
     * - key: assistant_enabled
        default_variant: true
        description: Enable the core Helix assistant chat + inference engine
     */
    key: string;
    default_variant: boolean | string | number;
    description: string;
}

export interface HypertuneEnvironment {
    name: 'development' | 'staging' | 'production';
    description: string;
}

export interface HypertuneConfig {
    token?: string; // NEXT_PUBLIC_HYPERTUNE_TOKEN
    configItemKey?: string; // EXPERIMENTATION_CONFIG_ITEM_KEY
    configUrl?: string; // EXPERIMENTATION_CONFIG
    framework?: string; // HYPERTUNE_FRAMEWORK
    outputDir?: string; // HYPERTUNE_OUTPUT_DIRECTORY_PATH
    featureFlags?: FeatureFlag[];
    environment?: HypertuneEnvironment;
    project?: string;

}