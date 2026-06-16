import type { Light, Category } from '@/lib/supabase'

export const LIGHTS: Light[] = ['gray', 'red', 'yellow', 'green']

export const LIGHT_DOT: Record<Light, string> = {
  gray:   '#b0b8c4',
  red:    '#e53935',
  yellow: '#f9a825',
  green:  '#43a047',
}

export const LIGHT_LABEL: Record<Light, string> = {
  gray:   '미확인',
  red:    '이슈',
  yellow: '진행',
  green:  '완료',
}

export function nextLight(current: Light): Light {
  return LIGHTS[(LIGHTS.indexOf(current) + 1) % LIGHTS.length]
}

// 세부항목 신호등으로 카테고리 신호등 자동 계산
export function deriveLight(items: { light: Light }[]): Light {
  if (items.length === 0) return 'gray'
  if (items.some(i => i.light === 'red'))    return 'red'
  if (items.some(i => i.light === 'yellow')) return 'yellow'
  if (items.every(i => i.light === 'green')) return 'green'
  return 'gray'
}
