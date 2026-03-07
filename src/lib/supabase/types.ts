export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string | null;
          building: string | null;
          city: string | null;
          created_at: string | null;
          id: string;
          is_default: boolean | null;
          label: string | null;
          landmark: string | null;
          lat: number | null;
          lng: number | null;
          pincode: string | null;
          state: string | null;
          street: string | null;
          user_id: string | null;
        };
        Insert: {
          area?: string | null;
          building?: string | null;
          city?: string | null;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          label?: string | null;
          landmark?: string | null;
          lat?: number | null;
          lng?: number | null;
          pincode?: string | null;
          state?: string | null;
          street?: string | null;
          user_id?: string | null;
        };
        Update: {
          area?: string | null;
          building?: string | null;
          city?: string | null;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          label?: string | null;
          landmark?: string | null;
          lat?: number | null;
          lng?: number | null;
          pincode?: string | null;
          state?: string | null;
          street?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      banners: {
        Row: {
          created_at: string | null;
          ends_at: string | null;
          id: string;
          image_url: string;
          is_active: boolean | null;
          link: string | null;
          sort_order: number | null;
          starts_at: string | null;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          ends_at?: string | null;
          id?: string;
          image_url: string;
          is_active?: boolean | null;
          link?: string | null;
          sort_order?: number | null;
          starts_at?: string | null;
          title: string;
        };
        Update: {
          created_at?: string | null;
          ends_at?: string | null;
          id?: string;
          image_url?: string;
          is_active?: boolean | null;
          link?: string | null;
          sort_order?: number | null;
          starts_at?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: string | null;
          quantity: number;
          user_id: string | null;
          variant_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          quantity?: number;
          user_id?: string | null;
          variant_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          quantity?: number;
          user_id?: string | null;
          variant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          image_url: string | null;
          is_active: boolean | null;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number | null;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      coupon_usage: {
        Row: {
          coupon_id: string;
          id: string;
          order_id: string | null;
          used_at: string;
          user_id: string;
        };
        Insert: {
          coupon_id: string;
          id?: string;
          order_id?: string | null;
          used_at?: string;
          user_id: string;
        };
        Update: {
          coupon_id?: string;
          id?: string;
          order_id?: string | null;
          used_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string | null;
          description: string | null;
          expires_at: string | null;
          id: string;
          is_active: boolean | null;
          max_discount: number | null;
          max_uses: number | null;
          min_order: number | null;
          per_user_limit: number | null;
          type: Database["public"]["Enums"]["coupon_type"];
          used_count: number | null;
          value: number;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_discount?: number | null;
          max_uses?: number | null;
          min_order?: number | null;
          per_user_limit?: number | null;
          type: Database["public"]["Enums"]["coupon_type"];
          used_count?: number | null;
          value: number;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_discount?: number | null;
          max_uses?: number | null;
          min_order?: number | null;
          per_user_limit?: number | null;
          type?: Database["public"]["Enums"]["coupon_type"];
          used_count?: number | null;
          value?: number;
        };
        Relationships: [];
      };
      delivery_slots: {
        Row: {
          current_orders: number | null;
          end_time: string;
          id: string;
          is_active: boolean | null;
          label: string;
          max_orders: number;
          start_time: string;
        };
        Insert: {
          current_orders?: number | null;
          end_time: string;
          id?: string;
          is_active?: boolean | null;
          label: string;
          max_orders: number;
          start_time: string;
        };
        Update: {
          current_orders?: number | null;
          end_time?: string;
          id?: string;
          is_active?: boolean | null;
          label?: string;
          max_orders?: number;
          start_time?: string;
        };
        Relationships: [];
      };
      loyalty_transactions: {
        Row: {
          created_at: string | null;
          description: string;
          id: string;
          order_id: string | null;
          points: number;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description: string;
          id?: string;
          order_id?: string | null;
          points: number;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string;
          id?: string;
          order_id?: string | null;
          points?: number;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          email: string;
          id: string;
          is_active: boolean | null;
          subscribed_at: string | null;
        };
        Insert: {
          email: string;
          id?: string;
          is_active?: boolean | null;
          subscribed_at?: string | null;
        };
        Update: {
          email?: string;
          id?: string;
          is_active?: boolean | null;
          subscribed_at?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          order_id: string;
          price: number;
          product_id: string;
          product_snapshot: Json;
          quantity: number;
          variant_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order_id: string;
          price: number;
          product_id: string;
          product_snapshot: Json;
          quantity: number;
          variant_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order_id?: string;
          price?: number;
          product_id?: string;
          product_snapshot?: Json;
          quantity?: number;
          variant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address_id: string | null;
          applied_promocode: string | null;
          created_at: string | null;
          delivery_slot: string | null;
          discount_amount: number | null;
          id: string;
          payment_method: string;
          payment_status: string;
          status: string;
          substitution_preference: string | null;
          subtotal: number | null;
          total: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          address_id?: string | null;
          applied_promocode?: string | null;
          created_at?: string | null;
          delivery_slot?: string | null;
          discount_amount?: number | null;
          id?: string;
          payment_method: string;
          payment_status?: string;
          status?: string;
          substitution_preference?: string | null;
          subtotal?: number | null;
          total: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          address_id?: string | null;
          applied_promocode?: string | null;
          created_at?: string | null;
          delivery_slot?: string | null;
          discount_amount?: number | null;
          id?: string;
          payment_method?: string;
          payment_status?: string;
          status?: string;
          substitution_preference?: string | null;
          subtotal?: number | null;
          total?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey";
            columns: ["address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          name: string;
          price: number;
          product_id: string | null;
          sku: string;
          stock: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          product_id?: string | null;
          sku: string;
          stock?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          product_id?: string | null;
          sku?: string;
          stock?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          compare_price: number | null;
          created_at: string | null;
          description: string | null;
          embedding: string | null;
          id: string;
          images: string[] | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          meta_description: string | null;
          meta_title: string | null;
          name: string;
          price: number;
          slug: string;
          stock: number | null;
          tags: string[] | null;
          unit: string | null;
        };
        Insert: {
          category_id?: string | null;
          compare_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          embedding?: string | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          meta_description?: string | null;
          meta_title?: string | null;
          name: string;
          price: number;
          slug: string;
          stock?: number | null;
          tags?: string[] | null;
          unit?: string | null;
        };
        Update: {
          category_id?: string | null;
          compare_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          embedding?: string | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          meta_description?: string | null;
          meta_title?: string | null;
          name?: string;
          price?: number;
          slug?: string;
          stock?: number | null;
          tags?: string[] | null;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          country_code: string | null;
          created_at: string | null;
          delivery_slot: string | null;
          dietary_preference:
            | Database["public"]["Enums"]["dietary_pref"]
            | null;
          email: string | null;
          id: string;
          is_onboarded: boolean | null;
          loyalty_points: number | null;
          name: string | null;
          phone: string | null;
          referral_code: string | null;
          role: Database["public"]["Enums"]["user_role"] | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          country_code?: string | null;
          created_at?: string | null;
          delivery_slot?: string | null;
          dietary_preference?:
            | Database["public"]["Enums"]["dietary_pref"]
            | null;
          email?: string | null;
          id: string;
          is_onboarded?: boolean | null;
          loyalty_points?: number | null;
          name?: string | null;
          phone?: string | null;
          referral_code?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          country_code?: string | null;
          created_at?: string | null;
          delivery_slot?: string | null;
          dietary_preference?:
            | Database["public"]["Enums"]["dietary_pref"]
            | null;
          email?: string | null;
          id?: string;
          is_onboarded?: boolean | null;
          loyalty_points?: number | null;
          name?: string | null;
          phone?: string | null;
          referral_code?: string | null;
          role?: Database["public"]["Enums"]["user_role"] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      promocodes: {
        Row: {
          code: string;
          created_at: string | null;
          discount_type: string;
          discount_value: number;
          id: string;
          is_active: boolean | null;
          max_discount: number | null;
          min_order_value: number | null;
          times_used: number | null;
          usage_limit: number | null;
          valid_from: string | null;
          valid_until: string | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          discount_type: string;
          discount_value: number;
          id?: string;
          is_active?: boolean | null;
          max_discount?: number | null;
          min_order_value?: number | null;
          times_used?: number | null;
          usage_limit?: number | null;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          discount_type?: string;
          discount_value?: number;
          id?: string;
          is_active?: boolean | null;
          max_discount?: number | null;
          min_order_value?: number | null;
          times_used?: number | null;
          usage_limit?: number | null;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string | null;
          endpoint: string;
          id: string;
          is_active: boolean | null;
          p256dh: string;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          auth: string;
          created_at?: string | null;
          endpoint: string;
          id?: string;
          is_active?: boolean | null;
          p256dh: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          auth?: string;
          created_at?: string | null;
          endpoint?: string;
          id?: string;
          is_active?: boolean | null;
          p256dh?: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      referrals: {
        Row: {
          created_at: string | null;
          id: string;
          referred_id: string;
          referrer_id: string;
          reward_points: number | null;
          status: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          referred_id: string;
          referrer_id: string;
          reward_points?: number | null;
          status?: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          referred_id?: string;
          referrer_id?: string;
          reward_points?: number | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey";
            columns: ["referred_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey";
            columns: ["referrer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      return_requests: {
        Row: {
          admin_notes: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          images: string[] | null;
          items: Json | null;
          order_id: string;
          reason: string;
          refund_amount: number | null;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          items?: Json | null;
          order_id: string;
          reason: string;
          refund_amount?: number | null;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          images?: string[] | null;
          items?: Json | null;
          order_id?: string;
          reason?: string;
          refund_amount?: number | null;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "return_requests_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "return_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string | null;
          id: string;
          images: string[] | null;
          is_approved: boolean | null;
          order_id: string | null;
          product_id: string | null;
          rating: number | null;
          user_id: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          images?: string[] | null;
          is_approved?: boolean | null;
          order_id?: string | null;
          product_id?: string | null;
          rating?: number | null;
          user_id?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          images?: string[] | null;
          is_approved?: boolean | null;
          order_id?: string | null;
          product_id?: string | null;
          rating?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_addresses: {
        Row: {
          area: string | null;
          building: string | null;
          city: string;
          created_at: string | null;
          id: string;
          is_default: boolean | null;
          label: string;
          landmark: string | null;
          pincode: string;
          state: string;
          street: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          area?: string | null;
          building?: string | null;
          city: string;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          label: string;
          landmark?: string | null;
          pincode: string;
          state: string;
          street?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          area?: string | null;
          building?: string | null;
          city?: string;
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          label?: string;
          landmark?: string | null;
          pincode?: string;
          state?: string;
          street?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      wishlist: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_order_with_items: {
        Args: {
          p_address_id: string;
          p_applied_promocode?: string;
          p_delivery_slot: string;
          p_discount_amount?: number;
          p_items?: Json;
          p_payment_method: string;
          p_substitution_preference?: string;
          p_total: number;
        };
        Returns: Json;
      };
      get_total_stock: { Args: never; Returns: number };
      increment_coupon_usage: {
        Args: { p_coupon_id: string };
        Returns: undefined;
      };
      is_admin: { Args: never; Returns: boolean };
      match_products: {
        Args: {
          match_count: number;
          match_threshold: number;
          query_embedding: string;
        };
        Returns: {
          description: string;
          id: string;
          images: string[];
          name: string;
          price: number;
          similarity: number;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      coupon_type: "flat" | "percentage";
      dietary_pref: "veg" | "non-veg" | "vegan";
      notification_type: "order_update" | "promo" | "system";
      order_status:
        | "pending"
        | "confirmed"
        | "packed"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "processing";
      payment_method: "card" | "upi" | "wallet" | "cod";
      user_role: "customer" | "admin" | "delivery" | "picker";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
      coupon_type: ["flat", "percentage"],
      dietary_pref: ["veg", "non-veg", "vegan"],
      notification_type: ["order_update", "promo", "system"],
      order_status: [
        "pending",
        "confirmed",
        "packed",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "processing",
      ],
      payment_method: ["card", "upi", "wallet", "cod"],
      user_role: ["customer", "admin", "delivery", "picker"],
    },
  },
} as const;
