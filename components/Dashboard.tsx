'use client'
import { useCallback, useEffect, useState } from 'react'
import type { Lead } from '@/lib/supabase'
import Sidebar from './Sidebar'
import LeadSnapshot from './LeadSnapshot'
import LeadList from './LeadList'

export default function Dashboard() {
  const [leads, setLeads]       = useState<Lead[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showHome, setShowHome] = useState(false)
  const [loading, setLoading]   = useState(true)

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
    if (!res.ok) return alert('등록 실패')
    const newLead: Lead = await res.json()
    setLeads(prev => [newLead, ...prev])
    setActiveId(newLead.id)
  }

  async function deleteLead(id: string) {
    if (!confirm('이 리드를 삭제하시겠습니까?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    setLeads(prev => prev.filter(l => l.id !== id))
    if (activeId === id) { setActiveId(null); setShowHome(true) }
  }

  function handleHome() {
    setActiveId(null)
    setShowHome(true)
  }

  function handleSelect(id: string) {
    setActiveId(id)
    setShowHome(false)
  }

  function updateLeadLocally(updated: Lead) {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        leads={leads}
        activeId={activeId}
        loading={loading}
        onSelect={handleSelect}
        onHome={handleHome}
        onRegister={registerLead}
      />
      <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {activeLead
          ? <LeadSnapshot
              lead={activeLead}
              onDelete={deleteLead}
              onUpdate={updateLeadLocally}
            />
          : showHome
          ? <LeadList leads={leads} onSelect={handleSelect} />
          : <Welcome />
        }
      </main>
    </div>
  )
}

function Welcome() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '70vh', textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: '#eceef0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: '#45464d' }}>
        리드를 선택하거나 등록하세요
      </h2>
      <p style={{ fontSize: 13, marginTop: 8, color: '#76777d', lineHeight: 1.6 }}>
        왼쪽 상단 타이틀을 클릭하면 전체 리드 목록을 볼 수 있습니다.<br/>
        신규 리드를 등록하거나 검색으로 리드를 찾아보세요.
      </p>
    </div>
  )
}
