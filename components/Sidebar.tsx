'use client'
import { useState } from 'react'
import type { Lead } from '@/lib/supabase'
import { LIGHT_DOT } from './utils'

interface Props {
  leads: Lead[]
  activeId: string | null
  loading: boolean
  onSelect: (id: string) => void
  onRegister: (company: string, product: string, rep: string) => Promise<void>
}

export default function Sidebar({ leads, activeId, loading, onSelect, onRegister }: Props) {
  const [company, setCompany] = useState('')
  const [product, setProduct] = useState('')
  const [rep,     setRep]     = useState('')
  const [busy,    setBusy]    = useState(false)

  async function handleRegister() {
    if (!company.trim() || !product.trim() || !rep.trim()) {
      alert('고객사, 대상제품, 영업담당자를 모두 입력해 주세요.')
      return
    }
    setBusy(true)
    await onRegister(company.trim(), product.trim(), rep.trim())
    setCompany(''); setProduct(''); setRep('')
    setBusy(false)
  }

  const totalCount = leads.length
  const greenCount = leads.filter(l => l.lead_categories?.some(c => c.light === 'green')).length
  const redCount   = leads.filter(l => l.lead_categories?.some(c => c.light === 'red')).length

  return (
    <aside style={S.sidebar}>
      {/* Header */}
      <div style={S.sidebarHeader}>
        <div style={{ fontSize: 17, color: '#fff', fontWeight: 700 }}>영업 파이프라인</div>
        <div style={{ fontSize: 12, color: '#7a8aa0', marginTop: 3 }}>Lead Management Dashboard</div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        <StatBox num={totalCount} label="전체 리드" />
        <StatBox num={greenCount} label="진행(초록)" color="#43a047" />
        <StatBox num={redCount}   label="이슈(빨강)" color="#e53935" />
      </div>

      {/* Register */}
      <div style={S.registerArea}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#a0afbf', marginBottom: 12 }}>신규 리드 등록</div>
        <input style={S.inp} value={company} onChange={e => setCompany(e.target.value)} placeholder="고객사명" />
        <input style={S.inp} value={product} onChange={e => setProduct(e.target.value)} placeholder="대상 제품" />
        <input style={S.inp} value={rep}     onChange={e => setRep(e.target.value)}     placeholder="영업담당자"
          onKeyDown={e => e.key === 'Enter' && handleRegister()} />
        <button style={{ ...S.btnRegister, opacity: busy ? .6 : 1 }} onClick={handleRegister} disabled={busy}>
          {busy ? '등록 중...' : '+ 리드 등록'}
        </button>
      </div>

      {/* List */}
      <div style={S.list}>
        {loading && <div style={S.hint}>불러오는 중...</div>}
        {!loading && leads.length === 0 && <div style={S.hint}>등록된 리드가 없습니다.</div>}
        {leads.map(l => (
          <div
            key={l.id}
            style={{
              ...S.leadItem,
              ...(l.id === activeId ? S.leadItemActive : {}),
            }}
            onClick={() => onSelect(l.id)}
          >
            <div style={{ fontSize: 14, color: '#e0e8f0', fontWeight: 600 }}>{l.company}</div>
            <div style={{ fontSize: 11, color: '#7a8aa0', marginTop: 2 }}>{l.product} · {l.rep}</div>
            <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
              {(l.lead_categories ?? []).map(c => (
                <span key={c.id} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: LIGHT_DOT[c.light],
                  display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function StatBox({ num, label, color }: { num: number; label: string; color?: string }) {
  return (
    <div style={{ flex: 1, background: '#242f45', borderRadius: 8, padding: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? '#fff' }}>{num}</div>
      <div style={{ fontSize: 11, color: '#7a8aa0', marginTop: 2 }}>{label}</div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 300, minWidth: 300, background: '#1a2236', color: '#cdd5e0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  sidebarHeader: { padding: '22px 20px 16px', borderBottom: '1px solid #2d3a50' },
  statsRow: { padding: '16px 20px', borderBottom: '1px solid #2d3a50', display: 'flex', gap: 10 },
  registerArea: { padding: '16px 20px', borderBottom: '1px solid #2d3a50' },
  inp: {
    width: '100%', padding: '8px 10px', marginBottom: 8,
    background: '#242f45', border: '1px solid #3a4a60', borderRadius: 6,
    color: '#e0e8f0', fontSize: 13, outline: 'none',
  },
  btnRegister: {
    width: '100%', padding: 9, background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  list: { flex: 1, overflowY: 'auto' as const, padding: '12px 0' },
  hint: { padding: '20px', color: '#5a6a80', fontSize: 13, textAlign: 'center' },
  leadItem: {
    padding: '10px 20px', cursor: 'pointer', borderLeft: '3px solid transparent',
  },
  leadItemActive: { background: '#1e3a6e', borderLeftColor: '#4a90d9' },
}
