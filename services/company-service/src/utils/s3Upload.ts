import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';

const {
  AWS_REGION   = 'us-east-1',
  S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_CDN_URL,
} = process.env;

function getS3Client(): S3Client {
  if (!S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('S3 non configuré. Définissez S3_BUCKET, AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY dans le .env');
  }
  return new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId:     AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
}

export interface UploadResult {
  url:         string;
  fileSizeKb:  number;
}

export async function uploadPdfToS3(
  buffer: Buffer,
  originalName: string,
  ticker: string,
  reportId: number,
): Promise<UploadResult> {
  const client = getS3Client();

  const ext = extname(originalName) || '.pdf';
  const key = `reports/${ticker.toUpperCase()}/${reportId}${ext}`;

  await client.send(new PutObjectCommand({
    Bucket:      S3_BUCKET!,
    Key:         key,
    Body:        buffer,
    ContentType: 'application/pdf',
  }));

  const baseUrl = S3_CDN_URL?.replace(/\/$/, '')
    ?? `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

  return {
    url:        `${baseUrl}/${key}`,
    fileSizeKb: Math.ceil(buffer.byteLength / 1024),
  };
}
