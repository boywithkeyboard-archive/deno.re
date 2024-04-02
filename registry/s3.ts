import { S3 } from '@aws-sdk/client-s3'

export const s3 = new S3({
  endpoint: 'https://845d63c5b670c150bcffba9e4a4dc417.eu.r2.cloudflarestorage.com',
  region: 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
})
