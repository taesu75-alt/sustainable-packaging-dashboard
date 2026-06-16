'use client'
import type { Lead, Category } from '@/lib/supabase'
import { LIGHT_DOT, LIGHT_LABEL, deriveLight } from './utils'
import CategoryCard from './CategoryCard'

interface Props {
  lead: Lead
  onDelete: (id: string) => void
  onUpdate: (lead: Lead) => void
}

export default function LeadSnapshot({ lead, onDelete, onUpdate }: Props) {
  function updateCategory(updated: Category) {
    onUpdate({
      ...lead,
      lead_categories: lead.lead_categories.map(c => c.id === updated.id ? updated : c),
    })
  }

  const date = new Date(lead.created_at).toLocaleDateString('ko-KR')

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a2236', letterSpacing: '-0.5px' }}>
            {lead.company}
            <span style={{ color: '#94a3b8', fontWeight: 400, margin: '0 8px' }}>/</span>
            {lead.product}
          </h2>
          <button
            onClick={() => onDelete(lead.id)}
            style={{
              padding: '7px 16px', background: '#fff', border: '1px solid #e0e0e0',
              borderRadius: 6, fontSize: 13, color: '#c0392b', cursor: 'pointer', flexShrink: 0,
            }}
          >
            삭제
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: '#64748b' }}>
          <span>담당자: <strong style={{ color: '#334155' }}>{lead.rep}</strong></span>
          <span>등록일: <strong style={{ color: '#334155' }}>{date}</strong></span>
        </div>
      </div>

      {/* ── 전체 신호등 요약 ── */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        background: '#fff', borderRadius: 12, padding: '14px 18px',
        boxShadow: '0 1px 6px rgba(0,0,0,.07)', marginBottom: 20,
      }}>
        {lead.lead_categories.map(cat => {
          const light = deriveLight(cat.sub_items)
          const dot   = LIGHT_DOT[light]
          return (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: '#f8fafc', border: '1px solid #e2e8f0',
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%',
                background: dot, display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{cat.name}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{LIGHT_LABEL[light]}</span>
            </div>
          )
        })}
      </div>

      {/* ── 4×2 Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {lead.lead_categories.map(cat => (
          <CategoryCard key={cat.id} category={cat} onUpdate={updateCategory} />
        ))}
      </div>
    </div>
  )
}
