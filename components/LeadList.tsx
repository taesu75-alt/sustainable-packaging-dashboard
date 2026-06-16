'use client'
import type { Lead } from '@/lib/supabase'
import { LIGHT_DOT, deriveLight } from './utils'

// 디자인 스펙 색상
const STATUS_COLORS = {
  gray:   '#e2e3f0',
  red:    '#ef4444',
  yellow: '#f59e0b',
  green:  '#10b981',
}

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
        <svg width="52" height="52" viewBox="0 0 64 64" fill="none" style={{ opacity: .25, marginBottom: 14 }}>
          <rect x="8" y="16" width="48" height="36" rx="4" stroke="#8a9ab0" strokeWidth="3"/>
          <path d="M20 28h24M20 36h16" stroke="#8a9ab0" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#b0bac8' }}>등록된 리드가 없습니다</h2>
        <p style={{ fontSize: 13, marginTop: 6, color: '#94a3b8' }}>왼쪽 패널에서 신규 리드를 등록하세요.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: 22, fontWeight: 800, color: '#1a2236', letterSpacing: '-0.02em',
          }}>
            전체 리드
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            총 {leads.length}건의 파이프라인이 관리되고 있습니다.
          </p>
        </div>
      </div>

      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', background: '#eceef0', borderRadius: 8, marginBottom: 16,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#316bf3', display: 'inline-block' }} />
        <span style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: 15, fontWeight: 700, color: '#1a2236',
        }}>
          Active Leads ({leads.length})
        </span>
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {leads.map(l => <LeadCard key={l.id} lead={l} onSelect={onSelect} />)}
      </div>
    </div>
  )
}

function LeadCard({ lead, onSelect }: { lead: Lead; onSelect: (id: string) => void }) {
  const cats  = lead.lead_categories ?? []
  const date  = new Date(lead.created_at).toLocaleDateString('ko-KR')
  const initial = lead.rep.charAt(0)

  // 전체 완료 여부로 배지 결정
  const allGreen  = cats.length > 0 && cats.every(c => deriveLight(c.sub_items) === 'green')
  const anyRed    = cats.some(c => deriveLight(c.sub_items) === 'red')
  const anyActive = cats.some(c => deriveLight(c.sub_items) !== 'gray')

  const badge = allGreen
    ? { label: 'Completed', bg: '#d1fae5', color: '#065f46' }
    : anyRed
    ? { label: 'Issue', bg: '#fee2e2', color: '#991b1b' }
    : anyActive
    ? { label: 'In Progress', bg: '#fef3c7', color: '#92400e' }
    : { label: 'New Lead', bg: '#dbe1ff', color: '#0051d5' }

  return (
    <div
      className="card-hover"
      onClick={() => onSelect(lead.id)}
      style={{
        background: '#fff', borderRadius: 12, padding: '16px 20px',
        boxShadow: '0px 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e3f0',
        cursor: 'pointer', transition: 'box-shadow .15s, transform .15s',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Traffic lights + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {cats.map(c => {
            const light = deriveLight(c.sub_items)
            return (
              <span
                key={c.id}
                title={c.name}
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: STATUS_COLORS[light], display: 'inline-block', flexShrink: 0,
                }}
              />
            )
          })}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 10px',
          borderRadius: 999, background: badge.bg, color: badge.color,
        }}>
          {badge.label}
        </span>
      </div>

      {/* Identity */}
      <div>
        <h3 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16, fontWeight: 700, color: '#1a2236', lineHeight: 1.3,
        }}>
          {lead.company}
        </h3>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#45464d', marginTop: 4 }}>
          {lead.product}
        </p>
      </div>

      {/* Divider + metadata */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid #e2e3f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#bec6e0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#131b2f', flexShrink: 0,
          }}>
            {initial}
          </div>
          <span style={{ fontSize: 12, color: '#45464d' }}>{lead.rep}</span>
        </div>
        <span style={{ fontSize: 12, color: '#76777d' }}>{date}</span>
      </div>

      {/* Stage pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {cats.slice(0, 4).map(c => {
          const light = deriveLight(c.sub_items)
          const isActive = light !== 'gray'
          return (
            <span key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 999,
              border: `1px solid ${isActive ? '#316bf3' : '#e2e3f0'}`,
              color: isActive ? '#0051d5' : '#76777d',
              fontSize: 11, fontWeight: 600,
              opacity: isActive ? 1 : 0.55,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isActive ? '#316bf3' : '#e2e3f0', display: 'inline-block',
              }} />
              {c.name}
            </span>
          )
        })}
        {cats.length > 4 && (
          <span style={{ fontSize: 11, color: '#94a3b8', padding: '3px 4px' }}>+{cats.length - 4}</span>
        )}
      </div>
    </div>
  )
}
