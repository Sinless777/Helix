import type { SecurityConfig } from "../types/security";
import { getSecretFromCache } from '../infisical';

const uuidNsFallback = '4a85e34a-92b8-4c21-9e90-9e4d9630a1bb';
const uuidNs =
  getSecretFromCache('UUID_NAMESPACE') ||
  getSecretFromCache('HELIX_UUID_NAMESPACE') ||
  process.env.UUID_NAMESPACE ||
  process.env.HELIX_UUID_NAMESPACE ||
  uuidNsFallback;

export const securityConfig: SecurityConfig = {
  uuidNamespace: uuidNs,
  // alias to match any legacy references
  uuid_namespace: uuidNs,
};
