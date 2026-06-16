import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  '포장개발', '공장', '영업', '마케팅',
  '디자인', '구매', '경영진 승인', '외부고객 협의',
]

export async function GET() {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      lead_categories (
        *,
        sub_items ( * )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // sub_items를 created_at 오름차순으로 정렬
  const leads = data.map((lead: any) => ({
    ...lead,
    lead_categories: (lead.lead_categories ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((cat: any) => ({
        ...cat,
        sub_items: (cat.sub_items ?? []).sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      })),
  }))

  return NextResponse.json(leads)
}

export async function POST(req: Request) {
  const { company, product, rep } = await req.json()

  // 1. lead 생성
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .insert({ company, product, rep })
    .select()
    .single()

  if (leadErr) return NextResponse.json({ error: leadErr.message }, { status: 500 })

  // 2. 8개 카테고리 생성
  const cats = CATEGORIES.map((name, i) => ({
    lead_id: lead.id,
    name,
    light: 'gray',
    sort_order: i,
  }))
  const { data: categories, error: catErr } = await supabase
    .from('lead_categories')
    .insert(cats)
    .select()

  if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 })

  return NextResponse.json({
    ...lead,
    lead_categories: categories.map((c: any) => ({ ...c, sub_items: [] })),
  })
}
