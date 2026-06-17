'use client'
import { useState } from 'react'
import type { Category, SubItem, Light } from '@/lib/supabase'
import { LIGHT_LABEL, LIGHTS, deriveLight } from './utils'

const STATUS_COLORS: Record<Light, string> = {
  gray:   '#e2e3f0',
  red:    '#ef4444',
  yellow: '#f59e0b',
  green:  '#10b981',
}
const STATUS_STYLE: Record<Light, { bg: string; color: string; border: string; label: string }> = {
  gray:   { bg: '#f2f4f6', color: '#45464d', border: '#e2e3f0', label: 'WAITING' },
  red:    { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'ISSUE' },
  yellow: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'IN PROGRESS' },
  green:  { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', label: 'COMPLETE' },
}

interface Props {
  category: Category
  onUpdate: (cat: Category) => void
}

export default function CategoryCard({ category, onUpdate }: Props) {
  const [addTitle, setAddTitle] = useState('')
  const [busy, setBusy]         = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const derivedLight = deriveLight(category.sub_items)
  const st = STATUS_STYLE[derivedLight]

  async function syncCategoryLight(items: SubItem[]) {
    const light = deriveLight(items)
    if (light !== category.light) {
      await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ light }),
      })
    }
  }

  async function addItem() {
    const title = addTitle.trim()
    if (!title) return
    setBusy(true)
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: category.id, title }),
    })
    if (res.ok) {
      const item: SubItem = await res.json()
      const newItems = [...category.sub_items, item]
      onUpdate({ ...category, sub_items: newItems, light: deriveLight(newItems) })
      setAddTitle('')
      syncCategoryLight(newItems)
    }
    setBusy(false)
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    const newItems = category.sub_items.filter(i => i.id !== itemId)
    onUpdate({ ...category, sub_items: newItems, light: deriveLight(newItems) })
    syncCategoryLight(newItems)
    if (expanded === itemId) setExpanded(null)
  }

  async function updateItemLight(itemId: string, light: Light) {
    await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ light }),
    })
    const newItems = category.sub_items.map(i => i.id === itemId ? { ...i, light } : i)
    onUpdate({ ...category, sub_items: newItems, light: deriveLight(newItems) })
    syncCategoryLight(newItems)
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      boxShadow: '0px 1px 6px rgba(0,0,0,0.07)',
      border: '1px solid #e2e3f0', overflow: 'hidden',
    }}>
      {/* ── Card Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderBottom: '1px solid #f2f4f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            background: STATUS_COLORS[derivedLight],
            boxShadow: derivedLight !== 'gray' ? `0 0 0 3px ${STATUS_COLORS[derivedLight]}30` : 'none',
            transition: 'background .3s',
          }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14, fontWeight: 700, color: '#1a2236',
          }}>
            {category.name}
          </span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          padding: '3px 8px', borderRadius: 999,
          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
        }}>
          {st.label}
        </span>
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: '10px 18px 14px' }}>

        {category.sub_items.length === 0 && (
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '8px 0 4px' }}>
            세부 항목을 추가하세요.
          </p>
        )}

        {category.sub_items.map(item => (
          <SubItemRow
            key={item.id}
            item={item}
            isExpanded={expanded === item.id}
            onToggle={() => setExpanded(prev => prev === item.id ? null : item.id)}
            onLightChange={updateItemLight}
            onDelete={deleteItem}
          />
        ))}

        {/* Add row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <input
            value={addTitle}
            onChange={e => setAddTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="세부 항목 추가..."
            style={{
              flex: 1, padding: '6px 10px',
              border: '1px dashed #c0d0e0', borderRadius: 6,
              fontSize: 12, color: '#334155', outline: 'none',
              background: '#fafbfc', fontFamily: 'Inter, sans-serif',
            }}
          />
          <button onClick={addItem} disabled={busy} style={{
            padding: '6px 12px', background: '#e8f0fe', border: 'none',
            borderRadius: 6, color: '#0051d5', fontSize: 18, fontWeight: 700, cursor: 'pointer',
          }}>
            +
          </button>
        </div>
      </div>
    </div>
  )
}

function SubItemRow({
  item, isExpanded, onToggle, onLightChange, onDelete,
}: {
  item: SubItem
  isExpanded: boolean
  onToggle: () => void
  onLightChange: (id: string, light: Light) => void
  onDelete: (id: string) => void
}) {
  const [detail, setDetail] = useState(item.detail)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const dotColor = STATUS_COLORS[item.light]

  return (
    <div style={{ borderBottom: '1px solid #f4f4f4', paddingBottom: 2, marginBottom: 2 }}>
      {/* Row: dot + title + expand toggle + delete */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 0', cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: dotColor,
          flexShrink: 0,
          boxShadow: item.light !== 'gray' ? `0 0 0 2px ${dotColor}30` : 'none',
        }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1a2236' }}>
          {item.title}
        </span>
        {item.detail && !isExpanded && (
          <span style={{ fontSize: 11, color: '#94a3b8', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.detail}
          </span>
        )}
        <span style={{ fontSize: 16, color: '#c6c6cd', lineHeight: 1, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          ›
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(item.id) }}
          style={{ background: 'none', border: 'none', color: '#c6c6cd', cursor: 'pointer', fontSize: 17, padding: '0 2px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Expanded: light selector + detail + save */}
      {isExpanded && (
        <div style={{ paddingBottom: 10, paddingLeft: 16 }}>
          {/* Light selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#7b8ba3', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginRight: 4 }}>상태</span>
            {LIGHTS.map(l => (
              <button
                key={l}
                title={LIGHT_LABEL[l]}
                onClick={() => onLightChange(item.id, l)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 9px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: item.light === l
                    ? (l === 'gray' ? '#f2f4f6' : l === 'red' ? '#fee2e2' : l === 'yellow' ? '#fef3c7' : '#d1fae5')
                    : 'transparent',
                  outline: item.light === l ? `2px solid ${STATUS_COLORS[l]}` : '2px solid transparent',
                  transition: 'all .12s',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[l], display: 'inline-block', flexShrink: 0 }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                  color: l === 'gray' ? '#45464d' : l === 'red' ? '#991b1b' : l === 'yellow' ? '#92400e' : '#065f46',
                }}>
                  {LIGHT_LABEL[l]}
                </span>
              </button>
            ))}
          </div>

          {/* Detail textarea + save */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="세부 내용을 입력하세요..."
              rows={2}
              style={{
                flex: 1, fontSize: 12, color: '#334155',
                border: '1px solid #e2e3f0', borderRadius: 6,
                padding: '6px 8px', resize: 'none',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                background: '#fafbfc',
              }}
            />
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: '7px 14px', border: 'none', borderRadius: 6,
                background: saved ? '#10b981' : '#0051d5',
                color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'background .3s',
              }}
            >
              {saving ? '...' : saved ? '완료 ✓' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
