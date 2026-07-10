import React from 'react'

/*
  5-barrel Titanium Performance Exhaust upgrade.
  Dynamically cloned and positioned onto the active car's rear frame.
*/
export default function ExhaustUpgrade() {
  const titaniumColor = '#8b7d6b'
  const tipColor = '#d4c8a8'

  return (
    <group position={[0, 0.22, -2.6]}>
      {/* Central muffler box */}
      <mesh
        name="perf_exhaust_muffler"
        userData={{
          partName: 'perf_exhaust_muffler',
          displayName: 'Titanium Performance Muffler',
          category: 'Exhaust System',
        }}
      >
        <boxGeometry args={[1.2, 0.18, 0.35]} />
        <meshPhysicalMaterial
          color={titaniumColor}
          metalness={0.8}
          roughness={0.2}
          clearcoat={0.3}
        />
      </mesh>

      {/* 5 barrel exhaust tips */}
      {[
        { x: -0.48, label: '1' },
        { x: -0.24, label: '2' },
        { x: 0, label: '3' },
        { x: 0.24, label: '4' },
        { x: 0.48, label: '5' },
      ].map(({ x, label }) => (
        <group key={label} position={[x, 0, -0.25]}>
          {/* Outer ring */}
          <mesh
            name={`perf_exhaust_tip_${label}`}
            rotation={[Math.PI / 2, 0, 0]}
            userData={{
              partName: `perf_exhaust_tip_${label}`,
              displayName: `Titanium Tip #${label}`,
              category: 'Exhaust System',
            }}
          >
            <cylinderGeometry args={[0.055, 0.065, 0.22, 16]} />
            <meshPhysicalMaterial
              color={tipColor}
              metalness={0.9}
              roughness={0.08}
              clearcoat={0.6}
            />
          </mesh>
          {/* Inner bore (dark) */}
          <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.9} />
          </mesh>
          {/* Heat glow ring */}
          <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.055, 0.005, 8, 16]} />
            <meshStandardMaterial
              color="#cc8844"
              emissive="#ff6600"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Connection pipes from muffler */}
      <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}
        name="perf_exhaust_pipe"
        userData={{ partName: 'perf_exhaust_pipe', displayName: 'Titanium Down-pipe', category: 'Exhaust System' }}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshPhysicalMaterial color={titaniumColor} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
