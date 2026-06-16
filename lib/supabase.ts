import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

export type Light = 'gray' | 'red' | 'yellow' | 'green'

export interface SubItem {
  id: string
  category_id: string
  title: string
  detail: string
  created_at: string
}

export interface Category {
  id: string
  lead_id: string
  name: string
  light: Light
  sort_order: number
  sub_items: SubItem[]
}

export interface Lead {
  id: string
  company: string
  product: string
  rep: string
  created_at: string
  lead_categories: Category[]
}
