import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import fs from 'fs';

const ENDPOINT = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
export const BUCKET = process.env.MINIO_BUCKET || 'good-job';
const PUBLIC_URL = (process.env.MINIO_PUBLIC_URL || 'http://localhost:3000/media').replace(
  /\/$/,
  '',
);

const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

export async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${BUCKET}/*`],
            },
          ],
        }),
      }),
    );
  }
}

export function keyToUrl(key: string): string {
  return `${PUBLIC_URL}/${BUCKET}/${key}`;
}

export function urlToKey(url: string): string {
  return url.replace(`${PUBLIC_URL}/${BUCKET}/`, '');
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }),
  );
  return keyToUrl(key);
}

export async function uploadFile(
  key: string,
  filePath: string,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: contentType,
    }),
  );
  return keyToUrl(key);
}

export async function downloadToFile(url: string, destPath: string): Promise<void> {
  const key = urlToKey(url);
  const { Body } = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  await new Promise<void>((resolve, reject) => {
    const ws = fs.createWriteStream(destPath);
    (Body as Readable).pipe(ws);
    ws.on('finish', resolve);
    ws.on('error', reject);
  });
}

export async function deleteByUrl(url: string): Promise<void> {
  const key = urlToKey(url);
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function streamObject(key: string): Promise<{ body: Readable; contentType?: string }> {
  const { Body, ContentType } = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return { body: Body as Readable, contentType: ContentType };
}
