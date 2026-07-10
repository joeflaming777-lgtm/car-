import React from 'react'
import useShowroomStore from '../store/useShowroomStore'

const CARS = [
  { id: 'm3', label: 'M3 Sedan' },
  { id: 'm4', label: 'M4 Coupé' },
  { id: 'x5', label: 'X5 SUV' },
]

export default function CarSelector() {
  const activeCarId = useShowroomStore((s) => s.activeCarId)
  const setActiveCar = useShowroomStore((s) => s.setActiveCar)
  const carData = useShowroomStore((s) => s.carData)
  const active = carData[activeCarId]

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="topbar-brand-icon">M</div>
        <h1>BMW Showroom</h1>
      </div>

      <nav className="car-selector">
        {CARS.map((car) => (
          <button
            key={car.id}
            className={`car-selector-btn${activeCarId === car.id ? ' active' : ''}`}
            onClick={() => setActiveCar(car.id)}
          >
            {car.label}
          </button>
        ))}
      </nav>

      <div className="topbar-stats">
        <div className="topbar-stat">
          <span className="topbar-stat-label">Power</span>
          <span className="topbar-stat-value">{active.power}</span>
        </div>
        <div className="topbar-stat">
          <span className="topbar-stat-label">Engine</span>
          <span className="topbar-stat-value">{active.engine}</span>
        </div>
      </div>
    </header>
  )
}
