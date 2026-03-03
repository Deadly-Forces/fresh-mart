/**
 * Supabase Database Types — auto-generated from schema
 *
 * Run `npx supabase gen types typescript --local` to regenerate from a running instance,
 * or keep this file in sync manually when migrations change.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "admin" | "delivery" | "picker";
          is_onboarded: boolean;
          dietary_preference: "veg" | "non-veg" | "vegan" | null;
          country_code: string | null;
          delivery_slot: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin" | "delivery" | "picker";
          is_onboarded?: boolean;
          dietary_preference?: "veg" | "non-veg" | "vegan" | null;
          country_code?: string | null;
          delivery_slot?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin" | "delivery" | "picker";
          is_onboarded?: boolean;
          dietary_preference?: "veg" | "non-veg" | "vegan" | null;
          country_code?: string | null;
          delivery_slot?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          building: string | null;
          street: string | null;
          area: string | null;
          landmark: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          lat: number | null;
          lng: number | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          building?: string | null;
          street?: string | null;
          area?: string | null;
          landmark?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          lat?: number | null;
          lng?: number | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          building?: string | null;
          street?: string | null;
          area?: string | null;
          landmark?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          lat?: number | null;
          lng?: number | null;
          is_default?: boolean;
          created_at?: string;
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

      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
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

      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          compare_price: number | null;
          images: string[] | null;
          stock: number;
          category_id: string | null;
          unit: string | null;
          tags: string[] | null;
          is_featured: boolean;
          is_active: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          compare_price?: number | null;
          images?: string[] | null;
          stock?: number;
          category_id?: string | null;
          unit?: string | null;
          tags?: string[] | null;
          is_featured?: boolean;
          is_active?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          compare_price?: number | null;
          images?: string[] | null;
          stock?: number;
          category_id?: string | null;
          unit?: string | null;
          tags?: string[] | null;
          is_featured?: boolean;
          is_active?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
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

      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price: number;
          stock: number;
          sku: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price: number;
          stock?: number;
          sku: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price?: number;
          stock?: number;
          sku?: string;
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

      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
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

      delivery_slots: {
        Row: {
          id: string;
          label: string;
          start_time: string;
          end_time: string;
          max_orders: number;
          current_orders: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          label: string;
          start_time: string;
          end_time: string;
          max_orders: number;
          current_orders?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          label?: string;
          start_time?: string;
          end_time?: string;
          max_orders?: number;
          current_orders?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };

      orders: {
        Row: {
          id: string;
          user_id: string | null;
          address_id: string | null;
          delivery_slot_id: string | null;
          status:
            | "pending"
            | "processing"
            | "confirmed"
            | "packed"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          subtotal: number | null;
          delivery_fee: number;
          discount: number;
          total: number;
          stripe_payment_id: string | null;
          payment_method: "card" | "upi" | "wallet" | "cod" | null;
          payment_status: string | null;
          substitution_preference: string;
          delivery_slot: string | null;
          applied_promocode: string | null;
          discount_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          address_id?: string | null;
          delivery_slot_id?: string | null;
          status?:
            | "pending"
            | "processing"
            | "confirmed"
            | "packed"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          subtotal?: number | null;
          delivery_fee?: number;
          discount?: number;
          total: number;
          stripe_payment_id?: string | null;
          payment_method?: "card" | "upi" | "wallet" | "cod" | null;
          payment_status?: string | null;
          substitution_preference?: string;
          delivery_slot?: string | null;
          applied_promocode?: string | null;
          discount_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          address_id?: string | null;
          delivery_slot_id?: string | null;
          status?:
            | "pending"
            | "processing"
            | "confirmed"
            | "packed"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          subtotal?: number | null;
          delivery_fee?: number;
          discount?: number;
          total?: number;
          stripe_payment_id?: string | null;
          payment_method?: "card" | "upi" | "wallet" | "cod" | null;
          payment_status?: string | null;
          substitution_preference?: string;
          delivery_slot?: string | null;
          applied_promocode?: string | null;
          discount_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_address_id_fkey";
            columns: ["address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_delivery_slot_id_fkey";
            columns: ["delivery_slot_id"];
            isOneToOne: false;
            referencedRelation: "delivery_slots";
            referencedColumns: ["id"];
          },
        ];
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          quantity: number;
          price: number;
          product_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          quantity: number;
          price: number;
          product_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          quantity?: number;
          price?: number;
          product_snapshot?: Json | null;
          created_at?: string;
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

      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          order_id: string | null;
          rating: number;
          comment: string | null;
          images: string[] | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          order_id?: string | null;
          rating: number;
          comment?: string | null;
          images?: string[] | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          order_id?: string | null;
          rating?: number;
          comment?: string | null;
          images?: string[] | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };

      coupons: {
        Row: {
          id: string;
          code: string;
          type: "flat" | "percentage";
          value: number;
          min_order: number;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: "flat" | "percentage";
          value: number;
          min_order?: number;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: "flat" | "percentage";
          value?: number;
          min_order?: number;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      promocodes: {
        Row: {
          id: string;
          code: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          max_discount: number | null;
          min_order_value: number;
          usage_limit: number | null;
          times_used: number;
          valid_from: string | null;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          max_discount?: number | null;
          min_order_value?: number;
          usage_limit?: number | null;
          times_used?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_type?: "percentage" | "fixed";
          discount_value?: number;
          max_discount?: number | null;
          min_order_value?: number;
          usage_limit?: number | null;
          times_used?: number;
          valid_from?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "order_update" | "promo" | "system";
          title: string;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "order_update" | "promo" | "system";
          title: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "order_update" | "promo" | "system";
          title?: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
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

      banners: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          link: string | null;
          sort_order: number;
          is_active: boolean;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          image_url: string;
          link?: string | null;
          sort_order?: number;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          image_url?: string;
          link?: string | null;
          sort_order?: number;
          is_active?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      push_subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
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
    };

    Views: {};

    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };

    Enums: {
      user_role: "customer" | "admin" | "delivery" | "picker";
      dietary_pref: "veg" | "non-veg" | "vegan";
      order_status:
        | "pending"
        | "processing"
        | "confirmed"
        | "packed"
        | "out_for_delivery"
        | "delivered"
        | "cancelled";
      payment_method: "card" | "upi" | "wallet" | "cod";
      notification_type: "order_update" | "promo" | "system";
      coupon_type: "flat" | "percentage";
    };

    CompositeTypes: {};
  };
};
