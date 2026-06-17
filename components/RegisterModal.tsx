'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
  onRegister: (company: string, product: string, rep: string) => Promise<void>
}

export default function RegisterModal({ onClose, onRegister }: Props) {
  const [company, setCompany] = useState('')
  const [product, setProduct] = useState('')
  const [rep,     setRep]     = useState('')
  const [busy,    setBusy]    = useState(false)

  async function handleSubmit() {
    if (!company.trim() || !product.trim() || !rep.trim()) {
      alert('모든 항목을 입력해 주세요.')
      return
    }
    setBusy(true)
    await onRegister(company.trim(), product.trim(), rep.trim())
    setBusy(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }} onClick={onClose}>
      <div
        style={{
          background: '#fff', borderRadius: 16, padding: 32, width: 400,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: '#1a2236', marginBottom: 6 }}>
          신규 리드 등록
        </h2>
        <p style={{ fontSize: 12, color: '#76777d', marginBottom: 24 }}>새 영업 리드 정보를 입력하세요.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: '고객사명', value: company, set: setCompany, placeholder: '예) 크라운제과' },
            { label: '대상 제품', value: product, set: setProduct, placeholder: '예) 죠리퐁' },
            { label: '영업담당자', value: rep, set: setRep, placeholder: '예) 전효진' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#45464d', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <input
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid #e2e3f0', borderRadius: 8,
                  fontSize: 14, color: '#1a2236', outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: 11, background: '#f2f4f6', border: 'none',
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#45464d', cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy}
            style={{
              flex: 2, padding: 11, background: '#0051d5', border: 'none',
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff',
              cursor: 'pointer', opacity: busy ? .7 : 1,
            }}
          >
            {busy ? '등록 중...' : '+ 리드 등록'}
          </button>
        </div>
      </div>
    </div>
  )
}
