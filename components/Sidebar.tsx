'use client'
import { useState } from 'react'
import type { Lead } from '@/lib/supabase'
import { LIGHT_DOT, deriveLight } from './utils'

interface Props {
  leads: Lead[]
  activeId: string | null
  onSelect: (id: string) => void
  onHome: () => void
  onNewLead: () => void
}

const NAV = [
  { key: 'pipeline', label: 'Pipeline', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 5a4 4 0 1 0 8 0 4 4 0 0 0-8 0"/></svg>
  )},
  { key: 'analytics', label: 'Analytics', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  )},
  { key: 'contacts', label: 'Contacts', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { key: 'tasks', label: 'Tasks', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  )},
  { key: 'settings', label: 'Settings', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  )},
]

export default function Sidebar({ leads, activeId, onSelect, onHome, onNewLead }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? leads.filter(l =>
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.product.toLowerCase().includes(search.toLowerCase()) ||
        l.rep.toLowerCase().includes(search.toLowerCase())
      )
    : []

  return (
    <aside style={{
      width: 220, minWidth: 220, background: '#1a2236',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      borderRight: '1px solid #2d3a50',
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2d3a50' }}>
        <div style={{
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.3,
        }}>
          친환경 패키징
        </div>
        <div style={{ fontSize: 11, color: '#7b8ba3', marginTop: 2 }}>
          Enterprise Lead Management
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        {NAV.map(item => {
          const isPipeline = item.key === 'pipeline'
          return (
            <button
              key={item.key}
              onClick={isPipeline ? onHome : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: isPipeline ? 'none' : 'none',
                borderLeft: isPipeline ? '3px solid #0051d5' : '3px solid transparent',
                background: isPipeline ? '#242f45' : 'transparent',
                color: isPipeline ? '#b4c5ff' : '#7b8ba3',
                fontSize: 13, fontWeight: isPipeline ? 700 : 500,
                cursor: isPipeline ? 'pointer' : 'default',
                marginBottom: 2, textAlign: 'left',
                transition: 'background .12s',
              }}
            >
              <span style={{ color: isPipeline ? '#b4c5ff' : '#7b8ba3', flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}

        {/* Search */}
        <div style={{ marginTop: 16, padding: '0 4px' }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: '#5a6a80',
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
          }}>
            리드 검색
          </div>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', opacity: .5, pointerEvents: 'none' }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cdd5e0" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="고객사, 제품, 담당자..."
              style={{
                width: '100%', padding: '7px 10px 7px 28px',
                background: '#242f45', border: '1px solid #3a4a60',
                borderRadius: 6, color: '#e0e8f0', fontSize: 12, outline: 'none',
              }}
            />
          </div>
          {search.trim() && (
            <div style={{ marginTop: 6 }}>
              {filtered.length === 0
                ? <div style={{ fontSize: 11, color: '#5a6a80', textAlign: 'center', padding: '8px 0' }}>결과 없음</div>
                : filtered.map(l => (
                    <div key={l.id} onClick={() => { onSelect(l.id); setSearch('') }}
                      style={{
                        padding: '7px 8px', cursor: 'pointer', borderRadius: 6,
                        background: l.id === activeId ? '#1e3a6e' : 'transparent',
                        marginBottom: 2,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e0e8f0' }}>{l.company}</div>
                      <div style={{ fontSize: 11, color: '#7a8aa0' }}>{l.product} · {l.rep}</div>
                      <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                        {(l.lead_categories ?? []).map(c => (
                          <span key={c.id} style={{ width: 7, height: 7, borderRadius: '50%', background: LIGHT_DOT[deriveLight(c.sub_items)], display: 'inline-block' }} />
                        ))}
                      </div>
                    </div>
                  ))
              }
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px 10px', borderTop: '1px solid #2d3a50' }}>
        <button
          onClick={onNewLead}
          style={{
            width: '100%', padding: '11px', background: '#0051d5', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          New Lead
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '8px 10px', background: 'none', border: 'none',
          color: '#7b8ba3', fontSize: 12, cursor: 'default', borderRadius: 6,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          Help Center
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', marginTop: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#316bf3',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>M</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e0e8f0' }}>Manager Avatar</div>
            <div style={{ fontSize: 10, color: '#7b8ba3' }}>Lead Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
