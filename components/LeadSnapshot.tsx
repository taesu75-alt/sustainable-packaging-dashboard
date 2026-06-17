'use client'
import { useState } from 'react'
import type { Lead, Category } from '@/lib/supabase'
import { deriveLight } from './utils'
import CategoryCard from './CategoryCard'

const STATUS_COLORS = { gray:'#e2e3f0', red:'#ef4444', yellow:'#f59e0b', green:'#10b981' }
const STATUS_STYLE = {
  gray:   { bg:'#f2f4f6', color:'#45464d', border:'#e2e3f0', label:'WAITING' },
  red:    { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5', label:'URGENT' },
  yellow: { bg:'#fef3c7', color:'#92400e', border:'#fde68a', label:'IN PROGRESS' },
  green:  { bg:'#d1fae5', color:'#065f46', border:'#6ee7b7', label:'COMPLETE' },
}

interface Props {
  lead: Lead
  onDelete: (id: string) => void
  onUpdate: (lead: Lead) => void
}

export default function LeadSnapshot({ lead, onDelete, onUpdate }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cats = lead.lead_categories ?? []
  const date = new Date(lead.created_at).toLocaleDateString('ko-KR')

  const allGreen  = cats.length > 0 && cats.every(c => deriveLight(c.sub_items) === 'green')
  const anyRed    = cats.some(c => deriveLight(c.sub_items) === 'red')
  const anyYellow = cats.some(c => deriveLight(c.sub_items) === 'yellow')
  const overallLight = allGreen ? 'green' : anyRed ? 'red' : anyYellow ? 'yellow' : 'gray'
  const st = STATUS_STYLE[overallLight]

  function updateCategory(updated: Category) {
    onUpdate({ ...lead, lead_categories: cats.map(c => c.id === updated.id ? updated : c) })
  }

  function handleDelete() {
    if (confirmDelete) {
      onDelete(lead.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12, color: '#76777d' }}>
        <span>Main Pipeline</span>
        <span>›</span>
        <span>FMCG Sector</span>
      </div>

      {/* Hero header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 28, fontWeight: 800, color: '#1a2236',
              letterSpacing: '-0.02em', lineHeight: 1.2,
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              {lead.company}
              <span style={{ color: '#c6c6cd', fontWeight: 300 }}>/</span>
              <span style={{
                background: '#0051d5', color: '#fff',
                padding: '2px 14px', borderRadius: 999,
                fontSize: 22, fontWeight: 700,
              }}>
                {lead.product}
              </span>
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style={{ fontSize: 13, color: '#45464d', fontWeight: 500 }}>{lead.rep} 담당자</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <span style={{ fontSize: 13, color: '#45464d' }}>{date} 등록</span>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 4,
                background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[overallLight], display: 'inline-block' }} />
                {st.label}
              </span>
            </div>
          </div>

          {/* Delete button */}
          <div style={{ flexShrink: 0 }}>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{
                padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: '1px solid #fca5a5',
                background: '#fff', color: '#ef4444',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                리드 삭제
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setConfirmDelete(false)} style={{
                  padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid #e2e3f0', background: '#fff', color: '#45464d',
                }}>
                  취소
                </button>
                <button onClick={handleDelete} style={{
                  padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', border: 'none', background: '#ef4444', color: '#fff',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                  정말 삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execution Pipeline Status */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '20px 24px',
        boxShadow: '0px 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e3f0',
        marginBottom: 20,
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#7b8ba3',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
        }}>
          Execution Pipeline Status
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {cats.map(cat => {
            const light = deriveLight(cat.sub_items)
            return (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: STATUS_COLORS[light], display: 'block',
                  boxShadow: light !== 'gray' ? `0 0 0 4px ${STATUS_COLORS[light]}28` : 'none',
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: light === 'gray' ? '#94a3b8' : '#334155', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 4×2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
        {cats.map(cat => (
          <CategoryCard key={cat.id} category={cat} onUpdate={updateCategory} />
        ))}
      </div>
    </div>
  )
}
