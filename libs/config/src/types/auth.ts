export interface AuthConfig {
    nextAuth: {
      secret?: string;
    };
    google: {
      clientId?: string;
      clientSecret?: string;
    };
}