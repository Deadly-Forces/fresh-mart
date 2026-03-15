export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDef<
  Row,
  Insert,
  Update,
  Relationships extends readonly unknown[] = [],
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type EmptySchema = {
  Views: { [_ in never]: never };
  CompositeTypes: { [_ in never]: never };
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: EmptySchema & {
    Tables: {
      addresses: TableDef<
        {
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
        },
        {
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
        },
        {
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
        },
        [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      banners: TableDef<
        {
          created_at: string | null;
          ends_at: string | null;
          id: string;
          image_url: string;
          is_active: boolean | null;
          link: string | null;
          sort_order: number | null;
          starts_at: string | null;
          title: string;
        },
        {
          created_at?: string | null;
          ends_at?: string | null;
          id?: string;
          image_url: string;
          is_active?: boolean | null;
          link?: string | null;
          sort_order?: number | null;
          starts_at?: string | null;
          title: string;
        },
        {
          created_at?: string | null;
          ends_at?: string | null;
          id?: string;
          image_url?: string;
          is_active?: boolean | null;
          link?: string | null;
          sort_order?: number | null;
          starts_at?: string | null;
          title?: string;
        }
      >;
      cart_items: TableDef<
        {
          created_at: string | null;
          id: string;
          product_id: string | null;
          quantity: number;
          user_id: string | null;
          variant_id: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          quantity?: number;
          user_id?: string | null;
          variant_id?: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          quantity?: number;
          user_id?: string | null;
          variant_id?: string | null;
        },
        [
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
        ]
      >;
      categories: TableDef<
        {
          id: string;
          image_url: string | null;
          is_active: boolean | null;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number | null;
        },
        {
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number | null;
        },
        {
          id?: string;
          image_url?: string | null;
          is_active?: boolean | null;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number | null;
        },
        [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ]
      >;
      coupon_usage: TableDef<
        {
          coupon_id: string;
          id: string;
          order_id: string | null;
          used_at: string;
          user_id: string;
        },
        {
          coupon_id: string;
          id?: string;
          order_id?: string | null;
          used_at?: string;
          user_id: string;
        },
        {
          coupon_id?: string;
          id?: string;
          order_id?: string | null;
          used_at?: string;
          user_id?: string;
        },
        [
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
          {
            foreignKeyName: "coupon_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      coupons: TableDef<
        {
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
        },
        {
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
        },
        {
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
        }
      >;
      delivery_slots: TableDef<
        {
          current_orders: number | null;
          end_time: string;
          id: string;
          is_active: boolean | null;
          label: string;
          max_orders: number;
          start_time: string;
        },
        {
          current_orders?: number | null;
          end_time: string;
          id?: string;
          is_active?: boolean | null;
          label: string;
          max_orders: number;
          start_time: string;
        },
        {
          current_orders?: number | null;
          end_time?: string;
          id?: string;
          is_active?: boolean | null;
          label?: string;
          max_orders?: number;
          start_time?: string;
        }
      >;
      loyalty_transactions: TableDef<
        {
          created_at: string | null;
          description: string;
          id: string;
          order_id: string | null;
          points: number;
          type: string;
          user_id: string;
        },
        {
          created_at?: string | null;
          description: string;
          id?: string;
          order_id?: string | null;
          points: number;
          type: string;
          user_id: string;
        },
        {
          created_at?: string | null;
          description?: string;
          id?: string;
          order_id?: string | null;
          points?: number;
          type?: string;
          user_id?: string;
        },
        [
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
        ]
      >;
      newsletter_subscribers: TableDef<
        {
          email: string;
          id: string;
          is_active: boolean | null;
          subscribed_at: string | null;
        },
        {
          email: string;
          id?: string;
          is_active?: boolean | null;
          subscribed_at?: string | null;
        },
        {
          email?: string;
          id?: string;
          is_active?: boolean | null;
          subscribed_at?: string | null;
        }
      >;
      notifications: TableDef<
        {
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id?: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string | null;
        },
        [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      order_items: TableDef<
        {
          created_at: string | null;
          id: string;
          order_id: string;
          price: number;
          product_id: string | null;
          product_snapshot: Json;
          quantity: number;
          variant_id: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          order_id: string;
          price: number;
          product_id?: string | null;
          product_snapshot: Json;
          quantity: number;
          variant_id?: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          order_id?: string;
          price?: number;
          product_id?: string | null;
          product_snapshot?: Json;
          quantity?: number;
          variant_id?: string | null;
        },
        [
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
        ]
      >;
      orders: TableDef<
        {
          address_id: string | null;
          applied_promocode: string | null;
          created_at: string | null;
          delivery_fee: number | null;
          delivery_slot: string | null;
          discount_amount: number | null;
          id: string;
          notes: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status: string;
          status: Database["public"]["Enums"]["order_status"] | null;
          subtotal: number | null;
          substitution_preference: string | null;
          total: number;
          updated_at: string | null;
          user_id: string;
        },
        {
          address_id?: string | null;
          applied_promocode?: string | null;
          created_at?: string | null;
          delivery_fee?: number | null;
          delivery_slot?: string | null;
          discount_amount?: number | null;
          id?: string;
          notes?: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status?: string;
          status?: Database["public"]["Enums"]["order_status"] | null;
          subtotal?: number | null;
          substitution_preference?: string | null;
          total: number;
          updated_at?: string | null;
          user_id: string;
        },
        {
          address_id?: string | null;
          applied_promocode?: string | null;
          created_at?: string | null;
          delivery_fee?: number | null;
          delivery_slot?: string | null;
          discount_amount?: number | null;
          id?: string;
          notes?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_status?: string;
          status?: Database["public"]["Enums"]["order_status"] | null;
          subtotal?: number | null;
          substitution_preference?: string | null;
          total?: number;
          updated_at?: string | null;
          user_id?: string;
        },
        [
          {
            foreignKeyName: "orders_address_id_fkey";
            columns: ["address_id"];
            isOneToOne: false;
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      product_variants: TableDef<
        {
          id: string;
          name: string;
          price: number;
          product_id: string | null;
          sku: string;
          stock: number | null;
        },
        {
          id?: string;
          name: string;
          price: number;
          product_id?: string | null;
          sku: string;
          stock?: number | null;
        },
        {
          id?: string;
          name?: string;
          price?: number;
          product_id?: string | null;
          sku?: string;
          stock?: number | null;
        },
        [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ]
      >;
      products: TableDef<
        {
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
        },
        {
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
        },
        {
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
        },
        [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ]
      >;
      profiles: TableDef<
        {
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
        },
        {
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
        },
        {
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
        }
      >;
      push_subscriptions: TableDef<
        {
          auth: string;
          created_at: string | null;
          endpoint: string;
          id: string;
          is_active: boolean | null;
          p256dh: string;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string | null;
        },
        {
          auth: string;
          created_at?: string | null;
          endpoint: string;
          id?: string;
          is_active?: boolean | null;
          p256dh: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        },
        {
          auth?: string;
          created_at?: string | null;
          endpoint?: string;
          id?: string;
          is_active?: boolean | null;
          p256dh?: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        },
        [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      referrals: TableDef<
        {
          created_at: string | null;
          id: string;
          referred_id: string;
          referrer_id: string;
          reward_points: number | null;
          status: string;
        },
        {
          created_at?: string | null;
          id?: string;
          referred_id: string;
          referrer_id: string;
          reward_points?: number | null;
          status?: string;
        },
        {
          created_at?: string | null;
          id?: string;
          referred_id?: string;
          referrer_id?: string;
          reward_points?: number | null;
          status?: string;
        },
        [
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
        ]
      >;
      return_requests: TableDef<
        {
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
        },
        {
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
        },
        {
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
        },
        [
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
        ]
      >;
      reviews: TableDef<
        {
          comment: string | null;
          created_at: string | null;
          id: string;
          images: string[] | null;
          is_approved: boolean | null;
          order_id: string | null;
          product_id: string | null;
          rating: number | null;
          user_id: string | null;
        },
        {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          images?: string[] | null;
          is_approved?: boolean | null;
          order_id?: string | null;
          product_id?: string | null;
          rating?: number | null;
          user_id?: string | null;
        },
        {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          images?: string[] | null;
          is_approved?: boolean | null;
          order_id?: string | null;
          product_id?: string | null;
          rating?: number | null;
          user_id?: string | null;
        },
        [
          {
            foreignKeyName: "reviews_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
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
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      support_tickets: TableDef<
        {
          category: string | null;
          created_at: string | null;
          draft_response: string | null;
          email: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          message: string;
          order_id: string | null;
          priority: string | null;
          status: string;
          suggested_action: string | null;
          summary: string | null;
          updated_at: string | null;
          user_id: string | null;
        },
        {
          category?: string | null;
          created_at?: string | null;
          draft_response?: string | null;
          email: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          message: string;
          order_id?: string | null;
          priority?: string | null;
          status?: string;
          suggested_action?: string | null;
          summary?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        },
        {
          category?: string | null;
          created_at?: string | null;
          draft_response?: string | null;
          email?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          message?: string;
          order_id?: string | null;
          priority?: string | null;
          status?: string;
          suggested_action?: string | null;
          summary?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        },
        [
          {
            foreignKeyName: "support_tickets_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      wishlist: TableDef<
        {
          created_at: string | null;
          id: string;
          product_id: string | null;
          user_id: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          user_id?: string | null;
        },
        {
          created_at?: string | null;
          id?: string;
          product_id?: string | null;
          user_id?: string | null;
        },
        [
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
        ]
      >;
    };
    Functions: {
      auto_advance_orders: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_order_with_items: {
        Args: {
          p_address_id: string;
          p_applied_promocode?: string | null;
          p_delivery_slot: string;
          p_discount_amount?: number | null;
          p_items?: Json | null;
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_substitution_preference?: string | null;
          p_total: number;
        };
        Returns: Json;
      };
      generate_referral_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_total_stock: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      has_role: {
        Args: {
          required_roles: string[];
        };
        Returns: boolean;
      };
      increment_coupon_usage: {
        Args: {
          p_coupon_id: string;
        };
        Returns: undefined;
      };
      increment_loyalty_points: {
        Args: {
          p_points: number;
          p_user_id: string;
        };
        Returns: undefined;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      match_products: {
        Args: {
          match_count: number;
          match_threshold: number;
          query_embedding: string;
        };
        Returns: {
          description: string | null;
          id: string;
          images: string[];
          name: string;
          price: number;
          similarity: number;
        }[];
      };
      restore_order_inventory: {
        Args: {
          p_order_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      coupon_type: "flat" | "percentage";
      dietary_pref: "veg" | "non-veg" | "vegan";
      notification_type: "order_update" | "promo" | "system";
      order_status:
        | "pending"
        | "processing"
        | "manual_review"
        | "confirmed"
        | "packed"
        | "out_for_delivery"
        | "delivered"
        | "cancelled";
      payment_method: "card" | "upi" | "wallet" | "cod";
      user_role: "customer" | "admin" | "delivery" | "picker";
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof DatabaseWithoutInternals,
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
        "processing",
        "manual_review",
        "confirmed",
        "packed",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["card", "upi", "wallet", "cod"],
      user_role: ["customer", "admin", "delivery", "picker"],
    },
  },
} as const;
