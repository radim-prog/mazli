import { Category } from './types'

interface DefaultActivity {
  name: string
  emoji: string
  color: string
  category: Category
  sort_order: number
}

export const DEFAULT_ACTIVITIES: DefaultActivity[] = [
  // Venku (outdoor) - zelená
  { name: 'Plavání', emoji: '🏊', color: '#22c55e', category: 'outdoor', sort_order: 1 },
  { name: 'Hřiště', emoji: '🛝', color: '#22c55e', category: 'outdoor', sort_order: 2 },
  { name: 'Procházka', emoji: '🚶', color: '#22c55e', category: 'outdoor', sort_order: 3 },
  { name: 'Park', emoji: '🌳', color: '#22c55e', category: 'outdoor', sort_order: 4 },
  { name: 'Kolo', emoji: '🚲', color: '#22c55e', category: 'outdoor', sort_order: 5 },

  // Návštěvy (visits) - fialová
  { name: 'Babička', emoji: '👵', color: '#a855f7', category: 'visits', sort_order: 6 },
  { name: 'Praděda', emoji: '👴', color: '#a855f7', category: 'visits', sort_order: 7 },
  { name: 'Kamarádi', emoji: '👨‍👩‍👧', color: '#a855f7', category: 'visits', sort_order: 8 },

  // Kroužky (classes) - modrá
  { name: 'Tvoření', emoji: '🎨', color: '#3b82f6', category: 'classes', sort_order: 9 },
  { name: 'Knihovna', emoji: '📚', color: '#3b82f6', category: 'classes', sort_order: 10 },
  { name: 'Hudba', emoji: '🎵', color: '#3b82f6', category: 'classes', sort_order: 11 },
  { name: 'Cvičení', emoji: '🤸', color: '#3b82f6', category: 'classes', sort_order: 12 },

  // Doma (home) - žlutá
  { name: 'Volný den', emoji: '🏠', color: '#f59e0b', category: 'home', sort_order: 13 },
  { name: 'Hry', emoji: '🧩', color: '#f59e0b', category: 'home', sort_order: 14 },
  { name: 'Pohádky', emoji: '🎬', color: '#f59e0b', category: 'home', sort_order: 15 },
  { name: 'Pečení', emoji: '🍪', color: '#f59e0b', category: 'home', sort_order: 16 },

  // Pochůzky (errands) - šedá
  { name: 'Nákup', emoji: '🛒', color: '#6b7280', category: 'errands', sort_order: 17 },
  { name: 'Doktor', emoji: '🏥', color: '#6b7280', category: 'errands', sort_order: 18 },
]
