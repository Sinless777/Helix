import type { SecurityConfig } from "../types/security";

export const securityConfig: SecurityConfig = {
    uuidNamespace:
          process.env.UUID_NAMESPACE ||
          process.env.HELIX_UUID_NAMESPACE ||
          '4a85e34a-92b8-4c21-9e90-9e4d9630a1bb',
        // alias to match any legacy references
        uuid_namespace:
          process.env.UUID_NAMESPACE ||
          process.env.HELIX_UUID_NAMESPACE ||
          '4a85e34a-92b8-4c21-9e90-9e4d9630a1bb',
}