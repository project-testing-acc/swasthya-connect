export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          cancellation_reason: string | null
          clinic_id: string
          created_at: string
          doctor_id: string | null
          end_time: string
          fee: number
          id: string
          notes: string | null
          patient_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          token_number: number | null
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          cancellation_reason?: string | null
          clinic_id: string
          created_at?: string
          doctor_id?: string | null
          end_time: string
          fee: number
          id?: string
          notes?: string | null
          patient_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          token_number?: number | null
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          cancellation_reason?: string | null
          clinic_id?: string
          created_at?: string
          doctor_id?: string | null
          end_time?: string
          fee?: number
          id?: string
          notes?: string | null
          patient_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          token_number?: number | null
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_specialties: {
        Row: {
          clinic_id: string
          id: string
          specialty_id: string
        }
        Insert: {
          clinic_id: string
          id?: string
          specialty_id: string
        }
        Update: {
          clinic_id?: string
          id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_specialties_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string
          average_rating: number | null
          city: string
          consultation_fee: number
          created_at: string
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address: string
          average_rating?: number | null
          city: string
          consultation_fee?: number
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          average_rating?: number | null
          city?: string
          consultation_fee?: number
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          clinic_id: string
          consultation_duration: number | null
          created_at: string
          experience_years: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          qualification: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          clinic_id: string
          consultation_duration?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          qualification?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          clinic_id?: string
          consultation_duration?: number | null
          created_at?: string
          experience_years?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          qualification?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          collection_address: string | null
          created_at: string
          id: string
          is_home_collection: boolean | null
          lab_id: string
          notes: string | null
          patient_id: string
          report_file_key: string | null
          sample_collection_date: string | null
          sample_collection_time: string | null
          status: Database["public"]["Enums"]["lab_order_status"]
          test_id: string
          updated_at: string
        }
        Insert: {
          collection_address?: string | null
          created_at?: string
          id?: string
          is_home_collection?: boolean | null
          lab_id: string
          notes?: string | null
          patient_id: string
          report_file_key?: string | null
          sample_collection_date?: string | null
          sample_collection_time?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          test_id: string
          updated_at?: string
        }
        Update: {
          collection_address?: string | null
          created_at?: string
          id?: string
          is_home_collection?: boolean | null
          lab_id?: string
          notes?: string | null
          patient_id?: string
          report_file_key?: string | null
          sample_collection_date?: string | null
          sample_collection_time?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          lab_id: string
          name_en: string
          name_gu: string | null
          name_hi: string | null
          price: number
          sample_type: string | null
          tat_hours: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          lab_id: string
          name_en: string
          name_gu?: string | null
          name_hi?: string | null
          price: number
          sample_type?: string | null
          tat_hours?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          lab_id?: string
          name_en?: string
          name_gu?: string | null
          name_hi?: string | null
          price?: number
          sample_type?: string | null
          tat_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      labs: {
        Row: {
          address: string
          average_rating: number | null
          city: string
          created_at: string
          description: string | null
          email: string | null
          home_collection: boolean | null
          home_collection_fee: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address: string
          average_rating?: number | null
          city: string
          created_at?: string
          description?: string | null
          email?: string | null
          home_collection?: boolean | null
          home_collection_fee?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          average_rating?: number | null
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          home_collection?: boolean | null
          home_collection_fee?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          metadata: Json | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          currency: string | null
          error_message: string | null
          gateway: string | null
          id: string
          metadata: Json | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          gateway?: string | null
          id?: string
          metadata?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          error_message?: string | null
          gateway?: string | null
          id?: string
          metadata?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          locale: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          locale?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          locale?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          clinic_id: string | null
          comment: string | null
          created_at: string
          id: string
          lab_id: string | null
          rating: number
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          lab_id?: string | null
          rating: number
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          lab_id?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "labs"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name_en: string
          name_gu: string
          name_hi: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name_en: string
          name_gu: string
          name_hi: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name_en?: string
          name_gu?: string
          name_hi?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "patient" | "doctor" | "lab_admin"
      appointment_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "no_show"
        | "completed"
      appointment_type: "in_person" | "teleconsultation"
      lab_order_status:
        | "ordered"
        | "sample_collected"
        | "processing"
        | "completed"
        | "cancelled"
      payment_status: "pending" | "success" | "failed" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "patient", "doctor", "lab_admin"],
      appointment_status: [
        "pending",
        "confirmed",
        "cancelled",
        "no_show",
        "completed",
      ],
      appointment_type: ["in_person", "teleconsultation"],
      lab_order_status: [
        "ordered",
        "sample_collected",
        "processing",
        "completed",
        "cancelled",
      ],
      payment_status: ["pending", "success", "failed", "refunded"],
    },
  },
} as const
