'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lead } from '@/lib/supabase'
import Sidebar from './Sidebar'
import LeadSnapshot from './LeadSnapshot'

export default function Dashboard() {
  const [leads, setLeads]       = useState<Lead[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
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
    if (activeId === id) setActiveId(null)
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
        onSelect={setActiveId}
        onRegister={registerLead}
      />
      <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {activeLead
          ? <LeadSnapshot
              lead={activeLead}
              onDelete={deleteLead}
              onUpdate={updateLeadLocally}
            />
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
      justifyContent: 'center', height: '70vh', color: '#8a9ab0', textAlign: 'center',
    }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: .3, marginBottom: 16 }}>
        <rect x="8" y="16" width="48" height="36" rx="4" stroke="#8a9ab0" strokeWidth="3"/>
        <path d="M20 28h24M20 36h16" stroke="#8a9ab0" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#b0bac8' }}>리드를 선택하거나 등록하세요</h2>
      <p style={{ fontSize: 13, marginTop: 6 }}>
        왼쪽 패널에서 신규 리드를 등록하거나 기존 리드를 클릭하면<br/>스냅샷 대시보드가 표시됩니다.
      </p>
    </div>
  )
}
