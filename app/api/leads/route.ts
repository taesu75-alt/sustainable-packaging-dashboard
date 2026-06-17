import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CATEGORIES: { name: string; items: string[] }[] = [
  { name: '포장개발',    items: ['기존재질 / 신규재질', '연포장사 선정'] },
  { name: '공장/품질',   items: ['충전평가'] },
  { name: '영업',        items: [] },
  { name: '마케팅',      items: ['상품성 확인'] },
  { name: '디자인',      items: [] },
  { name: '구매',        items: ['기존단가/타겟단가 확인', '단가승인'] },
  { name: '경영진 승인', items: [] },
  { name: '외부고객 협의', items: [] },
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

  // 2. 카테고리 생성
  const cats = CATEGORIES.map(({ name }, i) => ({
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

  // 3. 기본 세부항목 생성
  const defaultItems = categories.flatMap((cat: any) => {
    const template = CATEGORIES.find(c => c.name === cat.name)
    return (template?.items ?? []).map((title: string) => ({
      category_id: cat.id,
      title,
      detail: '',
      light: 'gray',
    }))
  })

  let subItems: any[] = []
  if (defaultItems.length > 0) {
    const { data: si, error: siErr } = await supabase
      .from('sub_items')
      .insert(defaultItems)
      .select()
    if (siErr) return NextResponse.json({ error: siErr.message }, { status: 500 })
    subItems = si
  }

  return NextResponse.json({
    ...lead,
    lead_categories: categories.map((c: any) => ({
      ...c,
      sub_items: subItems.filter((s: any) => s.category_id === c.id),
    })),
  })
}
