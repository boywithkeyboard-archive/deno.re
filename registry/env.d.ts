declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BASE_URL: string
      S3_BUCKET: string
      S3_ENDPOINT: string
      S3_HOSTNAME: string
      S3_ACCESS_KEY_ID: string
      S3_SECRET_ACCESS_KEY: string
    }
  }
}

export {}
