import React from 'react'
import useShowroomStore from '../store/useShowroomStore'

export default function HUD() {
  const selectedPart = useShowroomStore((s) => s.selectedPart)

  if (!selectedPart) {
    return (
      <div className="hud">
        <div className="hud-dot" style={{ background: '#555', boxShadow: 'none', animation: 'none' }} />
        <span className="hud-instruction">Click on any car part to inspect and customize</span>
      </div>
    )
  }

  return (
    <div className="hud" key={selectedPart.name}>
      <div className="hud-dot" />
      <span className="hud-part-name">{selectedPart.displayName}</span>
      <div className="hud-divider" />
      <span className="hud-category">{selectedPart.category}</span>
    </div>
  )
}
