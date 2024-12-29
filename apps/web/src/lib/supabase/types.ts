export type Database = {
  public: {
    Tables: {
      platforms: {
        Row: {
          id: string
          name: string
          type: string
          enabled: boolean
          capabilities: {
            code_review: boolean
            pull_requests: boolean
            webhooks: boolean
          }
          config: {
            api_version?: string
            base_url?: string
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          type: string
          enabled?: boolean
          capabilities?: {
            code_review?: boolean
            pull_requests?: boolean
            webhooks?: boolean
          }
          config?: {
            api_version?: string
            base_url?: string
          }
        }
        Update: {
          name?: string
          type?: string
          enabled?: boolean
          capabilities?: {
            code_review?: boolean
            pull_requests?: boolean
            webhooks?: boolean
          }
          config?: {
            api_version?: string
            base_url?: string
          }
        }
      }
      programming_languages: {
        Row: {
          id: string
          name: string
          enabled: boolean
          extensions: string[]
          analyzers: {
            [key: string]: boolean
          }
          best_practices: {
            [key: string]: string
          }
          patterns: {
            [key: string]: string
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          enabled?: boolean
          extensions?: string[]
          analyzers?: {
            [key: string]: boolean
          }
          best_practices?: {
            [key: string]: string
          }
          patterns?: {
            [key: string]: string
          }
        }
        Update: {
          enabled?: boolean
          extensions?: string[]
          analyzers?: {
            [key: string]: boolean
          }
          best_practices?: {
            [key: string]: string
          }
          patterns?: {
            [key: string]: string
          }
        }
      }
    }
  }
}
