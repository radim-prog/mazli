'use client'

import { getWeekNumber, formatWeekRange, getWeekStart, formatDate } from '@/lib/utils'

interface WeekNavigationProps {
  weekStart: Date
  onWeekChange: (weekStart: Date) => void
}

export default function WeekNavigation({ weekStart, onWeekChange }: WeekNavigationProps) {
  const weekNum = getWeekNumber(weekStart)
  const year = weekStart.getFullYear()
  const isCurrentWeek = formatDate(weekStart) === formatDate(getWeekStart(new Date()))

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          const prev = new Date(weekStart)
          prev.setDate(prev.getDate() - 7)
          onWeekChange(prev)
        }}
        className="px-2 py-1 text-gray-500 hover:text-gray-800 hover:bg-white/80 rounded-md transition-colors text-lg"
        aria-label="Předchozí týden"
      >
        &larr;
      </button>

      <div className="text-center">
        <div className="font-bold text-gray-800 text-sm sm:text-base">
          Týden {weekNum}/{year}
        </div>
        <div className="text-xs text-gray-500">
          {formatWeekRange(weekStart)}
        </div>
      </div>

      <button
        onClick={() => {
          const next = new Date(weekStart)
          next.setDate(next.getDate() + 7)
          onWeekChange(next)
        }}
        className="px-2 py-1 text-gray-500 hover:text-gray-800 hover:bg-white/80 rounded-md transition-colors text-lg"
        aria-label="Další týden"
      >
        &rarr;
      </button>

      {!isCurrentWeek && (
        <button
          onClick={() => onWeekChange(getWeekStart(new Date()))}
          className="text-xs px-2 py-1 bg-white/80 text-gray-500 hover:text-gray-800 rounded-md transition-colors"
        >
          Dnes
        </button>
      )}
    </div>
  )
}
