declare global {
  namespace NodeJS {
    interface ProcessEnv {
      R2_HOSTNAME: string
      BASE_URL: string
      S3_BUCKET: string
      S3_ENDPOINT: string
      S3_ACCESS_KEY_ID: string
      S3_SECRET_ACCESS_KEY: string
    }
  }
}

export {}
