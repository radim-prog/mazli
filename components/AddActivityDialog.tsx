'use client'

import { useState } from 'react'
import { DEFAULT_CATEGORIES } from '@/lib/types'

interface AddActivityDialogProps {
  isOpen: boolean
  existingCategories: string[]
  onClose: () => void
  onAdd: (activity: { name: string; emoji: string; category: string; color: string }) => void
}

const PRESET_COLORS = ['#22c55e', '#a855f7', '#3b82f6', '#f59e0b', '#6b7280', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

const COMMON_EMOJIS = ['🎪', '🎭', '🏰', '⛲', '🎠', '🧸', '🎈', '🌈', '🦋', '🐶', '🐱', '🎵', '✂️', '🖍️', '⚽', '🎯', '🧁', '🌺']

export default function AddActivityDialog({ isOpen, existingCategories, onClose, onAdd }: AddActivityDialogProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎪')
  const [category, setCategory] = useState('outdoor')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#14b8a6')
  const [showNewCategory, setShowNewCategory] = useState(false)

  if (!isOpen) return null

  // Merge default + existing custom categories
  const allCategories: Record<string, { label: string; color: string }> = { ...DEFAULT_CATEGORIES }
  for (const cat of existingCategories) {
    if (!allCategories[cat]) {
      allCategories[cat] = { label: cat, color: '#6b7280' }
    }
  }

  const getSelectedColor = () => {
    if (showNewCategory) return newCategoryColor
    return allCategories[category]?.color ?? '#6b7280'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    let finalCategory = category
    let finalColor = allCategories[category]?.color ?? '#6b7280'

    if (showNewCategory && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-')
      finalColor = newCategoryColor
    }

    onAdd({ name: name.trim(), emoji, category: finalCategory, color: finalColor })
    setName('')
    setEmoji('🎪')
    setCategory('outdoor')
    setNewCategoryName('')
    setShowNewCategory(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 max-h-[90vh] overflow-y-auto"
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
              {Object.entries(allCategories).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setCategory(key); setShowNewCategory(false) }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    category === key && !showNewCategory
                      ? 'text-white scale-105'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={category === key && !showNewCategory ? { backgroundColor: val.color } : undefined}
                >
                  {val.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  showNewCategory
                    ? 'text-white bg-gray-700 scale-105'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300'
                }`}
              >
                + Nová
              </button>
            </div>

            {/* New category inputs */}
            {showNewCategory && (
              <div className="mt-2 p-2.5 bg-gray-50 rounded-lg flex flex-col gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Název kategorie..."
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <div className="flex gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCategoryColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newCategoryColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
            <span className="text-sm text-gray-400">Náhled:</span>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm"
              style={{
                backgroundColor: getSelectedColor() + '20',
                borderLeft: `3px solid ${getSelectedColor()}`,
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
              disabled={!name.trim() || (showNewCategory && !newCategoryName.trim())}
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
