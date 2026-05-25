export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          bus_id: string | null;
          coupon_id: string | null;
          created_at: string;
          departure_time: string;
          discount_amount: number;
          driver_name: string | null;
          driver_phone: string | null;
          drop_address: string | null;
          from_city: string;
          id: string;
          operator_name: string;
          passenger_name: string;
          passenger_phone: string;
          pickup_address: string | null;
          price_per_seat: number;
          return_date: string | null;
          route_id: string | null;
          seats: number;
          sharing_ride_id: string | null;
          status: string;
          taxi_id: string | null;
          to_city: string;
          total_price: number;
          travel_date: string;
          trip_type: string;
          updated_at: string;
          user_id: string;
          vehicle_plate: string | null;
          vehicle_type: Database["public"]["Enums"]["vehicle_type"];
        };
        Insert: {
          bus_id?: string | null;
          coupon_id?: string | null;
          created_at?: string;
          departure_time: string;
          discount_amount?: number;
          driver_name?: string | null;
          driver_phone?: string | null;
          drop_address?: string | null;
          from_city: string;
          id?: string;
          operator_name: string;
          passenger_name: string;
          passenger_phone: string;
          pickup_address?: string | null;
          price_per_seat: number;
          return_date?: string | null;
          route_id?: string | null;
          seats?: number;
          sharing_ride_id?: string | null;
          status?: string;
          taxi_id?: string | null;
          to_city: string;
          total_price: number;
          travel_date: string;
          trip_type?: string;
          updated_at?: string;
          user_id: string;
          vehicle_plate?: string | null;
          vehicle_type: Database["public"]["Enums"]["vehicle_type"];
        };
        Update: {
          bus_id?: string | null;
          coupon_id?: string | null;
          created_at?: string;
          departure_time?: string;
          discount_amount?: number;
          driver_name?: string | null;
          driver_phone?: string | null;
          drop_address?: string | null;
          from_city?: string;
          id?: string;
          operator_name?: string;
          passenger_name?: string;
          passenger_phone?: string;
          pickup_address?: string | null;
          price_per_seat?: number;
          return_date?: string | null;
          route_id?: string | null;
          seats?: number;
          sharing_ride_id?: string | null;
          status?: string;
          taxi_id?: string | null;
          to_city?: string;
          total_price?: number;
          travel_date?: string;
          trip_type?: string;
          updated_at?: string;
          user_id?: string;
          vehicle_plate?: string | null;
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"];
        };
        Relationships: [
          {
            foreignKeyName: "bookings_bus_id_fkey";
            columns: ["bus_id"];
            isOneToOne: false;
            referencedRelation: "buses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_sharing_ride_id_fkey";
            columns: ["sharing_ride_id"];
            isOneToOne: false;
            referencedRelation: "sharing_rides";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_taxi_id_fkey";
            columns: ["taxi_id"];
            isOneToOne: false;
            referencedRelation: "taxis";
            referencedColumns: ["id"];
          },
        ];
      };
      buses: {
        Row: {
          active: boolean;
          amenities: string[];
          bus_type: string;
          created_at: string;
          id: string;
          model: string;
          plate_number: string;
          total_seats: number;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          active?: boolean;
          amenities?: string[];
          bus_type?: string;
          created_at?: string;
          id?: string;
          model: string;
          plate_number: string;
          total_seats?: number;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          active?: boolean;
          amenities?: string[];
          bus_type?: string;
          created_at?: string;
          id?: string;
          model?: string;
          plate_number?: string;
          total_seats?: number;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "buses_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          active: boolean;
          code: string;
          created_at: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          id: string;
          max_uses: number | null;
          updated_at: string;
          used_count: number;
          valid_from: string;
          valid_until: string | null;
        };
        Insert: {
          active?: boolean;
          code: string;
          created_at?: string;
          description?: string | null;
          discount_type?: string;
          discount_value: number;
          id?: string;
          max_uses?: number | null;
          updated_at?: string;
          used_count?: number;
          valid_from?: string;
          valid_until?: string | null;
        };
        Update: {
          active?: boolean;
          code?: string;
          created_at?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          id?: string;
          max_uses?: number | null;
          updated_at?: string;
          used_count?: number;
          valid_from?: string;
          valid_until?: string | null;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          aadhaar_number: string | null;
          aadhaar_upload_url: string | null;
          aadhaar_verification_status: Database["public"]["Enums"]["driver_document_status"];
          assigned_vehicle: string | null;
          created_at: string;
          deleted_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          is_online: boolean;
          license_expiry_date: string | null;
          license_number: string;
          license_upload_url: string | null;
          license_verification_status: Database["public"]["Enums"]["driver_document_status"];
          pan_number: string | null;
          pan_upload_url: string | null;
          pan_verification_status: Database["public"]["Enums"]["driver_document_status"];
          phone: string | null;
          profile_photo_url: string | null;
          rating: number;
          status: Database["public"]["Enums"]["driver_account_status"];
          suspended_at: string | null;
          updated_at: string;
          user_id: string;
          vendor_id: string | null;
          vehicle_number: string | null;
          vehicle_type: string | null;
          verified: boolean;
        };
        Insert: {
          aadhaar_number?: string | null;
          aadhaar_upload_url?: string | null;
          aadhaar_verification_status?: Database["public"]["Enums"]["driver_document_status"];
          assigned_vehicle?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_online?: boolean;
          license_expiry_date?: string | null;
          license_number: string;
          license_upload_url?: string | null;
          license_verification_status?: Database["public"]["Enums"]["driver_document_status"];
          pan_number?: string | null;
          pan_upload_url?: string | null;
          pan_verification_status?: Database["public"]["Enums"]["driver_document_status"];
          phone?: string | null;
          profile_photo_url?: string | null;
          rating?: number;
          status?: Database["public"]["Enums"]["driver_account_status"];
          suspended_at?: string | null;
          updated_at?: string;
          user_id: string;
          vendor_id?: string | null;
          vehicle_number?: string | null;
          vehicle_type?: string | null;
          verified?: boolean;
        };
        Update: {
          aadhaar_number?: string | null;
          aadhaar_upload_url?: string | null;
          aadhaar_verification_status?: Database["public"]["Enums"]["driver_document_status"];
          assigned_vehicle?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_online?: boolean;
          license_expiry_date?: string | null;
          license_number?: string;
          license_upload_url?: string | null;
          license_verification_status?: Database["public"]["Enums"]["driver_document_status"];
          pan_number?: string | null;
          pan_upload_url?: string | null;
          pan_verification_status?: Database["public"]["Enums"]["driver_document_status"];
          phone?: string | null;
          profile_photo_url?: string | null;
          rating?: number;
          status?: Database["public"]["Enums"]["driver_account_status"];
          suspended_at?: string | null;
          updated_at?: string;
          user_id?: string;
          vendor_id?: string | null;
          vehicle_number?: string | null;
          vehicle_type?: string | null;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "drivers_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          read: boolean;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          read?: boolean;
          title: string;
          type?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          read?: boolean;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          booking_id: string;
          created_at: string;
          id: string;
          method: string;
          status: string;
          transaction_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          booking_id: string;
          created_at?: string;
          id?: string;
          method?: string;
          status?: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          booking_id?: string;
          created_at?: string;
          id?: string;
          method?: string;
          status?: string;
          transaction_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      routes: {
        Row: {
          active: boolean;
          base_price: number;
          created_at: string;
          distance_km: number | null;
          duration_minutes: number | null;
          from_city: string;
          id: string;
          owner_type?: string;
          route_category?: string;
          to_city: string;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          active?: boolean;
          base_price?: number;
          created_at?: string;
          distance_km?: number | null;
          duration_minutes?: number | null;
          from_city: string;
          id?: string;
          to_city: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          active?: boolean;
          base_price?: number;
          created_at?: string;
          distance_km?: number | null;
          duration_minutes?: number | null;
          from_city?: string;
          id?: string;
          to_city?: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "routes_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      sharing_rides: {
        Row: {
          created_at: string;
          departure_at: string;
          driver_id: string | null;
          from_city: string;
          id: string;
          price_per_seat: number;
          route_id: string | null;
          seats_booked: number;
          seats_total: number;
          status: string;
          taxi_id: string | null;
          to_city: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          departure_at: string;
          driver_id?: string | null;
          from_city: string;
          id?: string;
          price_per_seat: number;
          route_id?: string | null;
          seats_booked?: number;
          seats_total?: number;
          status?: string;
          taxi_id?: string | null;
          to_city: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          departure_at?: string;
          driver_id?: string | null;
          from_city?: string;
          id?: string;
          price_per_seat?: number;
          route_id?: string | null;
          seats_booked?: number;
          seats_total?: number;
          status?: string;
          taxi_id?: string | null;
          to_city?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sharing_rides_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sharing_rides_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sharing_rides_taxi_id_fkey";
            columns: ["taxi_id"];
            isOneToOne: false;
            referencedRelation: "taxis";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_section_seen: {
        Row: {
          admin_user_id: string;
          last_seen_at: string;
          section: string;
        };
        Insert: {
          admin_user_id: string;
          last_seen_at?: string;
          section: string;
        };
        Update: {
          admin_user_id?: string;
          last_seen_at?: string;
          section?: string;
        };
        Relationships: [];
      };
      taxi_rides: {
        Row: {
          id: string;
          vendor_id: string | null;
          owner_type: string;
          taxi_id: string;
          route_id: string | null;
          driver_id: string | null;
          from_city: string;
          to_city: string;
          travel_date: string;
          departure_time: string;
          price: number;
          seats_available: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id?: string | null;
          owner_type?: string;
          taxi_id: string;
          route_id?: string | null;
          driver_id?: string | null;
          from_city: string;
          to_city: string;
          travel_date: string;
          departure_time: string;
          price: number;
          seats_available?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string | null;
          owner_type?: string;
          taxi_id?: string;
          route_id?: string | null;
          driver_id?: string | null;
          from_city?: string;
          to_city?: string;
          travel_date?: string;
          departure_time?: string;
          price?: number;
          seats_available?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      taxis: {
        Row: {
          active: boolean;
          capacity: number;
          created_at: string;
          driver_id: string | null;
          id: string;
          model: string;
          owner_type?: string;
          plate_number: string;
          taxi_type: string;
          updated_at: string;
          vendor_id: string | null;
        };
        Insert: {
          active?: boolean;
          capacity?: number;
          created_at?: string;
          driver_id?: string | null;
          id?: string;
          model: string;
          plate_number: string;
          taxi_type?: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Update: {
          active?: boolean;
          capacity?: number;
          created_at?: string;
          driver_id?: string | null;
          id?: string;
          model?: string;
          plate_number?: string;
          taxi_type?: string;
          updated_at?: string;
          vendor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "taxis_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "taxis_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      vendor_auth: {
        Row: {
          approval_status: Database["public"]["Enums"]["vendor_approval_status"];
          created_at: string;
          email: string;
          id: string;
          last_login_at: string | null;
          mobile_number: string;
          remember_me: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          approval_status?: Database["public"]["Enums"]["vendor_approval_status"];
          created_at?: string;
          email: string;
          id?: string;
          last_login_at?: string | null;
          mobile_number: string;
          remember_me?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          approval_status?: Database["public"]["Enums"]["vendor_approval_status"];
          created_at?: string;
          email?: string;
          id?: string;
          last_login_at?: string | null;
          mobile_number?: string;
          remember_me?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      vendor_profiles: {
        Row: {
          aadhaar_number: string | null;
          aadhaar_upload_url: string | null;
          approval_status: Database["public"]["Enums"]["vendor_approval_status"];
          business_address: string;
          business_email: string;
          business_name: string;
          business_registration_url: string | null;
          city: string;
          created_at: string;
          gst_number: string | null;
          id: string;
          mobile_number: string;
          owner_name: string;
          pan_number: string | null;
          pan_upload_url: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          state: string;
          updated_at: string;
          user_id: string;
          vendor_id: string;
        };
        Insert: {
          aadhaar_number?: string | null;
          aadhaar_upload_url?: string | null;
          approval_status?: Database["public"]["Enums"]["vendor_approval_status"];
          business_address: string;
          business_email: string;
          business_name: string;
          business_registration_url?: string | null;
          city: string;
          created_at?: string;
          gst_number?: string | null;
          id?: string;
          mobile_number: string;
          owner_name: string;
          pan_number?: string | null;
          pan_upload_url?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          state: string;
          updated_at?: string;
          user_id: string;
          vendor_id: string;
        };
        Update: {
          aadhaar_number?: string | null;
          aadhaar_upload_url?: string | null;
          approval_status?: Database["public"]["Enums"]["vendor_approval_status"];
          business_address?: string;
          business_email?: string;
          business_name?: string;
          business_registration_url?: string | null;
          city?: string;
          created_at?: string;
          gst_number?: string | null;
          id?: string;
          mobile_number?: string;
          owner_name?: string;
          pan_number?: string | null;
          pan_upload_url?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          state?: string;
          updated_at?: string;
          user_id?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: true;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      vendors: {
        Row: {
          address: string | null;
          aadhaar_number: string | null;
          aadhaar_upload_url: string | null;
          approval_status: Database["public"]["Enums"]["vendor_approval_status"];
          business_registration_url: string | null;
          business_name: string;
          city: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          gst_number: string | null;
          id: string;
          owner_name: string | null;
          pan_number: string | null;
          pan_upload_url: string | null;
          state: string | null;
          updated_at: string;
          user_id: string;
          verified: boolean;
        };
        Insert: {
          address?: string | null;
          aadhaar_number?: string | null;
          aadhaar_upload_url?: string | null;
          approval_status?: Database["public"]["Enums"]["vendor_approval_status"];
          business_registration_url?: string | null;
          business_name: string;
          city?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          gst_number?: string | null;
          id?: string;
          owner_name?: string | null;
          pan_number?: string | null;
          pan_upload_url?: string | null;
          state?: string | null;
          updated_at?: string;
          user_id: string;
          verified?: boolean;
        };
        Update: {
          address?: string | null;
          aadhaar_number?: string | null;
          aadhaar_upload_url?: string | null;
          approval_status?: Database["public"]["Enums"]["vendor_approval_status"];
          business_registration_url?: string | null;
          business_name?: string;
          city?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          gst_number?: string | null;
          id?: string;
          owner_name?: string | null;
          pan_number?: string | null;
          pan_upload_url?: string | null;
          state?: string | null;
          updated_at?: string;
          user_id?: string;
          verified?: boolean;
        };
        Relationships: [];
      };
      wallet_transactions: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          reference: string | null;
          type: string;
          user_id: string;
          wallet_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          reference?: string | null;
          type?: string;
          user_id: string;
          wallet_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          reference?: string | null;
          type?: string;
          user_id?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          balance: number;
          created_at: string;
          currency: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "customer" | "driver" | "vendor" | "admin";
      driver_account_status: "active" | "suspended" | "pending_verification";
      driver_document_status: "verified" | "rejected" | "pending";
      vendor_approval_status: "pending" | "approved" | "rejected" | "suspended";
      vehicle_type: "taxi" | "bus" | "sharing";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "driver", "vendor", "admin"],
      vehicle_type: ["taxi", "bus", "sharing"],
    },
  },
} as const;
