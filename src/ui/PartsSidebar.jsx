import React, { useState, useEffect, useCallback } from 'react'
import useShowroomStore from '../store/useShowroomStore'

const CATEGORY_ORDER = ['Chassis & Body', 'Glass', 'Engine Bay', 'Wheel Assembly', 'Exhaust System', 'Interior']

const CATEGORY_ICONS = {
  'Chassis & Body': '🏗️',
  'Glass': '🪟',
  'Engine Bay': '⚙️',
  'Wheel Assembly': '🛞',
  'Exhaust System': '💨',
  'Interior': '💺',
}

export default function PartsSidebar() {
  const activeCarId = useShowroomStore((s) => s.activeCarId)
  const selectedPart = useShowroomStore((s) => s.selectedPart)
  const selectPart = useShowroomStore((s) => s.selectPart)

  const [parts, setParts] = useState([])
  const [openGroups, setOpenGroups] = useState(new Set(['Chassis & Body']))

  // Listen for parts registry updates
  useEffect(() => {
    const handler = () => {
      if (window.__showroomParts) {
        setParts([...window.__showroomParts])
      }
    }
    window.addEventListener('showroom-parts-ready', handler)
    // Also check immediately
    handler()
    // Re-trigger when car changes
    const timer = setTimeout(handler, 300)
    return () => {
      window.removeEventListener('showroom-parts-ready', handler)
      clearTimeout(timer)
    }
  }, [activeCarId])

  // Group parts by category
  const grouped = {}
  CATEGORY_ORDER.forEach((cat) => (grouped[cat] = []))
  parts.forEach((part) => {
    const cat = part.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(part)
  })

  const toggleGroup = (cat) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handlePartClick = (part) => {
    selectPart({
      name: part.name,
      displayName: part.displayName,
      category: part.category,
    })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Component Explorer</div>
        <div className="sidebar-subtitle">
          {parts.length} parts · {CATEGORY_ORDER.filter((c) => grouped[c]?.length > 0).length} groups
        </div>
      </div>

      <div className="sidebar-scroll">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat]
          if (!items || items.length === 0) return null
          const isOpen = openGroups.has(cat)

          return (
            <div key={cat} className="part-group">
              <div className="part-group-header" onClick={() => toggleGroup(cat)}>
                <span className="part-group-name">
                  {CATEGORY_ICONS[cat] || '📦'} {cat}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="part-group-count">{items.length}</span>
                  <span className={`part-group-chevron${isOpen ? ' open' : ''}`}>›</span>
                </div>
              </div>

              {isOpen && (
                <div className="part-list">
                  {items.map((part) => (
                    <div
                      key={part.name}
                      className={`part-item${selectedPart?.name === part.name ? ' selected' : ''}`}
                      onClick={() => handlePartClick(part)}
                    >
                      <span className="part-item-dot" />
                      {part.displayName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
