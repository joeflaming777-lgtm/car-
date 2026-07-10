import React from 'react'
import useShowroomStore from '../store/useShowroomStore'

export default function ControlPanel() {
  const openParts = useShowroomStore((s) => s.openParts)
  const togglePart = useShowroomStore((s) => s.togglePart)
  const xrayMode = useShowroomStore((s) => s.xrayMode)
  const toggleXray = useShowroomStore((s) => s.toggleXray)
  const exhaustUpgrade = useShowroomStore((s) => s.exhaustUpgrade)
  const toggleExhaustUpgrade = useShowroomStore((s) => s.toggleExhaustUpgrade)

  const toggleButtons = [
    { key: 'hood', label: 'Hood', icon: '⬆️' },
    { key: 'driverDoor', label: 'Driver Door', icon: '🚪' },
    { key: 'passengerDoor', label: 'Pass. Door', icon: '🚪' },
    { key: 'trunk', label: 'Trunk', icon: '📦' },
  ]

  return (
    <>
      {/* Part Animations */}
      <div className="panel-section">
        <div className="panel-section-title">Part Animations</div>
        <div className="toggle-grid">
          {toggleButtons.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`toggle-btn${openParts[key] ? ' active' : ''}`}
              onClick={() => togglePart(key)}
            >
              <span className="toggle-btn-icon">{icon}</span>
              <span className="toggle-btn-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switches */}
      <div className="panel-section">
        <div className="panel-section-title">View Modes</div>

        <div
          className={`mode-switch${xrayMode ? ' active' : ''}`}
          onClick={toggleXray}
        >
          <div className="mode-switch-info">
            <span className="mode-switch-label">⚡ X-Ray Mode</span>
            <span className="mode-switch-desc">See internal components</span>
          </div>
          <div className={`switch-track${xrayMode ? ' on' : ''}`}>
            <div className="switch-thumb" />
          </div>
        </div>

        <div
          className={`mode-switch${exhaustUpgrade ? ' active' : ''}`}
          onClick={toggleExhaustUpgrade}
        >
          <div className="mode-switch-info">
            <span className="mode-switch-label">🔥 Titanium Exhaust</span>
            <span className="mode-switch-desc">5-barrel performance upgrade</span>
          </div>
          <div className={`switch-track${exhaustUpgrade ? ' on' : ''}`}>
            <div className="switch-thumb" />
          </div>
        </div>
      </div>
    </>
  )
}
