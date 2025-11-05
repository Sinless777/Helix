import { GrafanaCloudConfig} from "./grafana-cloud.js";
import { GithubConfig } from "./github.js";

export type AppConfig = {
    grafanaCloud?: GrafanaCloudConfig;
    github: GithubConfig;
};