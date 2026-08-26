export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          id: string
          project_id: string
          core_video_id: string | null
          title: string
          source_type: 'upload' | 'url'
          source_url: string
          storage_path: string | null
          duration_seconds: number | null
          status: 'queued' | 'analyzing' | 'ready' | 'failed'
          analysis_stage: string | null
          analyzers_used: string[]
          chunking_mode: string
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          core_video_id?: string | null
          title: string
          source_type: 'upload' | 'url'
          source_url: string
          storage_path?: string | null
          duration_seconds?: number | null
          status?: 'queued' | 'analyzing' | 'ready' | 'failed'
          analysis_stage?: string | null
          analyzers_used?: string[]
          chunking_mode?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          core_video_id?: string | null
          title?: string
          source_type?: 'upload' | 'url'
          source_url?: string
          storage_path?: string | null
          duration_seconds?: number | null
          status?: 'queued' | 'analyzing' | 'ready' | 'failed'
          analysis_stage?: string | null
          analyzers_used?: string[]
          chunking_mode?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          project_id: string
          title: string | null
          video_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title?: string | null
          video_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string | null
          video_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'tool'
          content: string | null
          tool_calls: Json | null
          tool_results: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'tool'
          content?: string | null
          tool_calls?: Json | null
          tool_results?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'tool'
          content?: string | null
          tool_calls?: Json | null
          tool_results?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
