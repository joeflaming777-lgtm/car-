import React, { useState, useEffect } from 'react'
import useShowroomStore from '../store/useShowroomStore'

const COLOR_SWATCHES = [
  '#1a1a2e', '#0d1b2a', '#1b263b', '#2c003e',
  '#e63946', '#f4a261', '#e9c46a', '#2a9d8f',
  '#264653', '#023e8a', '#0077b6', '#00b4d8',
  '#4a4e69', '#9a8c98', '#f2e9e4', '#22223b',
  '#003049', '#606c38', '#283618', '#bc6c25',
  '#780000', '#660066', '#003300', '#ffffff',
]

const MATERIAL_PRESETS = [
  {
    id: 'metallic',
    name: 'Metallic Paint',
    desc: 'High metalness, glossy finish',
    color: 'linear-gradient(135deg, #4a5568, #718096, #e2e8f0)',
  },
  {
    id: 'matte',
    name: 'Matte Wrap',
    desc: 'Flat, non-reflective surface',
    color: 'linear-gradient(135deg, #2d3748, #4a5568)',
  },
  {
    id: 'carbon',
    name: 'Carbon Fiber',
    desc: 'Woven carbon pattern look',
    color: 'linear-gradient(135deg, #1a1a2e, #2d2d44, #1a1a2e)',
  },
  {
    id: 'chrome',
    name: 'Chrome',
    desc: 'Mirror-like reflective finish',
    color: 'linear-gradient(135deg, #c0c0c0, #ffffff, #a0a0a0)',
  },
]

export default function CustomizerPanel() {
  const activeCarId = useShowroomStore((s) => s.activeCarId)
  const selectedPart = useShowroomStore((s) => s.selectedPart)
  const setPartColor = useShowroomStore((s) => s.setPartColor)
  const setPartMaterial = useShowroomStore((s) => s.setPartMaterial)
  const getPartColor = useShowroomStore((s) => s.getPartColor)
  const getPartMaterial = useShowroomStore((s) => s.getPartMaterial)

  const [hexInput, setHexInput] = useState('#1a1a2e')
  const [activeMaterial, setActiveMaterial] = useState('metallic')

  // Sync state when part changes
  useEffect(() => {
    if (selectedPart) {
      const currentColor = getPartColor(activeCarId, selectedPart.name)
      const currentMaterial = getPartMaterial(activeCarId, selectedPart.name)
      if (currentColor) setHexInput(currentColor)
      if (currentMaterial) setActiveMaterial(currentMaterial)
    }
  }, [selectedPart, activeCarId])

  if (!selectedPart) {
    return (
      <div className="customizer-scroll">
        <div className="customizer-empty">
          <div className="customizer-empty-icon">🎯</div>
          <div className="customizer-empty-text">
            Click on any part in the<br />3D viewport or sidebar<br />to customize it
          </div>
        </div>
      </div>
    )
  }

  const handleColorChange = (color) => {
    setHexInput(color)
    setPartColor(activeCarId, selectedPart.name, color)
  }

  const handleHexSubmit = (e) => {
    e.preventDefault()
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput)) {
      setPartColor(activeCarId, selectedPart.name, hexInput)
    }
  }

  const handleMaterialChange = (materialId) => {
    setActiveMaterial(materialId)
    setPartMaterial(activeCarId, selectedPart.name, materialId)
  }

  return (
    <>
      {/* Selected Part Header */}
      <div className="selected-part-header">
        <div className="selected-part-icon">🔧</div>
        <div className="selected-part-info">
          <div className="selected-part-name">{selectedPart.displayName}</div>
          <div className="selected-part-category">{selectedPart.category}</div>
        </div>
      </div>

      <div className="customizer-scroll">
        {/* Color Picker */}
        <div className="color-picker-section">
          <div className="panel-section-title">Paint Color</div>

          <div className="color-swatches">
            {COLOR_SWATCHES.map((color) => (
              <div
                key={color}
                className={`color-swatch${hexInput === color ? ' active' : ''}`}
                style={{ background: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>

          <form className="color-input-row" onSubmit={handleHexSubmit}>
            <input
              type="text"
              className="color-hex-input"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              placeholder="#1a1a2e"
              maxLength={7}
            />
            <input
              type="color"
              className="native-color-picker"
              value={hexInput}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </form>
        </div>

        {/* Material Presets */}
        <div className="panel-section" style={{ borderBottom: 'none' }}>
          <div className="panel-section-title">Material Finish</div>

          <div className="material-presets">
            {MATERIAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`material-preset-btn${activeMaterial === preset.id ? ' active' : ''}`}
                onClick={() => handleMaterialChange(preset.id)}
              >
                <div
                  className="material-preview"
                  style={{ background: preset.color }}
                />
                <div className="material-info">
                  <div className="material-name">{preset.name}</div>
                  <div className="material-desc">{preset.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
