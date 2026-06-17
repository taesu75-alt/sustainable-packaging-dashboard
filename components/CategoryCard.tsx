'use client'
import { useState } from 'react'
import type { Category, SubItem, Light } from '@/lib/supabase'
import { LIGHT_LABEL, LIGHTS, deriveLight } from './utils'

const STATUS_COLORS: Record<Light, string> = {
  gray: '#e2e3f0', red: '#ef4444', yellow: '#f59e0b', green: '#10b981',
}
const STATUS_STYLE: Record<Light, { bg: string; color: string; border: string; label: string; cardBorder: string }> = {
  gray:   { bg: '#f2f4f6', color: '#45464d', border: '#e2e3f0', label: 'WAITING',     cardBorder: '#e2e3f0' },
  red:    { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'ISSUE',        cardBorder: '#ef4444' },
  yellow: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'IN PROGRESS', cardBorder: '#f59e0b' },
  green:  { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', label: 'COMPLETE',    cardBorder: '#10b981' },
}

interface Props {
  category: Category
  onUpdate: (cat: Category) => void
}

export default function CategoryCard({ category, onUpdate }: Props) {
  const [addTitle, setAddTitle] = useState('')
  const [busy, setBusy]         = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const derived = deriveLight(category.sub_items)
  const st      = STATUS_STYLE[derived]

  async function syncLight(items: SubItem[]) {
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
      const next = [...category.sub_items, item]
      onUpdate({ ...category, sub_items: next, light: deriveLight(next) })
      setAddTitle('')
      syncLight(next)
    }
    setBusy(false)
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    const next = category.sub_items.filter(i => i.id !== itemId)
    onUpdate({ ...category, sub_items: next, light: deriveLight(next) })
    syncLight(next)
    if (expanded === itemId) setExpanded(null)
  }

  async function updateItemLight(itemId: string, light: Light) {
    await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ light }),
    })
    const next = category.sub_items.map(i => i.id === itemId ? { ...i, light } : i)
    onUpdate({ ...category, sub_items: next, light: deriveLight(next) })
    syncLight(next)
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
      border: '1px solid #e2e3f0',
      borderLeft: `4px solid ${st.cardBorder}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #f2f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
            background: STATUS_COLORS[derived],
            boxShadow: derived !== 'gray' ? `0 0 0 3px ${STATUS_COLORS[derived]}25` : 'none',
          }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: '#1a2236' }}>
            {category.name}
          </span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
          padding: '2px 7px', borderRadius: 4,
          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
        }}>
          {st.label}
        </span>
      </div>

      {/* Sub-items */}
      <div style={{ padding: '10px 14px 12px' }}>
        {category.sub_items.length === 0 && (
          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '6px 0 4px' }}>세부 항목을 추가하세요.</p>
        )}

        {category.sub_items.map(item => (
          <SubItemRow
            key={item.id}
            item={item}
            isExpanded={expanded === item.id}
            onToggle={() => setExpanded(p => p === item.id ? null : item.id)}
            onLightChange={updateItemLight}
            onDelete={deleteItem}
          />
        ))}

        {/* Add */}
        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
          <input
            value={addTitle}
            onChange={e => setAddTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="세부 항목 추가..."
            style={{
              flex: 1, padding: '5px 8px',
              border: '1px dashed #c0d0e0', borderRadius: 5,
              fontSize: 11, color: '#334155', outline: 'none',
              background: '#fafbfc', fontFamily: 'Inter, sans-serif',
            }}
          />
          <button onClick={addItem} disabled={busy} style={{
            padding: '5px 10px', background: '#e8f0fe', border: 'none',
            borderRadius: 5, color: '#0051d5', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>+</button>
        </div>
      </div>
    </div>
  )
}

function SubItemRow({ item, isExpanded, onToggle, onLightChange, onDelete }: {
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

  const dot = STATUS_COLORS[item.light]

  return (
    <div style={{ borderBottom: '1px solid #f4f4f4', marginBottom: 1 }}>
      {/* Row */}
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '7px 0', cursor: 'pointer' }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: dot,
          flexShrink: 0, marginTop: 4,
          boxShadow: item.light !== 'gray' ? `0 0 0 2px ${dot}30` : 'none',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1a2236', lineHeight: 1.4 }}>{item.title}</div>
          {item.detail && !isExpanded && (
            <div style={{ fontSize: 11, color: '#76777d', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.detail}
            </div>
          )}
        </div>
        <span style={{ fontSize: 14, color: '#c6c6cd', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s', marginTop: 1 }}>›</span>
        <button onClick={e => { e.stopPropagation(); onDelete(item.id) }}
          style={{ background: 'none', border: 'none', color: '#c6c6cd', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1 }}>×</button>
      </div>

      {/* Expanded edit */}
      {isExpanded && (
        <div style={{ paddingLeft: 15, paddingBottom: 10 }}>
          {/* Light selector */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
            {LIGHTS.map(l => (
              <button key={l} title={LIGHT_LABEL[l]} onClick={() => onLightChange(item.id, l)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: item.light === l
                    ? (l === 'gray' ? '#f2f4f6' : l === 'red' ? '#fee2e2' : l === 'yellow' ? '#fef3c7' : '#d1fae5')
                    : '#f8fafc',
                  outline: item.light === l ? `2px solid ${STATUS_COLORS[l]}` : '2px solid transparent',
                  transition: 'all .1s',
                }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[l], display: 'inline-block' }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.03em',
                  color: l === 'gray' ? '#45464d' : l === 'red' ? '#991b1b' : l === 'yellow' ? '#92400e' : '#065f46',
                }}>{LIGHT_LABEL[l]}</span>
              </button>
            ))}
          </div>
          {/* Detail + save */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <textarea value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="세부 내용..." rows={2}
              style={{
                flex: 1, fontSize: 12, color: '#334155',
                border: '1px solid #e2e3f0', borderRadius: 6,
                padding: '5px 7px', resize: 'none',
                fontFamily: 'Inter, sans-serif', outline: 'none', background: '#fafbfc',
              }} />
            <button onClick={save} disabled={saving} style={{
              padding: '6px 12px', border: 'none', borderRadius: 6,
              background: saved ? '#10b981' : '#0051d5',
              color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'background .3s',
            }}>
              {saving ? '...' : saved ? '완료 ✓' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
