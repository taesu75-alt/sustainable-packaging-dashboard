'use client'
import type { Lead } from '@/lib/supabase'
import { LIGHT_DOT, LIGHT_LABEL, deriveLight } from './utils'

interface Props {
  leads: Lead[]
  onSelect: (id: string) => void
}

export default function LeadList({ leads, onSelect }: Props) {
  if (leads.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', color: '#8a9ab0', textAlign: 'center',
      }}>
        <svg width="56" height="56" viewBox="0 0 64 64" fill="none" style={{ opacity: .3, marginBottom: 14 }}>
          <rect x="8" y="16" width="48" height="36" rx="4" stroke="#8a9ab0" strokeWidth="3"/>
          <path d="M20 28h24M20 36h16" stroke="#8a9ab0" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#b0bac8' }}>등록된 리드가 없습니다</h2>
        <p style={{ fontSize: 13, marginTop: 6 }}>왼쪽 패널에서 신규 리드를 등록하세요.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2236' }}>전체 리드</h2>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>총 {leads.length}건</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {leads.map(l => {
          const cats = l.lead_categories ?? []
          const date = new Date(l.created_at).toLocaleDateString('ko-KR')

          return (
            <div
              key={l.id}
              onClick={() => onSelect(l.id)}
              style={card}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1a2236' }}>{l.company}</span>
                  <span style={{ color: '#94a3b8', margin: '0 8px' }}>/</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>{l.product}</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {l.rep} · {date}
                </div>
              </div>

              {/* 8개 신호등 */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cats.map(cat => {
                  const light = deriveLight(cat.sub_items)
                  return (
                    <div key={cat.id} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 20,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                    }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: LIGHT_DOT[light], display: 'inline-block', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{cat.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: '16px 20px',
  boxShadow: '0 1px 6px rgba(0,0,0,.07)', cursor: 'pointer',
  transition: 'box-shadow .15s, transform .15s',
}
