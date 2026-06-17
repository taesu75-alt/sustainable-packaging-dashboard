'use client'
import { useState } from 'react'
import type { Lead, Category } from '@/lib/supabase'
import { deriveLight } from './utils'
import CategoryCard from './CategoryCard'

const STATUS_COLORS = {
  gray:   '#e2e3f0',
  red:    '#ef4444',
  yellow: '#f59e0b',
  green:  '#10b981',
}
const STATUS_LABEL = {
  gray:   'WAITING',
  red:    'ISSUE',
  yellow: 'IN PROGRESS',
  green:  'COMPLETE',
}
const STATUS_STYLE = {
  gray:   { bg: '#f2f4f6', color: '#45464d', border: '#e2e3f0' },
  red:    { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  yellow: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  green:  { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
}

interface Props {
  lead: Lead
  onDelete: (id: string) => void
  onUpdate: (lead: Lead) => void
}

export default function LeadSnapshot({ lead, onDelete, onUpdate }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  function updateCategory(updated: Category) {
    onUpdate({
      ...lead,
      lead_categories: lead.lead_categories.map(c => c.id === updated.id ? updated : c),
    })
  }

  const cats    = lead.lead_categories ?? []
  const date    = new Date(lead.created_at).toLocaleDateString('ko-KR')
  const initial = lead.rep.charAt(0)

  // overall lead status for badge
  const allGreen = cats.length > 0 && cats.every(c => deriveLight(c.sub_items) === 'green')
  const anyRed   = cats.some(c => deriveLight(c.sub_items) === 'red')
  const anyYellow = cats.some(c => deriveLight(c.sub_items) === 'yellow')
  const overallLight = allGreen ? 'green' : anyRed ? 'red' : anyYellow ? 'yellow' : 'gray'

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

      {/* ── Breadcrumb header ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7b8ba3', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {lead.company}
            </span>
            <span style={{ color: '#c6c6cd', fontSize: 13 }}>/</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7b8ba3', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {lead.product}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleDelete}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: '1px solid #e2e3f0',
                background: confirmDelete ? '#fee2e2' : '#fff',
                color: confirmDelete ? '#991b1b' : '#45464d',
                transition: 'all .15s',
              }}
            >
              {confirmDelete ? '정말 삭제할까요?' : '삭제'}
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: 26, fontWeight: 800, color: '#1a2236',
          letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 12,
        }}>
          {lead.company} — {lead.product}
        </h1>

        {/* Meta badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Rep */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: '#bec6e0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#131b2f',
            }}>
              {initial}
            </div>
            <span style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>{lead.rep}</span>
          </div>
          <span style={{ color: '#e2e3f0', fontSize: 14 }}>•</span>
          {/* Date */}
          <span style={{ fontSize: 12, color: '#76777d' }}>{date} 등록</span>
          <span style={{ color: '#e2e3f0', fontSize: 14 }}>•</span>
          {/* Overall status badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 999,
            background: STATUS_STYLE[overallLight].bg,
            color: STATUS_STYLE[overallLight].color,
            border: `1px solid ${STATUS_STYLE[overallLight].border}`,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[overallLight], display: 'inline-block' }} />
            {STATUS_LABEL[overallLight]}
          </span>
        </div>
      </div>

      {/* ── EXECUTION PIPELINE STATUS ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h2 style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            fontSize: 13, fontWeight: 700, color: '#45464d',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Execution Pipeline Status
          </h2>
          <div style={{ flex: 1, height: 1, background: '#e2e3f0' }} />
          {/* 8 dots summary */}
          <div style={{ display: 'flex', gap: 4 }}>
            {cats.map(c => {
              const l = deriveLight(c.sub_items)
              return (
                <span key={c.id} title={c.name} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: STATUS_COLORS[l], display: 'inline-block',
                  border: `1.5px solid ${l === 'gray' ? '#d1d5db' : STATUS_COLORS[l]}`,
                }} />
              )
            })}
          </div>
        </div>

        {/* 4×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {cats.map(cat => (
            <CategoryCard key={cat.id} category={cat} onUpdate={updateCategory} />
          ))}
        </div>
      </div>
    </div>
  )
}
