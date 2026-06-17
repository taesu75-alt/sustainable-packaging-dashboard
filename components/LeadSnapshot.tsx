'use client'
import { useState } from 'react'
import type { Lead, Category } from '@/lib/supabase'
import { deriveLight } from './utils'
import CategoryCard from './CategoryCard'

const STATUS_COLORS = { gray:'#e2e3f0', red:'#ef4444', yellow:'#f59e0b', green:'#10b981' }
const STATUS_STYLE = {
  gray:   { bg:'#f2f4f6', color:'#45464d', border:'#e2e3f0', label:'WAITING' },
  red:    { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5', label:'URGENT' },
  yellow: { bg:'#fef3c7', color:'#92400e', border:'#fde68a', label:'IN PROGRESS' },
  green:  { bg:'#d1fae5', color:'#065f46', border:'#6ee7b7', label:'COMPLETE' },
}
const PIPELINE_CATS = ['포장개발','공장','영업','마케팅','디자인','구매','경영진 승인','외부고객 협의']

interface Props {
  lead: Lead
  onDelete: (id: string) => void
  onUpdate: (lead: Lead) => void
  activeTab: 'overview'|'timeline'|'files'
}

export default function LeadSnapshot({ lead, onDelete, onUpdate, activeTab }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cats    = lead.lead_categories ?? []
  const date    = new Date(lead.created_at).toLocaleDateString('ko-KR')
  const initial = lead.rep.charAt(0)

  const allGreen  = cats.length > 0 && cats.every(c => deriveLight(c.sub_items) === 'green')
  const anyRed    = cats.some(c => deriveLight(c.sub_items) === 'red')
  const anyYellow = cats.some(c => deriveLight(c.sub_items) === 'yellow')
  const overallLight = allGreen ? 'green' : anyRed ? 'red' : anyYellow ? 'yellow' : 'gray'
  const st = STATUS_STYLE[overallLight]

  function updateCategory(updated: Category) {
    onUpdate({ ...lead, lead_categories: cats.map(c => c.id === updated.id ? updated : c) })
  }

  function handleDelete() {
    if (confirmDelete) { onDelete(lead.id) }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 12, color: '#76777d' }}>
        <span>Main Pipeline</span>
        <span>›</span>
        <span>FMCG Sector</span>
      </div>

      {/* Hero header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 28, fontWeight: 800, color: '#1a2236',
              letterSpacing: '-0.02em', lineHeight: 1.2,
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              {lead.company}
              <span style={{ color: '#c6c6cd', fontWeight: 300 }}>/</span>
              <span style={{
                background: '#0051d5', color: '#fff',
                padding: '2px 14px', borderRadius: 999,
                fontSize: 22, fontWeight: 700,
              }}>
                {lead.product}
              </span>
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style={{ fontSize: 13, color: '#45464d', fontWeight: 500 }}>{lead.rep} 담당자</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#76777d" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <span style={{ fontSize: 13, color: '#45464d' }}>{date} 등록</span>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 4,
                background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[overallLight], display: 'inline-block' }} />
                {st.label}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button style={{
              padding: '9px 18px', background: '#fff', border: '1px solid #e2e3f0',
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#45464d', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Detail
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                background: confirmDelete ? '#fee2e2' : '#0051d5',
                color: confirmDelete ? '#991b1b' : '#fff',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
              }}
            >
              {confirmDelete ? '정말 삭제?' : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
                  Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Execution Pipeline Status */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '20px 24px',
        boxShadow: '0px 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e3f0',
        marginBottom: 20,
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: '#7b8ba3',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16,
        }}>
          Execution Pipeline Status
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {cats.map(cat => {
            const light = deriveLight(cat.sub_items)
            return (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: STATUS_COLORS[light], display: 'block',
                  boxShadow: light !== 'gray' ? `0 0 0 4px ${STATUS_COLORS[light]}28` : 'none',
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: light === 'gray' ? '#94a3b8' : '#334155', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* 4×2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
            {cats.map(cat => (
              <CategoryCard key={cat.id} category={cat} onUpdate={updateCategory} />
            ))}
          </div>

          {/* Bottom: Timeline + Account Snapshot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Timeline */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0px 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e3f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: '#1a2236' }}>Timeline Activity</h3>
                <span style={{ fontSize: 12, color: '#0051d5', fontWeight: 600, cursor: 'pointer' }}>View Log →</span>
              </div>
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 11, top: 4, bottom: 4, width: 2, background: '#e2e3f0' }} />
                {cats.filter(c => deriveLight(c.sub_items) !== 'gray').slice(0, 3).map((cat, i) => {
                  const light = deriveLight(cat.sub_items)
                  return (
                    <div key={cat.id} style={{ position: 'relative', marginBottom: 20 }}>
                      <div style={{
                        position: 'absolute', left: -28, top: 2,
                        width: 22, height: 22, borderRadius: '50%',
                        background: STATUS_COLORS[light],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          {light === 'green' ? <polyline points="20 6 9 17 4 12"/> : light === 'red' ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></> : <path d="M12 8v4l3 3"/>}
                        </svg>
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>최근 업데이트 · {lead.rep}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2236', marginBottom: 2 }}>{cat.name} 단계 {light === 'green' ? '완료' : light === 'red' ? '이슈 발생' : '진행 중'}</p>
                      {cat.sub_items[0] && <p style={{ fontSize: 12, color: '#64748b' }}>{cat.sub_items[0].detail || cat.sub_items[0].title}</p>}
                    </div>
                  )
                })}
                {cats.filter(c => deriveLight(c.sub_items) !== 'gray').length === 0 && (
                  <p style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 4 }}>아직 활동 내역이 없습니다.</p>
                )}
              </div>
            </div>

            {/* Account Snapshot */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0px 1px 6px rgba(0,0,0,0.07)', border: '1px solid #e2e3f0' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a2236', marginBottom: 16 }}>Account Snapshot</h3>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>EXPECTED REVENUE</p>
                  <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: '#1a2236' }}>—</p>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>PROBABILITY</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#e2e3f0', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.round((cats.filter(c => deriveLight(c.sub_items) === 'green').length / Math.max(cats.length, 1)) * 100)}%`, background: '#0051d5', borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                      {Math.round((cats.filter(c => deriveLight(c.sub_items) === 'green').length / Math.max(cats.length, 1)) * 100)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>KEY STAKEHOLDERS</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {[lead.rep.charAt(0), 'M', 'S'].map((ch, i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: ['#bec6e0','#316bf3','#10b981'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -6 : 0, border: '2px solid #fff' }}>
                        {ch}
                      </div>
                    ))}
                    <span style={{ fontSize: 11, color: '#76777d', marginLeft: 4 }}>+{lead.rep}</span>
                  </div>
                </div>
              </div>

              {/* Manager Note */}
              <div style={{ background: '#1a2236', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#b4c5ff', marginBottom: 10 }}>Manager Note</p>
                <p style={{ fontSize: 12, color: '#8189a2', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "{lead.company}의 {lead.product} 프로젝트를 체계적으로 관리하세요. 각 항목의 세부사항을 기록하고 신호등 상태를 업데이트해 진행 현황을 팀과 공유하세요."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#316bf3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {lead.rep.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#e0e8f0' }}>{lead.rep}</p>
                    <p style={{ fontSize: 10, color: '#7b8ba3' }}>Sales Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'timeline' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e3f0' }}>
          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>타임라인 기능은 준비 중입니다.</p>
        </div>
      )}

      {activeTab === 'files' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e3f0' }}>
          <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>파일 관리 기능은 준비 중입니다.</p>
        </div>
      )}
    </div>
  )
}
