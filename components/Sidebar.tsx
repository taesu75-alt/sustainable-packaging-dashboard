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

  const [searchCompany, setSearchCompany] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [searchRep,     setSearchRep]     = useState('')

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

  const filtered = leads.filter(l => {
    const sc = searchCompany.trim().toLowerCase()
    const sp = searchProduct.trim().toLowerCase()
    const sr = searchRep.trim().toLowerCase()
    return (
      (!sc || l.company.toLowerCase().includes(sc)) &&
      (!sp || l.product.toLowerCase().includes(sp)) &&
      (!sr || l.rep.toLowerCase().includes(sr))
    )
  })

  return (
    <aside style={S.sidebar}>
      {/* Header */}
      <div style={S.sidebarHeader}>
        <div style={{ fontSize: 17, color: '#fff', fontWeight: 700 }}>영업 파이프라인</div>
        <div style={{ fontSize: 12, color: '#7a8aa0', marginTop: 3 }}>Lead Management Dashboard</div>
      </div>

      {/* Register */}
      <div style={S.section}>
        <div style={S.sectionTitle}>신규 리드 등록</div>
        <input style={S.inp} value={company} onChange={e => setCompany(e.target.value)} placeholder="고객사명" />
        <input style={S.inp} value={product} onChange={e => setProduct(e.target.value)} placeholder="대상 제품" />
        <input style={S.inp} value={rep}     onChange={e => setRep(e.target.value)}     placeholder="영업담당자"
          onKeyDown={e => e.key === 'Enter' && handleRegister()} />
        <button style={{ ...S.btnRegister, opacity: busy ? .6 : 1 }} onClick={handleRegister} disabled={busy}>
          {busy ? '등록 중...' : '+ 리드 등록'}
        </button>
      </div>

      {/* Search */}
      <div style={S.section}>
        <div style={S.sectionTitle}>리드 검색</div>
        <input style={S.inp} value={searchCompany} onChange={e => setSearchCompany(e.target.value)} placeholder="고객사명" />
        <input style={S.inp} value={searchProduct} onChange={e => setSearchProduct(e.target.value)} placeholder="대상 제품" />
        <input style={{ ...S.inp, marginBottom: 0 }} value={searchRep} onChange={e => setSearchRep(e.target.value)} placeholder="영업담당자" />
      </div>

      {/* List */}
      <div style={S.list}>
        {loading && <div style={S.hint}>불러오는 중...</div>}
        {!loading && filtered.length === 0 && <div style={S.hint}>리드가 없습니다.</div>}
        {filtered.map(l => (
          <div
            key={l.id}
            style={{ ...S.leadItem, ...(l.id === activeId ? S.leadItemActive : {}) }}
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

const S: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 300, minWidth: 300, background: '#1a2236', color: '#cdd5e0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  sidebarHeader: { padding: '22px 20px 16px', borderBottom: '1px solid #2d3a50' },
  section: { padding: '14px 20px', borderBottom: '1px solid #2d3a50' },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: '#a0afbf', marginBottom: 10 },
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
