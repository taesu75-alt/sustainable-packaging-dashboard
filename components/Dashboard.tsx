'use client'
import { useCallback, useEffect, useState } from 'react'
import type { Lead } from '@/lib/supabase'
import Sidebar from './Sidebar'
import LeadSnapshot from './LeadSnapshot'
import LeadList from './LeadList'
import RegisterModal from './RegisterModal'

export default function Dashboard() {
  const [leads,      setLeads]      = useState<Lead[]>([])
  const [activeId,   setActiveId]   = useState<string | null>(null)
  const [showHome,   setShowHome]   = useState(false)
  const [showModal,  setShowModal]  = useState(false)
  const [loading,    setLoading]    = useState(true)

  const activeLead = leads.find(l => l.id === activeId) ?? null

  const fetchLeads = useCallback(async () => {
    const res = await fetch('/api/leads')
    if (res.ok) setLeads(await res.json())
    setLoading(false)
  }, [])
  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function registerLead(company: string, product: string, rep: string) {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, product, rep }),
    })
    if (!res.ok) { alert('등록 실패'); return }
    const newLead: Lead = await res.json()
    setLeads(prev => [newLead, ...prev])
    setActiveId(newLead.id)
    setShowHome(false)
  }

  async function deleteLead(id: string) {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    setLeads(prev => prev.filter(l => l.id !== id))
    setActiveId(null); setShowHome(true)
  }

  function updateLeadLocally(updated: Lead) {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
  }

  function handleHome() { setActiveId(null); setShowHome(true) }
  function handleSelect(id: string) { setActiveId(id); setShowHome(false) }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        leads={leads}
        activeId={activeId}
        onSelect={handleSelect}
        onHome={handleHome}
        onNewLead={() => setShowModal(true)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 28px',
          background: '#f7f9fb', borderBottom: '1px solid #e2e3f0',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: '#1a2236' }}>
              {activeLead ? 'Lead Detail View' : '전체 리드'}
            </span>
            </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {activeLead
            ? <LeadSnapshot lead={activeLead} onDelete={deleteLead} onUpdate={updateLeadLocally} />
            : showHome
            ? <LeadList leads={leads} onSelect={handleSelect} />
            : <Welcome onStart={handleHome} />
          }
        </main>
      </div>

      {showModal && (
        <RegisterModal onClose={() => setShowModal(false)} onRegister={registerLead} />
      )}
    </div>
  )
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#eceef0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: '#45464d' }}>
        파이프라인을 시작하세요
      </h2>
      <p style={{ fontSize: 13, marginTop: 8, color: '#76777d', lineHeight: 1.7 }}>
        왼쪽 사이드바의 <strong>+ New Lead</strong> 버튼으로 신규 리드를 등록하거나<br/>
        Pipeline 메뉴를 클릭해 전체 리드를 확인하세요.
      </p>
      <button onClick={onStart} style={{ marginTop: 20, padding: '10px 24px', background: '#0051d5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        전체 리드 보기
      </button>
    </div>
  )
}
