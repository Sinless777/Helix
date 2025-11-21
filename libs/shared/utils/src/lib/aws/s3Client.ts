import { S3Client } from '@aws-sdk/client-s3';

export type S3ClientOptions = {
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

/**
 * Create a minimal S3 client for AWS or S3-compatible storage (e.g., R2).
 */
export const createS3Client = (options: S3ClientOptions = {}): S3Client => {
  const {
    region = process.env.AWS_REGION ?? 'us-east-1',
    endpoint = process.env.AWS_S3_ENDPOINT,
    accessKeyId = process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY,
  } = options;

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials:
      accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined,
  });
};

