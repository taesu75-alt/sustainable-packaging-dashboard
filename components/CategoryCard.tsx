'use client'
import { useState } from 'react'
import type { Category, SubItem, Light } from '@/lib/supabase'
import { LIGHT_DOT, LIGHT_LABEL, LIGHTS, deriveLight } from './utils'

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
    <div style={S.card}>
      {/* Header — 파생된 신호등 표시 (클릭 불가) */}
      <div style={S.header}>
        <span style={{ ...S.dot, background: LIGHT_DOT[derivedLight] }} />
        <span style={S.title}>{category.name}</span>
        <span style={S.hint}>{LIGHT_LABEL[derivedLight]}</span>
      </div>

      {/* Body */}
      <div style={S.body}>
        {category.sub_items.length === 0
          ? <div style={S.empty}>세부 항목을 추가하세요.</div>
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
        <div style={S.addRow}>
          <input
            value={addTitle}
            onChange={e => setAddTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="세부 항목명 입력..."
            style={S.addInp}
          />
          <button onClick={addItem} disabled={busy} style={S.addBtn}>+</button>
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
    <div style={SR.wrap}>
      {/* 항목명 + 신호등 선택 */}
      <div style={SR.top}>
        <span style={SR.title}>{item.title}</span>
        <div style={SR.lights}>
          {LIGHTS.map(l => (
            <button
              key={l}
              title={LIGHT_LABEL[l]}
              onClick={() => onLightChange(item.id, l)}
              style={{
                ...SR.lightBtn,
                background: LIGHT_DOT[l],
                opacity: item.light === l ? 1 : 0.25,
                transform: item.light === l ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        <button style={SR.delBtn} onClick={() => onDelete(item.id)} title="삭제">×</button>
      </div>

      {/* 세부내용 + 저장 */}
      <div style={SR.detailRow}>
        <textarea
          value={detail}
          onChange={e => setDetail(e.target.value)}
          placeholder="세부 내용을 입력하세요..."
          style={SR.textarea}
          rows={2}
        />
        <button
          onClick={save}
          disabled={saving}
          style={{
            ...SR.saveBtn,
            background: saved ? '#43a047' : '#2563eb',
          }}
        >
          {saving ? '...' : saved ? '완료' : '저장'}
        </button>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' },
  header: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  dot: { width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(0,0,0,.08)', transition: 'background .3s' },
  title: { fontSize: 15, fontWeight: 700, flex: 1 },
  hint: { fontSize: 10, color: '#bbb' },
  body: { padding: '12px 16px' },
  empty: { color: '#bbb', fontSize: 13, textAlign: 'center', padding: '12px 0' },
  addRow: { display: 'flex', gap: 8, marginTop: 10 },
  addInp: {
    flex: 1, padding: '6px 9px', border: '1px dashed #c0d0e0', borderRadius: 5,
    fontSize: 12, color: '#333', outline: 'none',
  },
  addBtn: {
    padding: '6px 10px', background: '#e8f0fe', border: 'none', borderRadius: 5,
    color: '#2563eb', fontSize: 18, fontWeight: 700, cursor: 'pointer',
  },
}

const SR: Record<string, React.CSSProperties> = {
  wrap: {
    borderBottom: '1px solid #f4f4f4', paddingBottom: 10, marginBottom: 10,
  },
  top: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 13, fontWeight: 600, color: '#333', flex: 1 },
  lights: { display: 'flex', gap: 5, alignItems: 'center' },
  lightBtn: {
    width: 14, height: 14, borderRadius: '50%', border: 'none', cursor: 'pointer',
    padding: 0, transition: 'opacity .15s, transform .15s',
  },
  delBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18, padding: '0 2px', lineHeight: 1 },
  detailRow: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  textarea: {
    flex: 1, fontSize: 12, color: '#444', border: '1px solid #d0d8e8', borderRadius: 4,
    padding: '5px 7px', resize: 'none' as const,
    fontFamily: 'inherit', outline: 'none',
  },
  saveBtn: {
    padding: '6px 12px', border: 'none', borderRadius: 5,
    color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap' as const, transition: 'background .3s',
  },
}
