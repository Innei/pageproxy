declare global {
  export interface Window {
    context: {
      apiUrl: string
    }
    env: {
      debug?: string
    }
    inject?: string

    user?: any
  }
}
export {}
