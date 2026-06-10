export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type BookingStatus  = 'active' | 'completed' | 'cancelled'
export type OrderStatus    = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'cancelled'
export type WaitlistStatus = 'waiting' | 'notified' | 'cancelled'
export type TableSection   = 'indoor' | 'semi-outdoor-1' | 'semi-outdoor-2'

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: number
          booking_code: string
          table_id: string
          guest_name: string
          guest_phone: string
          guest_email: string | null
          party_size: number
          booking_date: string
          booking_time: string
          special_request: string | null
          status: BookingStatus
          is_seen: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      floor_tables: {
        Row: {
          id: string
          section: TableSection
          capacity: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['floor_tables']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['floor_tables']['Insert']>
      }
      orders: {
        Row: {
          id: number
          order_code: string
          table_number: string | null
          guest_name: string
          guest_phone: string
          notes: string | null
          total_amount: number
          status: OrderStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          menu_item_id: number
          item_name: string
          price: number
          quantity: number
          subtotal: number
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      waitlist: {
        Row: {
          id: number
          waitlist_code: string
          guest_name: string
          guest_phone: string
          guest_email: string | null
          party_size: number
          preferred_date: string
          preferred_time: string
          special_request: string | null
          status: WaitlistStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>
      }
      menu_items: {
        Row: {
          id: number
          name_en: string
          name_id: string
          description_en: string | null
          description_id: string | null
          category: string
          subcategory: string
          price: number
          image: string | null
          is_available: boolean
          is_featured: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
      }
      reviews: {
        Row: {
          id: number
          reviewer_name: string
          booking_code: string | null
          order_code: string | null
          comment: string | null
          ratings: Json
          overall_rating: number | null
          is_verified: boolean
          is_published: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      gallery_items: {
        Row: {
          id: number
          src: string
          alt_en: string
          alt_id: string
          section: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gallery_items']['Insert']>
      }
      site_settings: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: Database['public']['Tables']['site_settings']['Row']
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>
      }
    }
  }
}
