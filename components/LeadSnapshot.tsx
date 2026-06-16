'use client'
import type { Lead, Category } from '@/lib/supabase'
import CategoryCard from './CategoryCard'

interface Props {
  lead: Lead
  onDelete: (id: string) => void
  onUpdate: (lead: Lead) => void
}

export default function LeadSnapshot({ lead, onDelete, onUpdate }: Props) {
  function updateCategory(updated: Category) {
    onUpdate({
      ...lead,
      lead_categories: lead.lead_categories.map(c => c.id === updated.id ? updated : c),
    })
  }

  const date = new Date(lead.created_at).toLocaleDateString('ko-KR')

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2236' }}>{lead.company}</h2>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <Badge>{lead.product}</Badge>
            <Badge color="#e8f5e9" text="#2e7d32">{lead.rep}</Badge>
            <Badge color="#f5f5f5" text="#888">{date}</Badge>
          </div>
        </div>
        <button
          onClick={() => onDelete(lead.id)}
          style={{
            padding: '7px 16px', background: '#fff', border: '1px solid #e0e0e0',
            borderRadius: 6, fontSize: 13, color: '#c0392b', cursor: 'pointer',
          }}
        >
          삭제
        </button>
      </div>

      {/* 4×2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {lead.lead_categories.map(cat => (
          <CategoryCard key={cat.id} category={cat} onUpdate={updateCategory} />
        ))}
      </div>
    </div>
  )
}

function Badge({ children, color = '#e0e8f8', text = '#2563eb' }: {
  children: React.ReactNode; color?: string; text?: string
}) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: color, color: text,
    }}>
      {children}
    </span>
  )
}
