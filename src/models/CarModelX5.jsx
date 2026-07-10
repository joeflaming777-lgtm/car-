import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { createSmoothBodyGeometry } from '../utils/carGeometry'

/* ═══════════════════════════════════════════════════════════
   BMW X5 SUV — Realistic Procedural Model
   Robust SUV lines, high ground clearance, panoramic roof rails
   ═══════════════════════════════════════════════════════════ */

/* Reusable tagged mesh component */
function Part({ name, displayName, category, geometry, color, position, rotation, scale, isBody,
  metalness = 0.6, roughness = 0.3, clearcoat = 0.5, clearcoatRoughness = 0.2, transparent, opacity, ...props }) {
  return (
    <mesh name={name} position={position} rotation={rotation} scale={scale}
      userData={{ partName: name, displayName, category, isBody: !!isBody }} {...props}>
      {geometry instanceof THREE.BufferGeometry ? <primitive object={geometry} attach="geometry" /> : geometry}
      <meshPhysicalMaterial color={color || '#2c2c30'} metalness={metalness} roughness={roughness}
        clearcoat={clearcoat} clearcoatRoughness={clearcoatRoughness}
        transparent={transparent} opacity={opacity} envMapIntensity={1.2} />
    </mesh>
  )
}

function GlassPart({ name, displayName, category, geometry, position, rotation, scale, ...props }) {
  return (
    <mesh name={name} position={position} rotation={rotation} scale={scale}
      userData={{ partName: name, displayName, category, isBody: false }} {...props}>
      {geometry instanceof THREE.BufferGeometry ? <primitive object={geometry} attach="geometry" /> : geometry}
      <meshPhysicalMaterial color="#88bbee" metalness={0.05} roughness={0.02}
        transmission={0.9} transparent opacity={0.3} ior={1.52}
        clearcoat={1.0} clearcoatRoughness={0.05} envMapIntensity={0.8} />
    </mesh>
  )
}

function EmissivePart({ name, displayName, category, geometry, color, emissive, emissiveIntensity,
  position, rotation, scale, ...props }) {
  return (
    <mesh name={name} position={position} rotation={rotation} scale={scale}
      userData={{ partName: name, displayName, category, isBody: false }} {...props}>
      {geometry}
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity || 1.5} />
    </mesh>
  )
}

/* ─── Detailed SUV Wheel Assembly ─── */
function WheelAssembly({ position, label }) {
  const prefix = label.toLowerCase().replace(/\s/g, '_')
  const spokeCount = 5

  return (
    <group position={position}>
      {/* Tire — larger, thicker torus for rugged SUV look, rotated to face side */}
      <mesh name={`tire_${prefix}`} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `tire_${prefix}`, displayName: `Tire – ${label}`, category: 'Wheel Assembly' }}>
        <torusGeometry args={[0.36, 0.12, 16, 32]} />
        <meshPhysicalMaterial color="#16161a" metalness={0.0} roughness={0.97} clearcoat={0.05} />
      </mesh>

      {/* Rim — outer ring rotated to face side */}
      <mesh name={`rim_${prefix}`} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `rim_${prefix}`, displayName: `22" M Alloy Rim – ${label}`, category: 'Wheel Assembly' }}>
        <torusGeometry args={[0.30, 0.035, 8, 32]} />
        <meshPhysicalMaterial color="#b0b0c0" metalness={0.95} roughness={0.08} clearcoat={0.8} />
      </mesh>

      {/* Rim spokes — double spoke M-style, rotated in Y-Z plane */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const baseAngle = (i / spokeCount) * Math.PI * 2
        return [baseAngle - 0.08, baseAngle + 0.08].map((angle, k) => {
          const cx = Math.cos(angle) * 0.16
          const cy = Math.sin(angle) * 0.16
          return (
            <mesh key={`spoke_${i}_${k}`} position={[0.01, cy, cx]} rotation={[angle, 0, 0]}
              userData={{ partName: `rim_${prefix}`, displayName: `22" M Alloy Rim – ${label}`, category: 'Wheel Assembly' }}>
              <boxGeometry args={[0.015, 0.22, 0.018]} />
              <meshPhysicalMaterial color="#9090a0" metalness={0.95} roughness={0.08} clearcoat={0.8} />
            </mesh>
          )
        })
      })}

      {/* Hub center cap */}
      <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `rim_${prefix}`, displayName: `22" M Alloy Rim – ${label}`, category: 'Wheel Assembly' }}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
        <meshPhysicalMaterial color="#444" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Brake disc */}
      <Part name={`brake_disc_${prefix}`} displayName={`Ventilated Brake Disc – ${label}`} category="Wheel Assembly"
        color="#606068" position={[-0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}
        geometry={<cylinderGeometry args={[0.26, 0.26, 0.025, 32]} />}
        metalness={0.8} roughness={0.3} />

      {/* Brake caliper */}
      <Part name={`brake_caliper_${prefix}`} displayName={`M Sport Caliper – ${label}`} category="Wheel Assembly"
        color="#cc1111" position={[-0.01, 0.16, 0]}
        geometry={<boxGeometry args={[0.05, 0.11, 0.15]} />}
        metalness={0.6} roughness={0.3} clearcoat={0.8} />
    </group>
  )
}

