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

const STATUS_BG: Record<Light, string> = {
  gray:   'transparent',
  red:    '#fee2e2',
  yellow: '#fef3c7',
  green:  '#d1fae5',
}

const STATUS_TEXT: Record<Light, string> = {
  gray:   '#76777d',
  red:    '#991b1b',
  yellow: '#92400e',
  green:  '#065f46',
}

interface Props {
  category: Category
  onUpdate: (cat: Category) => void
}

export default function CategoryCard({ category, onUpdate }: Props) {
  const [addTitle, setAddTitle] = useState('')
  const [busy, setBusy] = useState(false)

  const derivedLight = deriveLight(category.sub_items)

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
      boxShadow: '0px 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e3f0',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px', borderBottom: '1px solid #f0f0f0',
      }}>
        <span style={{
          width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
          background: STATUS_COLORS[derivedLight],
          border: `2px solid ${derivedLight === 'gray' ? '#d1d5db' : STATUS_COLORS[derivedLight]}`,
          transition: 'background .3s',
        }} />
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14, fontWeight: 700, flex: 1, color: '#1a2236',
        }}>
          {category.name}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 999,
          background: STATUS_BG[derivedLight],
          color: STATUS_TEXT[derivedLight],
          border: `1px solid ${derivedLight === 'gray' ? '#e2e3f0' : STATUS_COLORS[derivedLight] + '40'}`,
        }}>
          {LIGHT_LABEL[derivedLight]}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 18px' }}>
        {category.sub_items.length === 0
          ? <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>
              세부 항목을 추가하세요.
            </div>
          : category.sub_items.map(item => (
              <SubItemRow
                key={item.id}
                item={item}
                onLightChange={updateItemLight}
                onDelete={deleteItem}
              />
            ))
        }

        {/* Add row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            value={addTitle}
            onChange={e => setAddTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="세부 항목명 입력..."
            style={{
              flex: 1, padding: '7px 10px', border: '1px dashed #c0d0e0', borderRadius: 6,
              fontSize: 12, color: '#334155', outline: 'none', background: '#fafbfc',
            }}
          />
          <button onClick={addItem} disabled={busy} style={{
            padding: '7px 12px', background: '#e8f0fe', border: 'none', borderRadius: 6,
            color: '#0051d5', fontSize: 18, fontWeight: 700, cursor: 'pointer',
          }}>+</button>
        </div>
      </div>
    </div>
  )
}

function SubItemRow({
  item,
  onLightChange,
  onDelete,
}: {
  item: SubItem
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
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={{
      borderBottom: '1px solid #f4f4f4', paddingBottom: 10, marginBottom: 10,
    }}>
      {/* 항목명 + 신호등 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2236', flex: 1 }}>{item.title}</span>
        {/* 신호등 4색 선택 */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {LIGHTS.map(l => (
            <button
              key={l}
              title={LIGHT_LABEL[l]}
              onClick={() => onLightChange(item.id, l)}
              style={{
                width: 14, height: 14, borderRadius: '50%',
                background: STATUS_COLORS[l],
                border: item.light === l ? `2px solid #1a2236` : '2px solid transparent',
                cursor: 'pointer', padding: 0,
                opacity: item.light === l ? 1 : 0.3,
                transform: item.light === l ? 'scale(1.25)' : 'scale(1)',
                transition: 'opacity .15s, transform .15s',
              }}
            />
          ))}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          style={{ background: 'none', border: 'none', color: '#c6c6cd', cursor: 'pointer', fontSize: 18, padding: '0 2px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* 세부내용 + 저장 */}
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
  )
}
