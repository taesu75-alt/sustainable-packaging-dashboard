'use client'
import { useState } from 'react'
import type { Lead } from '@/lib/supabase'
import { LIGHT_DOT } from './utils'

interface Props {
  leads: Lead[]
  activeId: string | null
  loading: boolean
  onSelect: (id: string) => void
  onHome: () => void
  onRegister: (company: string, product: string, rep: string) => Promise<void>
}

export default function Sidebar({ leads, activeId, loading, onSelect, onHome, onRegister }: Props) {
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

  const hasSearch = searchCompany.trim() || searchProduct.trim() || searchRep.trim()
  const filtered = !hasSearch ? [] : leads.filter(l => {
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
    <aside style={{
      width: 300, minWidth: 300, background: '#1a2236', color: '#cdd5e0',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderRight: '1px solid #2d3a50',
    }}>
      {/* Brand */}
      <div
        onClick={onHome}
        style={{
          padding: '24px 20px 20px', borderBottom: '1px solid #2d3a50',
          cursor: 'pointer',
        }}
      >
        <h1 style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}>
          친환경 패키징<br/>리드 대시보드
        </h1>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#7b8ba3', marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Lead Management
        </p>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

        {/* Register */}
        <div style={{ marginBottom: 28 }}>
          <p style={LABEL}>신규 리드 등록</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={INP} value={company} onChange={e => setCompany(e.target.value)} placeholder="고객사명" />
            <input style={INP} value={product} onChange={e => setProduct(e.target.value)} placeholder="대상 제품" />
            <input style={INP} value={rep}     onChange={e => setRep(e.target.value)}     placeholder="영업담당자"
              onKeyDown={e => e.key === 'Enter' && handleRegister()} />
            <button
              onClick={handleRegister}
              disabled={busy}
              style={{
                width: '100%', padding: '10px', background: '#0051d5', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.05em', opacity: busy ? .6 : 1,
                transition: 'filter .15s',
              }}
            >
              {busy ? '등록 중...' : '+ 리드 등록'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <p style={LABEL}>리드 검색</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SearchInput value={searchCompany} onChange={setSearchCompany} placeholder="고객사명" />
            <SearchInput value={searchProduct} onChange={setSearchProduct} placeholder="대상 제품" />
            <SearchInput value={searchRep}     onChange={setSearchRep}     placeholder="영업담당자" />
          </div>
        </div>

        {/* Search results */}
        {!hasSearch && (
          <p style={{ fontSize: 12, color: '#5a6a80', textAlign: 'center', padding: '12px 0 20px' }}>
            검색어를 입력하면 리드가 표시됩니다.
          </p>
        )}
        {hasSearch && !loading && filtered.length === 0 && (
          <p style={{ fontSize: 12, color: '#5a6a80', textAlign: 'center', padding: '12px 0 20px' }}>검색 결과가 없습니다.</p>
        )}
        {filtered.map(l => (
          <div
            key={l.id}
            onClick={() => onSelect(l.id)}
            style={{
              padding: '10px 12px', cursor: 'pointer', borderRadius: 8, marginBottom: 4,
              background: l.id === activeId ? '#1e3a6e' : 'transparent',
              borderLeft: `3px solid ${l.id === activeId ? '#316bf3' : 'transparent'}`,
              transition: 'background .12s',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e8f0' }}>{l.company}</div>
            <div style={{ fontSize: 11, color: '#7a8aa0', marginTop: 2 }}>{l.product} · {l.rep}</div>
            <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
              {(l.lead_categories ?? []).map(c => (
                <span key={c.id} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: LIGHT_DOT[c.light], display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer nav */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #2d3a50' }}>
        <NavItem icon="home" label="홈 (전체 리드)" onClick={onHome} />
      </div>
    </aside>
  )
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: .5 }}
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cdd5e0" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...INP, paddingLeft: 30 }}
      />
    </div>
  )
}

function NavItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  }
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      padding: '10px 12px', background: 'none', border: 'none', borderRadius: 8,
      color: '#b4c5ff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      transition: 'background .12s',
    }}>
      {icons[icon]}
      {label}
    </button>
  )
}

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#7b8ba3',
  letterSpacing: '0.05em', textTransform: 'uppercase',
  marginBottom: 10, paddingLeft: 2,
}

const INP: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  background: '#242f45', border: '1px solid #3a4a60', borderRadius: 8,
  color: '#fff', fontSize: 13, outline: 'none',
}
