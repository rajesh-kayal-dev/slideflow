import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(file: Buffer | Uint8Array, fileName: string, contentType: string) {
  const target = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_BUCKET!,
      Key: `uploads/${Date.now()}-${fileName}`,
      Body: file,
      ContentType: contentType,
    },
  });

  const result = await target.done();
  return {
    url: (result as any).Location as string,
    key: (result as any).Key as string,
  };
}

export async function getFileFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET!,
    Key: key,
  });

  const response = await s3Client.send(command);
  const byteArray = await response.Body?.transformToByteArray();
  if (!byteArray) throw new Error('Could not read file from S3');
  return Buffer.from(byteArray);
}

export { s3Client };
