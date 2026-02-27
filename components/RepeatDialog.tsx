'use client'

import { useState } from 'react'

interface RepeatDialogProps {
  activityName: string
  activityEmoji: string
  onConfirm: (weeks: number) => void
  onClose: () => void
}

const QUICK_OPTIONS = [2, 4, 6, 8, 10, 12]

export default function RepeatDialog({ activityName, activityEmoji, onConfirm, onClose }: RepeatDialogProps) {
  const [custom, setCustom] = useState('')

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseInt(custom)
    if (n > 0 && n <= 52) onConfirm(n)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-1">
          Opakovat do dalších týdnů
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {activityEmoji} {activityName} — kolikrát zopakovat?
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {QUICK_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => onConfirm(n)}
              className="px-3 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-base transition-colors"
            >
              {n}×
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className="flex gap-2 mb-3">
          <input
            type="number"
            min="1"
            max="52"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Jiný počet..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
          />
          <button
            type="submit"
            disabled={!custom || parseInt(custom) < 1}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 rounded-lg transition-colors"
          >
            OK
          </button>
        </form>

        <p className="text-xs text-gray-400 mb-3">
          Vytvoří nezávislé kopie na stejný den a čas v dalších týdnech.
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Zrušit
        </button>
      </div>
    </div>
  )
}
