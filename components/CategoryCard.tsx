'use client'
import { useRef, useState } from 'react'
import type { Category, SubItem } from '@/lib/supabase'
import { LIGHT_DOT, LIGHT_LABEL, nextLight } from './utils'

interface Props {
  category: Category
  onUpdate: (cat: Category) => void
}

export default function CategoryCard({ category, onUpdate }: Props) {
  const [addTitle, setAddTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const detailRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  async function toggleLight() {
    const newLight = nextLight(category.light)
    const res = await fetch(`/api/categories/${category.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ light: newLight }),
    })
    if (res.ok) onUpdate({ ...category, light: newLight })
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
      onUpdate({ ...category, sub_items: [...category.sub_items, item] })
      setAddTitle('')
    }
    setBusy(false)
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    onUpdate({ ...category, sub_items: category.sub_items.filter(i => i.id !== itemId) })
  }

  async function updateDetail(itemId: string, detail: string) {
    onUpdate({
      ...category,
      sub_items: category.sub_items.map(i => i.id === itemId ? { ...i, detail } : i),
    })
    await fetch(`/api/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detail }),
    })
  }

  const dot = LIGHT_DOT[category.light]
  const lbl = LIGHT_LABEL[category.light]

  return (
    <div style={S.card}>
      {/* Header — click to toggle light */}
      <div style={S.header} onClick={toggleLight} title="클릭하여 상태 변경">
        <span style={{ ...S.dot, background: dot }} />
        <span style={S.title}>{category.name}</span>
        <span style={S.hint}>{lbl}</span>
      </div>

      {/* Body */}
      <div style={S.body}>
        {category.sub_items.length === 0
          ? <div style={S.empty}>세부 항목이 없습니다.</div>
          : category.sub_items.map(item => (
              <div key={item.id} style={S.subItem}>
                <span style={S.subTitle}>{item.title}</span>
                <textarea
                  ref={el => { detailRefs.current[item.id] = el }}
                  defaultValue={item.detail}
                  placeholder="세부 내용..."
                  style={S.textarea}
                  onBlur={e => updateDetail(item.id, e.target.value)}
                />
                <button style={S.delBtn} onClick={() => deleteItem(item.id)} title="삭제">×</button>
              </div>
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

const S: Record<string, React.CSSProperties> = {
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' },
  header: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0', cursor: 'pointer', userSelect: 'none',
  },
  dot: { width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(0,0,0,.08)', transition: 'background .2s' },
  title: { fontSize: 15, fontWeight: 700, flex: 1 },
  hint: { fontSize: 10, color: '#bbb' },
  body: { padding: '12px 16px' },
  empty: { color: '#bbb', fontSize: 13, textAlign: 'center', padding: '12px 0' },
  subItem: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid #f4f4f4' },
  subTitle: { fontSize: 13, fontWeight: 600, color: '#333', minWidth: 70, paddingTop: 4 },
  textarea: {
    flex: 1, fontSize: 12, color: '#444', border: '1px solid #d0d8e8', borderRadius: 4,
    padding: '4px 6px', resize: 'none' as const, minHeight: 36,
    fontFamily: 'inherit', outline: 'none',
  },
  delBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1 },
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