export default function CarModelX5({ groupRef }) {
  const hoodPivotRef = useRef()
  const driverDoorPivotRef = useRef()
  const passengerDoorPivotRef = useRef()
  const trunkPivotRef = useRef()

  React.useImperativeHandle(groupRef, () => ({
    hoodPivot: hoodPivotRef.current,
    driverDoorPivot: driverDoorPivotRef.current,
    passengerDoorPivot: passengerDoorPivotRef.current,
    trunkPivot: trunkPivotRef.current,
  }))

  /* ─── Robust SUV Body profile ─── */
  const bodyLowerGeo = useMemo(() => {
    const profile = [
      [-2.52, 0.18],  // front bottom
      [-2.42, 0.15],  // skid plate start
      [-2.58, 0.22],  // front bumper lower
      [-2.58, 0.60],  // front bumper upper
      [-2.44, 0.72],  // hood start leading edge
      [-1.90, 0.80],  // hood curve
      [-1.00, 0.82],  // base of windshield
      [0.0, 0.78],    // shoulder line mid
      [1.20, 0.74],   // shoulder line rear
      [2.35, 0.70],   // rear glass base
      [2.52, 0.66],   // rear spoiler lip
      [2.56, 0.54],   // tailgate top edge
      [2.56, 0.22],   // rear bumper lower edge
      [2.42, 0.15],   // rear diffuser plate
      [0.0, 0.12],    // bottom center clearance
      [-2.20, 0.14]   // front clearance
    ]
    return createSmoothBodyGeometry(profile, 2.06, 80, 0.05)
  }, [])

  /* ─── Taller, squarer SUV Cabin ─── */
  const cabinGeo = useMemo(() => {
    const profile = [
      [-1.00, 0.0],   // windshield base
      [-0.72, 0.56],  // windshield top
      [0.0, 0.60],    // front roof
      [1.00, 0.58],   // flat long roof panel
      [1.80, 0.54],   // D-pillar top corner
      [2.15, 0.46],   // steep rear glass
      [2.28, 0.0],    // tailgate integration point
    ]
    return createSmoothBodyGeometry(profile, 1.82, 50, 0.04)
  }, [])

  const bodyColor = '#4a5056' // Sophisto Grey metallic inspired
  const darkTrim = '#141418'
  const chromeTrim = '#d8d8e0'

  return (
    <group>
      {/* ═══════════════════════════════════════════════
          LOWER BODY — High Stance SUV Silhouette
         ═══════════════════════════════════════════════ */}
      <Part name="body_lower" displayName="Body Shell" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.42, 0]}
        geometry={bodyLowerGeo}
        metalness={0.78} roughness={0.18} clearcoat={0.9} clearcoatRoughness={0.06} />

      {/* ═══════════════════════════════════════════════
          CABIN / GREENHOUSE (Positioned flush with lower body)
         ═══════════════════════════════════════════════ */}
      <Part name="body_cabin" displayName="Cabin Structure" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 1.07, -0.15]}
        geometry={cabinGeo}
        metalness={0.78} roughness={0.18} clearcoat={0.9} clearcoatRoughness={0.06} />

      {/* Panoramic sunroof flush with cabin top (Y = 1.07 + 0.30 = 1.37) */}
      <GlassPart name="roof" displayName="Panoramic Sunroof" category="Glass"
        position={[0, 1.37, -0.1]}
        geometry={<boxGeometry args={[1.68, 0.03, 2.0]} />} />

      {/* Roof rails sitting flush on roof edges */}
      {[-0.92, 0.92].map((x, i) => (
        <Part key={`rail_${i}`} name={i === 0 ? 'roof_rail_left' : 'roof_rail_right'}
          displayName={`Roof Rail – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={chromeTrim} position={[x, 1.39, -0.1]}
          geometry={<boxGeometry args={[0.04, 0.04, 2.2]} />}
          metalness={0.9} roughness={0.1} />
      ))}

      {/* ═══════════════════════════════════════════════
          FRONT FASCIA — Prominent Kidneys & Rugged Skids
         ═══════════════════════════════════════════════ */}
      <Part name="front_bumper" displayName="X5 M Front Bumper" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.38, 2.5]}
        geometry={<boxGeometry args={[2.14, 0.46, 0.18]} />}
        metalness={0.78} roughness={0.18} clearcoat={0.9} />

      {/* Taller kidney grilles */}
      {[[-0.26, 0.54, 2.56], [0.26, 0.54, 2.56]].map((pos, i) => (
        <group key={`kidney_${i}`} position={pos}>
          <Part name={i === 0 ? 'kidney_grille_left' : 'kidney_grille_right'}
            displayName={`BMW Kidney Grille – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color={darkTrim} position={[0, 0, 0]}
            geometry={<boxGeometry args={[0.38, 0.40, 0.05]} />}
            metalness={0.15} roughness={0.8} />
          {/* Vertical slats */}
          {[-0.12, -0.04, 0.04, 0.12].map((sx, idx) => (
            <mesh key={`slat_${idx}`} position={[sx, 0, 0.03]}
              userData={{ partName: i === 0 ? 'kidney_grille_left' : 'kidney_grille_right', displayName: 'Kidney Grille', category: 'Chassis & Body' }}>
              <boxGeometry args={[0.016, 0.34, 0.015]} />
              <meshStandardMaterial color="#0b0b0f" metalness={0.3} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* SUV skid plate */}
      <Part name="front_splitter" displayName="Satin Chrome Skid Plate" category="Chassis & Body" isBody
        color={chromeTrim} position={[0, 0.12, 2.56]}
        geometry={<boxGeometry args={[1.5, 0.06, 0.22]} />}
        metalness={0.9} roughness={0.15} />

      {/* ═══════════════════════════════════════════════
          REAR FASCIA — SUV Tailgate & Rugged Diffuser
         ═══════════════════════════════════════════════ */}
      <Part name="rear_bumper" displayName="Rear Bumper" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.34, -2.5]}
        geometry={<boxGeometry args={[2.14, 0.38, 0.16]} />}
        metalness={0.78} roughness={0.18} clearcoat={0.9} />

      {/* Rear skid plate */}
      <Part name="rear_diffuser" displayName="Satin Chrome Rear Skid Plate" category="Chassis & Body"
        color={chromeTrim} position={[0, 0.12, -2.56]}
        geometry={<boxGeometry args={[1.5, 0.06, 0.22]} />}
        metalness={0.9} roughness={0.15} />

      {/* ═══════════════════════════════════════════════
          SIDE & WHEEL ARCH DETAILS
         ═══════════════════════════════════════════════ */}
      {[[-1.10, 0.18, 0], [1.10, 0.18, 0]].map((pos, i) => (
        <Part key={`step_${i}`} name={i === 0 ? 'left_side_skirt' : 'right_side_skirt'}
          displayName={`Satin Side Step – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body" isBody
          color={chromeTrim} position={pos}
          geometry={<boxGeometry args={[0.1, 0.04, 3.8]} />}
          metalness={0.95} roughness={0.1} />
      ))}

      {[[-1.07, 0.54, 1.25], [1.07, 0.54, 1.25]].map((pos, i) => (
        <Part key={`vent_${i}`} name={`fender_vent_${i === 0 ? 'left' : 'right'}`}
          displayName={`Air Breather – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={darkTrim} position={pos}
          geometry={<boxGeometry args={[0.03, 0.15, 0.12]} />} />
      ))}

      {[[-1.02, 1.08, 0.65], [1.02, 1.08, 0.65]].map((pos, i) => (
        <Part key={`mirror_${i}`} name={`mirror_${i === 0 ? 'left' : 'right'}`}
          displayName={`Side Mirror – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={bodyColor} position={pos}
          geometry={<sphereGeometry args={[0.07, 8, 8]} />}
          metalness={0.78} roughness={0.18} clearcoat={0.9} />
      ))}

      {/* Wheel Arches */}
      {[
        { pos: [-0.99, 0.38, 1.62] },
        { pos: [0.99, 0.38, 1.62] },
        { pos: [-0.99, 0.38, -1.62] },
        { pos: [0.99, 0.38, -1.62] },
      ].map(({ pos }, i) => (
        <mesh key={`arch_${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}
          userData={{ partName: `wheel_arch_${i}`, displayName: `Wheel Arch ${i + 1}`, category: 'Chassis & Body' }}>
          <torusGeometry args={[0.42, 0.05, 6, 16, Math.PI]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.78} roughness={0.18} clearcoat={0.9} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════
          HOOD (HINGED)
         ═══════════════════════════════════════════════ */}
      <group ref={hoodPivotRef} position={[0, 0.90, 0.90]}>
        <Part name="hood" displayName="Sculpted Hood" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, 0.95]}
          geometry={<boxGeometry args={[1.98, 0.05, 1.72]} />}
          metalness={0.78} roughness={0.18} clearcoat={0.9} />
      </group>

      {/* ═══════════════════════════════════════════════
          TRUNK / SPLIT TAILGATE (HINGED)
         ═══════════════════════════════════════════════ */}
      <group ref={trunkPivotRef} position={[0, 1.05, -1.62]}>
        <Part name="trunk" displayName="Upper Split Tailgate" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.45]}
          geometry={<boxGeometry args={[1.86, 0.65, 0.05]} />}
          metalness={0.78} roughness={0.18} clearcoat={0.9} />
      </group>

      {/* ═══════════════════════════════════════════════
          DOORS — Taller 4-door styling
         ═══════════════════════════════════════════════ */}
      <group ref={driverDoorPivotRef} position={[-1.04, 0.72, 0.72]}>
        <Part name="driver_door" displayName="Driver Door" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.55]}
          geometry={<boxGeometry args={[0.06, 0.72, 1.15]} />}
          metalness={0.78} roughness={0.18} clearcoat={0.9} />
        <GlassPart name="driver_window" displayName="Driver Window" category="Glass"
          position={[0.01, 0.38, -0.55]}
          geometry={<boxGeometry args={[0.02, 0.38, 1.0]} />} />
        <mesh position={[0.04, 0.06, -0.5]}
          userData={{ partName: 'driver_door', displayName: 'Driver Door', category: 'Chassis & Body', isBody: true }}>
          <boxGeometry args={[0.02, 0.02, 0.12]} />
          <meshPhysicalMaterial color={chromeTrim} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <group ref={passengerDoorPivotRef} position={[1.04, 0.72, 0.72]}>
        <Part name="passenger_door" displayName="Passenger Door" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.55]}
          geometry={<boxGeometry args={[0.06, 0.72, 1.15]} />}
          metalness={0.78} roughness={0.18} clearcoat={0.9} />
        <GlassPart name="passenger_window" displayName="Passenger Window" category="Glass"
          position={[-0.01, 0.38, -0.55]}
          geometry={<boxGeometry args={[0.02, 0.38, 1.0]} />} />
        <mesh position={[-0.04, 0.06, -0.5]}
          userData={{ partName: 'passenger_door', displayName: 'Passenger Door', category: 'Chassis & Body', isBody: true }}>
          <boxGeometry args={[0.02, 0.02, 0.12]} />
          <meshPhysicalMaterial color={chromeTrim} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <Part name="rear_left_door" displayName="Rear Door – Left" category="Chassis & Body" isBody
        color={bodyColor} position={[-1.04, 0.72, -0.6]}
        geometry={<boxGeometry args={[0.06, 0.72, 1.05]} />}
        metalness={0.78} roughness={0.18} clearcoat={0.9} />
      <Part name="rear_right_door" displayName="Rear Door – Right" category="Chassis & Body" isBody
        color={bodyColor} position={[1.04, 0.72, -0.6]}
        geometry={<boxGeometry args={[0.06, 0.72, 1.05]} />}
        metalness={0.78} roughness={0.18} clearcoat={0.9} />

      {/* ═══════════════════════════════════════════════
          GLASS (Adjusted positions to connect cleanly)
         ═══════════════════════════════════════════════ */}
      <GlassPart name="windshield" displayName="Windshield" category="Glass"
        position={[0, 1.1, 0.75]} rotation={[0.34, 0, 0]}
        geometry={<boxGeometry args={[1.72, 0.025, 0.85]} />} />

      <GlassPart name="rear_window" displayName="Rear Window" category="Glass"
        position={[0, 1.1, -1.05]} rotation={[-0.24, 0, 0]}
        geometry={<boxGeometry args={[1.68, 0.025, 0.65]} />} />

      <GlassPart name="left_rear_window" displayName="Rear Quarter Window – Left" category="Glass"
        position={[-0.94, 1.25, -0.6]}
        geometry={<boxGeometry args={[0.02, 0.40, 0.95]} />} />
      <GlassPart name="right_rear_window" displayName="Rear Quarter Window – Right" category="Glass"
        position={[0.94, 1.25, -0.6]}
        geometry={<boxGeometry args={[0.02, 0.40, 0.95]} />} />

      {/* ═══════════════════════════════════════════════
          LIGHTS
         ═══════════════════════════════════════════════ */}
      {[[-0.78, 0.62, 2.48], [0.78, 0.62, 2.48]].map((pos, i) => (
        <group key={`headlight_group_${i}`} position={pos}>
          <Part name={i === 0 ? 'headlight_left' : 'headlight_right'}
            displayName={`LED Headlight – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color="#24242e" position={[0, 0, 0]}
            geometry={<boxGeometry args={[0.42, 0.16, 0.08]} />}
            metalness={0.3} roughness={0.2} clearcoat={0.9} />
          <EmissivePart name={i === 0 ? 'drl_left' : 'drl_right'}
            displayName={`DRL – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5}
            position={[0, 0.04, 0.03]}
            geometry={<boxGeometry args={[0.34, 0.02, 0.02]} />} />
        </group>
      ))}

      {[[-0.75, 0.62, -2.48], [0.75, 0.62, -2.48]].map((pos, i) => (
        <mesh key={`taillight_group_${i}`} position={pos} name={i === 0 ? 'taillight_left' : 'taillight_right'}
          userData={{ partName: i === 0 ? 'taillight_left' : 'taillight_right',
            displayName: `Taillight – ${i === 0 ? 'Left' : 'Right'}`, category: 'Chassis & Body' }}>
          <boxGeometry args={[0.48, 0.12, 0.04]} />
          <meshStandardMaterial color="#dd0000" emissive="#ff0000" emissiveIntensity={1.8} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════
          WHEELS
         ═══════════════════════════════════════════════ */}
      <WheelAssembly position={[-1.02, 0.38, 1.62]} label="Front Left" />
      <WheelAssembly position={[1.02, 0.38, 1.62]} label="Front Right" />
      <WheelAssembly position={[-1.02, 0.38, -1.62]} label="Rear Left" />
      <WheelAssembly position={[1.02, 0.38, -1.62]} label="Rear Right" />

      {/* ═══════════════════════════════════════════════
          ENGINE BAY
         ═══════════════════════════════════════════════ */}
      <Part name="engine_block" displayName="TwinPower V8 Engine Block" category="Engine Bay"
        color="#383842" position={[0, 0.62, 1.7]}
        geometry={<boxGeometry args={[1.2, 0.40, 1.05]} />}
        metalness={0.65} roughness={0.45} />

      <Part name="intake_manifold" displayName="M V8 Intake Manifold" category="Engine Bay"
        color="#30303c" position={[0, 0.86, 1.7]}
        geometry={<boxGeometry args={[0.85, 0.1, 0.65]} />}
        metalness={0.4} roughness={0.5} clearcoat={0.5} />

      <Part name="turbocharger" displayName="Twin Hot-V Turbochargers" category="Engine Bay"
        color="#484858" position={[0.34, 0.70, 1.3]}
        geometry={<cylinderGeometry args={[0.11, 0.11, 0.20, 16]} />}
        metalness={0.7} roughness={0.3} />

      <Part name="radiator" displayName="Heavy Duty Radiator" category="Engine Bay"
        color="#222" position={[0, 0.52, 2.35]}
        geometry={<boxGeometry args={[1.4, 0.44, 0.06]} />}
        metalness={0.4} roughness={0.6} />

      <Part name="air_filter" displayName="High Flow Intake Boxes" category="Engine Bay"
        color="#4a3a2a" position={[-0.45, 0.80, 1.5]}
        geometry={<boxGeometry args={[0.3, 0.18, 0.3]} />} />

      {/* ═══════════════════════════════════════════════
          EXHAUST SYSTEM
         ═══════════════════════════════════════════════ */}
      <Part name="exhaust_muffler" displayName="V8 Exhaust Muffler" category="Exhaust System"
        color="#3c3c46" position={[0, 0.22, -2.05]}
        geometry={<boxGeometry args={[0.8, 0.18, 0.45]} />}
        metalness={0.6} roughness={0.4} />

      {[[-0.48, 0.22, -2.58], [0.48, 0.22, -2.58]].map((pos, i) => (
        <Part key={`exhaust_tip_${i}`} name={`exhaust_tip_${i === 0 ? 'left' : 'right'}`}
          displayName={`M Chrome Tailpipe – ${i === 0 ? 'Left' : 'Right'}`} category="Exhaust System"
          color={chromeTrim} position={pos} rotation={[Math.PI / 2, 0, 0]}
          geometry={<cylinderGeometry args={[0.06, 0.075, 0.16, 16]} />}
          metalness={0.95} roughness={0.05} clearcoat={0.9} />
      ))}

      <Part name="exhaust_pipe" displayName="Exhaust Down-pipe" category="Exhaust System"
        color="#3c3c46" position={[0, 0.22, -1.35]} rotation={[Math.PI / 2, 0, 0]}
        geometry={<cylinderGeometry args={[0.045, 0.045, 1.05, 8]} />}
        metalness={0.6} roughness={0.4} />

      <Part name="catalytic_converter" displayName="Heavy Catalytic Converter" category="Exhaust System"
        color="#444454" position={[0, 0.26, -0.7]}
        geometry={<boxGeometry args={[0.22, 0.15, 0.38]} />}
        metalness={0.5} roughness={0.5} />

      {/* ═══════════════════════════════════════════════
          INTERIOR
         ═══════════════════════════════════════════════ */}
      <Part name="dashboard" displayName="Dashboard Assembly" category="Interior"
        color="#221816" position={[0, 0.88, 0.52]}
        geometry={<boxGeometry args={[1.72, 0.24, 0.36]} />}
        metalness={0.15} roughness={0.8} />

      <Part name="steering_wheel" displayName="Sports Leather Steering Wheel" category="Interior"
        color="#1f1f26" position={[-0.42, 0.98, 0.58]} rotation={[0.35, 0, 0]}
        geometry={<torusGeometry args={[0.16, 0.02, 12, 24]} />}
        metalness={0.3} roughness={0.65} />

      <Part name="driver_seat" displayName="Comfort Leather Seat – Driver" category="Interior"
        color="#221816" position={[-0.42, 0.64, 0.0]}
        geometry={<boxGeometry args={[0.48, 0.50, 0.52]} />}
        metalness={0.1} roughness={0.9} />

      <Part name="passenger_seat" displayName="Comfort Leather Seat – Passenger" category="Interior"
        color="#221816" position={[0.42, 0.64, 0.0]}
        geometry={<boxGeometry args={[0.48, 0.50, 0.52]} />}
        metalness={0.1} roughness={0.9} />

      <Part name="center_console" displayName="Center Console Console" category="Interior"
        color="#1b1615" position={[0, 0.62, 0.22]}
        geometry={<boxGeometry args={[0.32, 0.22, 0.85]} />}
        metalness={0.25} roughness={0.75} />

      <Part name="gear_shifter" displayName="Crystal Shifter Knob" category="Interior"
        color="#b0c4de" position={[0, 0.78, 0.16]}
        geometry={<cylinderGeometry args={[0.025, 0.018, 0.08, 8]} />}
        metalness={0.9} roughness={0.05} clearcoat={1.0} />

      <EmissivePart name="idrive_screen" displayName="Panoramic Curved Glass Screen" category="Interior"
        color="#080812" emissive="#1a33aa" emissiveIntensity={0.6}
        position={[0, 1.05, 0.55]} rotation={[0.12, 0, 0]}
        geometry={<boxGeometry args={[0.55, 0.24, 0.012]} />} />
    </group>
  )
}
