import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const { category_id, title } = await req.json()
  const { data, error } = await supabase
    .from('sub_items')
    .insert({ category_id, title, detail: '' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
