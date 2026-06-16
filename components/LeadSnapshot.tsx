'use client'
import type { Lead, Category } from '@/lib/supabase'
import { LIGHT_DOT, LIGHT_LABEL, deriveLight } from './utils'
import CategoryCard from './CategoryCard'

const STATUS_COLORS = {
  gray:   '#e2e3f0',
  red:    '#ef4444',
  yellow: '#f59e0b',
  green:  '#10b981',
}

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

  const date    = new Date(lead.created_at).toLocaleDateString('ko-KR')
  const initial = lead.rep.charAt(0)
  const cats    = lead.lead_categories ?? []

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 22, fontWeight: 800, color: '#1a2236', letterSpacing: '-0.02em',
            }}>
              {lead.company}
              <span style={{ color: '#c6c6cd', fontWeight: 400, margin: '0 10px' }}>/</span>
              <span style={{ color: '#45464d', fontWeight: 700 }}>{lead.product}</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: '#bec6e0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#131b2f', flexShrink: 0,
                }}>
                  {initial}
                </div>
                <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{lead.rep}</span>
              </div>
              <span style={{ color: '#c6c6cd' }}>·</span>
              <span style={{ fontSize: 12, color: '#76777d' }}>등록일 {date}</span>
            </div>
          </div>
          <button
            onClick={() => onDelete(lead.id)}
            style={{
              padding: '8px 18px', background: '#fff', border: '1px solid #e2e3f0',
              borderRadius: 8, fontSize: 13, color: '#ba1a1a', cursor: 'pointer',
              fontWeight: 600, flexShrink: 0,
              transition: 'background .12s',
            }}
          >
            삭제
          </button>
        </div>
      </div>

      {/* ── 전체 신호등 요약 ── */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '14px 20px',
        boxShadow: '0px 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e3f0',
        marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8,
      }}>
        {cats.map(cat => {
          const light = deriveLight(cat.sub_items)
          return (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999,
              border: `1px solid ${light !== 'gray' ? STATUS_COLORS[light] + '60' : '#e2e3f0'}`,
              background: light !== 'gray' ? STATUS_COLORS[light] + '12' : '#f8fafc',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: STATUS_COLORS[light], display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{cat.name}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{LIGHT_LABEL[light]}</span>
            </div>
          )
        })}
      </div>

      {/* ── 4×2 Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {cats.map(cat => (
          <CategoryCard key={cat.id} category={cat} onUpdate={updateCategory} />
        ))}
      </div>
    </div>
  )
}
