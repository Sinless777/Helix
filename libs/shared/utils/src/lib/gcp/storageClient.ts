import { Storage, type StorageOptions } from '@google-cloud/storage';

export const createStorageClient = (options: StorageOptions = {}) => {
  return new Storage({
    projectId: options.projectId ?? process.env.GCP_PROJECT_ID,
    keyFilename: options.keyFilename ?? process.env.GCP_CREDENTIALS_FILE,
    ...options,
  });
};
