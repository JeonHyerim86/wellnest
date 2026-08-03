/**
 * Supabase 스키마 타입 정의.
 * supabase/migrations/20260803000000_init.sql 과 1:1로 대응한다.
 * (supabase gen types 산출물과 동일한 형태로 손수 작성)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LogType = "meal" | "workout";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type Priority = "low" | "normal" | "high";
export type RoutineCategory = "health" | "meal" | "mind" | "life";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          emoji: string | null;
          category: RoutineCategory;
          /** 0(일) ~ 6(토). 빈 배열이면 매일 */
          repeat_days: number[];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          emoji?: string | null;
          category?: RoutineCategory;
          repeat_days?: number[];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          emoji?: string | null;
          category?: RoutineCategory;
          repeat_days?: number[];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string | null;
          title: string;
          memo: string | null;
          /** YYYY-MM-DD */
          due_date: string;
          priority: Priority;
          is_done: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id?: string | null;
          title: string;
          memo?: string | null;
          due_date?: string;
          priority?: Priority;
          is_done?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          routine_id?: string | null;
          title?: string;
          memo?: string | null;
          due_date?: string;
          priority?: Priority;
          is_done?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "todos_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
        ];
      };
      logs: {
        Row: {
          id: string;
          user_id: string;
          log_type: LogType;
          /** YYYY-MM-DD */
          logged_on: string;
          title: string;
          memo: string | null;
          image_url: string | null;
          /** log_type = 'meal' 일 때만 사용 */
          meal_type: MealType | null;
          calories: number | null;
          /** log_type = 'workout' 일 때만 사용 */
          duration_min: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_type: LogType;
          logged_on?: string;
          title: string;
          memo?: string | null;
          image_url?: string | null;
          meal_type?: MealType | null;
          calories?: number | null;
          duration_min?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_type?: LogType;
          logged_on?: string;
          title?: string;
          memo?: string | null;
          image_url?: string | null;
          meal_type?: MealType | null;
          calories?: number | null;
          duration_min?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

/** 화면에서 쓰기 편한 Row 별칭 */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Routine = Database["public"]["Tables"]["routines"]["Row"];
export type Todo = Database["public"]["Tables"]["todos"]["Row"];
export type WellnessLog = Database["public"]["Tables"]["logs"]["Row"];
