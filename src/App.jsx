import React from 'react'
import ShowroomScene from './scene/ShowroomScene'
import CarSelector from './ui/CarSelector'
import PartsSidebar from './ui/PartsSidebar'
import ControlPanel from './ui/ControlPanel'
import CustomizerPanel from './ui/CustomizerPanel'
import HUD from './ui/HUD'

export default function App() {
  return (
    <div className="app-layout">
      {/* 3D Canvas (full-screen background) */}
      <ShowroomScene />

      {/* UI Overlay Layer */}
      <div className="ui-overlay">
        {/* Top Bar */}
        <CarSelector />

        {/* Main Content: Sidebar + Spacer + Right Panel */}
        <div className="main-content">
          {/* Left Sidebar: Parts Explorer */}
          <PartsSidebar />

          {/* Center spacer (transparent, allows clicking through to canvas) */}
          <div style={{ flex: 1, pointerEvents: 'none' }} />

          {/* Right Panel: Controls + Customizer */}
          <div className="right-panel">
            <ControlPanel />
            <CustomizerPanel />
          </div>
        </div>
      </div>

      {/* Floating HUD */}
      <HUD />
    </div>
  )
}
