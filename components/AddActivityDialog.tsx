'use client'

import { useState } from 'react'
import { Category, CATEGORY_LABELS } from '@/lib/types'

interface AddActivityDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (activity: { name: string; emoji: string; category: Category }) => void
}

const CATEGORY_COLORS: Record<Category, string> = {
  outdoor: '#22c55e',
  visits: '#a855f7',
  classes: '#3b82f6',
  home: '#f59e0b',
  errands: '#6b7280',
}

const COMMON_EMOJIS = ['🎪', '🎭', '🏰', '⛲', '🎠', '🧸', '🎈', '🌈', '🦋', '🐶', '🐱', '🎵', '📖', '✂️', '🖍️', '⚽']

export default function AddActivityDialog({ isOpen, onClose, onAdd }: AddActivityDialogProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎪')
  const [category, setCategory] = useState<Category>('outdoor')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), emoji, category })
    setName('')
    setEmoji('🎪')
    setCategory('outdoor')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4">Nová aktivita</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Název</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Např. Zoo, Divadlo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none text-sm"
              autoFocus
            />
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Ikona</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 text-lg rounded-lg transition-all ${
                    emoji === e
                      ? 'bg-blue-100 ring-2 ring-blue-400 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kategorie</label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    category === cat
                      ? 'text-white scale-105'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={category === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-400">Náhled:</span>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm"
              style={{
                backgroundColor: CATEGORY_COLORS[category] + '20',
                borderLeft: `3px solid ${CATEGORY_COLORS[category]}`,
              }}
            >
              <span>{emoji}</span>
              <span className="font-medium text-gray-700">{name || '...'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Přidat
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
