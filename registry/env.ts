declare global {
  namespace NodeJS {
    interface ProcessEnv {
      S3_ACCESS_KEY_ID: string
      S3_SECRET_ACCESS_KEY: string
    }
  }
}

export {}
