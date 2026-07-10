import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { createSmoothBodyGeometry } from '../utils/carGeometry'

/* ═══════════════════════════════════════════════════════════
   BMW M4 COUPÉ — Realistic Procedural Model
   Sleek coupe body lines, sloping roof, detailed wheels, 2 doors
   ═══════════════════════════════════════════════════════════ */

/* Reusable tagged mesh component */
function Part({ name, displayName, category, geometry, color, position, rotation, scale, isBody,
  metalness = 0.6, roughness = 0.3, clearcoat = 0.5, clearcoatRoughness = 0.2, transparent, opacity, ...props }) {
  return (
    <mesh name={name} position={position} rotation={rotation} scale={scale}
      userData={{ partName: name, displayName, category, isBody: !!isBody }} {...props}>
      {geometry instanceof THREE.BufferGeometry ? <primitive object={geometry} attach="geometry" /> : geometry}
      <meshPhysicalMaterial color={color || '#1e1e30'} metalness={metalness} roughness={roughness}
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

/* ─── Detailed Wheel Assembly ─── */
function WheelAssembly({ position, label }) {
  const prefix = label.toLowerCase().replace(/\s/g, '_')
  const spokeCount = 8

  return (
    <group position={position}>
      {/* Tire — realistic donut rotated to face side */}
      <mesh name={`tire_${prefix}`} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `tire_${prefix}`, displayName: `Tire – ${label}`, category: 'Wheel Assembly' }}>
        <torusGeometry args={[0.31, 0.095, 16, 32]} />
        <meshPhysicalMaterial color="#18181c" metalness={0.0} roughness={0.95} clearcoat={0.1} />
      </mesh>

      {/* Rim — outer ring rotated to face side */}
      <mesh name={`rim_${prefix}`} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `rim_${prefix}`, displayName: `M Performance Rim – ${label}`, category: 'Wheel Assembly' }}>
        <torusGeometry args={[0.25, 0.035, 8, 32]} />
        <meshPhysicalMaterial color="#8a8a92" metalness={0.95} roughness={0.1} clearcoat={0.7} />
      </mesh>

      {/* Rim spokes — Y-spoke style common on M4, rotated in Y-Z plane */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2
        const cx = Math.cos(angle) * 0.14
        const cy = Math.sin(angle) * 0.14
        return (
          <mesh key={`spoke_${i}`} position={[0.01, cy, cx]} rotation={[angle, 0, 0]}
            userData={{ partName: `rim_${prefix}`, displayName: `M Performance Rim – ${label}`, category: 'Wheel Assembly' }}>
            <boxGeometry args={[0.015, 0.18, 0.02]} />
            <meshPhysicalMaterial color="#808088" metalness={0.95} roughness={0.1} clearcoat={0.7} />
          </mesh>
        )
      })}

      {/* Hub center cap */}
      <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `rim_${prefix}`, displayName: `M Performance Rim – ${label}`, category: 'Wheel Assembly' }}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        <meshPhysicalMaterial color="#555" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Brake disc */}
      <Part name={`brake_disc_${prefix}`} displayName={`Drilled Brake Disc – ${label}`} category="Wheel Assembly"
        color="#585860" position={[-0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}
        geometry={<cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />}
        metalness={0.8} roughness={0.3} />

      {/* Brake caliper */}
      <Part name={`brake_caliper_${prefix}`} displayName={`M Brake Caliper – ${label}`} category="Wheel Assembly"
        color="#cc1111" position={[-0.01, 0.14, 0]}
        geometry={<boxGeometry args={[0.04, 0.09, 0.12]} />}
        metalness={0.6} roughness={0.35} clearcoat={0.7} />
    </group>
  )
}

export default function CarModelM4({ groupRef }) {
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

  /* ─── Sleek Coupe Body profile ─── */
  const bodyLowerGeo = useMemo(() => {
    const profile = [
      [-2.48, 0.08],  // front bottom
      [-2.40, 0.06],  // front lip splitter
      [-2.54, 0.12],  // bumper bottom front
      [-2.54, 0.35],  // front face/grille start
      [-2.42, 0.46],  // hood leading edge
      [-1.90, 0.52],  // hood mid
      [-1.15, 0.56],  // hood peak
      [-0.75, 0.58],  // windshield base
      [0.0, 0.54],    // body panel mid-upper
      [1.15, 0.48],   // body panel rear-upper
      [1.70, 0.45],   // trunk deck leading edge
      [2.22, 0.42],   // spoiler lip edge
      [2.42, 0.36],   // rear bumper top edge
      [2.52, 0.30],   // rear bumper face
      [2.50, 0.12],   // diffuser top edge
      [2.38, 0.06],   // rear bottom edge
      [0.0, 0.03],    // underbody flat center
      [-2.20, 0.05]   // front wheelhouse rear bottom
    ]
    return createSmoothBodyGeometry(profile, 1.90, 80, 0.04)
  }, [])

  /* ─── Curved sloping Coupe Cabin ─── */
  const cabinGeo = useMemo(() => {
    const profile = [
      [-0.75, 0.0],   // windshield base
      [-0.55, 0.38],  // windshield top
      [-0.05, 0.40],  // front roof
      [0.45, 0.38],   // sloping rear roof
      [0.85, 0.32],   // sloping C-pillar
      [1.20, 0.18],   // fastback slope
      [1.45, 0.0],    // rear decklid transition point
    ]
    return createSmoothBodyGeometry(profile, 1.62, 50, 0.04)
  }, [])

  const bodyColor = '#005544' // Isle of Man Green metallic inspired
  const darkTrim = '#101015'
  const chromeTrim = '#c0c0c8'

  return (
    <group>
      {/* ═══════════════════════════════════════════════
          LOWER BODY — Low Stance & Aerodynamic Profile
         ═══════════════════════════════════════════════ */}
      <Part name="body_lower" displayName="Body Shell" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.36, 0]}
        geometry={bodyLowerGeo}
        metalness={0.8} roughness={0.16} clearcoat={1.0} clearcoatRoughness={0.04} />

      {/* ═══════════════════════════════════════════════
          CABIN / GREENHOUSE (Positioned flush with lower body)
         ═══════════════════════════════════════════════ */}
      <Part name="body_cabin" displayName="Cabin Structure" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.82, -0.2]}
        geometry={cabinGeo}
        metalness={0.8} roughness={0.16} clearcoat={1.0} clearcoatRoughness={0.04} />

      {/* Carbon fiber roof panel flush with cabin top */}
      <Part name="roof" displayName="Carbon Fiber Roof Panel" category="Chassis & Body" isBody
        color="#15151b" position={[0, 1.02, -0.22]}
        geometry={<boxGeometry args={[1.68, 0.03, 1.8]} />}
        metalness={0.4} roughness={0.5} clearcoat={0.7} />

      {/* ═══════════════════════════════════════════════
          FRONT FASCIA — M4 Aggressive Grille & Splitter
         ═══════════════════════════════════════════════ */}
      <Part name="front_bumper" displayName="M4 Front Bumper" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.30, 2.45]}
        geometry={<boxGeometry args={[2.02, 0.36, 0.16]} />}
        metalness={0.8} roughness={0.16} clearcoat={0.9} />

      {/* Double kidney grilles */}
      {[[-0.24, 0.36, 2.52], [0.24, 0.36, 2.52]].map((pos, i) => (
        <group key={`kidney_${i}`} position={pos}>
          <Part name={i === 0 ? 'kidney_grille_left' : 'kidney_grille_right'}
            displayName={`BMW Kidney Grille – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color={darkTrim} position={[0, 0, 0]}
            geometry={<boxGeometry args={[0.36, 0.44, 0.05]} />}
            metalness={0.2} roughness={0.8} />
          {/* Slat bars */}
          {[-0.1, 0, 0.1].map((sx, idx) => (
            <mesh key={`slat_${idx}`} position={[sx, 0, 0.03]}
              userData={{ partName: i === 0 ? 'kidney_grille_left' : 'kidney_grille_right', displayName: 'Kidney Grille', category: 'Chassis & Body' }}>
              <boxGeometry args={[0.015, 0.38, 0.015]} />
              <meshStandardMaterial color="#050508" metalness={0.4} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Front splitter */}
      <Part name="front_splitter" displayName="Aggressive Carbon Front Splitter" category="Chassis & Body" isBody
        color={darkTrim} position={[0, 0.08, 2.52]}
        geometry={<boxGeometry args={[2.08, 0.04, 0.22]} />}
        metalness={0.4} roughness={0.6} clearcoat={0.6} />

      {[[-0.72, 0.18, 2.50], [0.72, 0.18, 2.50]].map((pos, i) => (
        <Part key={`intake_${i}`} name={`front_intake_${i === 0 ? 'left' : 'right'}`}
          displayName={`Air Intake – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={darkTrim} position={pos}
          geometry={<boxGeometry args={[0.32, 0.14, 0.05]} />} />
      ))}

      {/* ═══════════════════════════════════════════════
          REAR FASCIA — M4 Aggressive Diffuser & Spoiler
         ═══════════════════════════════════════════════ */}
      <Part name="rear_bumper" displayName="Rear Bumper" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.26, -2.44]}
        geometry={<boxGeometry args={[2.02, 0.32, 0.15]} />}
        metalness={0.8} roughness={0.16} clearcoat={0.9} />

      <Part name="rear_diffuser" displayName="Aerodynamic Carbon Diffuser" category="Chassis & Body"
        color={darkTrim} position={[0, 0.08, -2.5]}
        geometry={<boxGeometry args={[1.7, 0.10, 0.18]} />}
        metalness={0.3} roughness={0.7} clearcoat={0.5} />

      {/* ═══════════════════════════════════════════════
          SIDE DETAILS
         ═══════════════════════════════════════════════ */}
      {[[-1.03, 0.11, 0], [1.03, 0.11, 0]].map((pos, i) => (
        <Part key={`side_skirt_${i}`} name={i === 0 ? 'left_side_skirt' : 'right_side_skirt'}
          displayName={`M Skirt – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body" isBody
          color={darkTrim} position={pos}
          geometry={<boxGeometry args={[0.06, 0.08, 3.6]} />}
          metalness={0.3} roughness={0.6} />
      ))}

      {[[-0.99, 0.48, 1.15], [0.99, 0.48, 1.15]].map((pos, i) => (
        <Part key={`vent_${i}`} name={`fender_vent_${i === 0 ? 'left' : 'right'}`}
          displayName={`M Fender Gills – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={darkTrim} position={pos}
          geometry={<boxGeometry args={[0.04, 0.07, 0.22]} />}
          metalness={0.2} roughness={0.8} />
      ))}

      {[[-0.94, 0.88, 0.52], [0.94, 0.88, 0.52]].map((pos, i) => (
        <Part key={`mirror_${i}`} name={`mirror_${i === 0 ? 'left' : 'right'}`}
          displayName={`Carbon Side Mirror – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color="#15151b" position={pos}
          geometry={<sphereGeometry args={[0.055, 8, 8]} />}
          metalness={0.4} roughness={0.4} clearcoat={0.6} />
      ))}

      {/* Wheel Arches */}
      {[
        { pos: [-0.91, 0.28, 1.48] },
        { pos: [0.91, 0.28, 1.48] },
        { pos: [-0.91, 0.28, -1.48] },
        { pos: [0.91, 0.28, -1.48] },
      ].map(({ pos }, i) => (
        <mesh key={`arch_${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}
          userData={{ partName: `wheel_arch_${i}`, displayName: `Wheel Arch ${i + 1}`, category: 'Chassis & Body' }}>
          <torusGeometry args={[0.36, 0.04, 6, 16, Math.PI]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.8} roughness={0.16} clearcoat={0.9} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════
          HOOD & POWER BULGE (HINGED)
         ═══════════════════════════════════════════════ */}
      <group ref={hoodPivotRef} position={[0, 0.62, 0.78]}>
        <Part name="hood" displayName="Carbon Hood with Powerbulge" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, 0.82]}
          geometry={<boxGeometry args={[1.86, 0.04, 1.62]} />}
          metalness={0.8} roughness={0.16} clearcoat={1.0} />

        {[[-0.22, 0.03, 0.8], [0.22, 0.03, 0.8]].map((pos, i) => (
          <mesh key={`hood_groove_${i}`} position={pos}
            userData={{ partName: 'hood', displayName: 'Carbon Hood with Powerbulge', category: 'Chassis & Body', isBody: true }}>
            <boxGeometry args={[0.15, 0.01, 0.6]} />
            <meshStandardMaterial color={darkTrim} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ═══════════════════════════════════════════════
          TRUNK & DUCKBILL SPOILER (HINGED)
         ═══════════════════════════════════════════════ */}
      <group ref={trunkPivotRef} position={[0, 0.62, -1.48]}>
        <Part name="trunk" displayName="Carbon Trunk Lid" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.45]}
          geometry={<boxGeometry args={[1.72, 0.04, 0.85]} />}
          metalness={0.8} roughness={0.16} clearcoat={1.0} />

        <Part name="trunk_spoiler" displayName="Integrated Duckbill Spoiler" category="Chassis & Body"
          color={darkTrim} position={[0, 0.04, -0.80]}
          geometry={<boxGeometry args={[1.56, 0.03, 0.14]} />}
          metalness={0.4} roughness={0.6} clearcoat={0.6} />
      </group>

      {/* ═══════════════════════════════════════════════
          DOORS — 2-door Coupe
         ═══════════════════════════════════════════════ */}
      <group ref={driverDoorPivotRef} position={[-0.96, 0.52, 0.72]}>
        <Part name="driver_door" displayName="Driver Door (Coupe)" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.66]}
          geometry={<boxGeometry args={[0.06, 0.56, 1.42]} />}
          metalness={0.8} roughness={0.16} clearcoat={1.0} />
        <GlassPart name="driver_window" displayName="Driver Window" category="Glass"
          position={[0.01, 0.30, -0.66]}
          geometry={<boxGeometry args={[0.02, 0.32, 1.25]} />} />
        <mesh position={[0.04, 0.04, -0.6]}
          userData={{ partName: 'driver_door', displayName: 'Driver Door', category: 'Chassis & Body', isBody: true }}>
          <boxGeometry args={[0.02, 0.02, 0.12]} />
          <meshPhysicalMaterial color={chromeTrim} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <group ref={passengerDoorPivotRef} position={[0.96, 0.52, 0.72]}>
        <Part name="passenger_door" displayName="Passenger Door (Coupe)" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.66]}
          geometry={<boxGeometry args={[0.06, 0.56, 1.42]} />}
          metalness={0.8} roughness={0.16} clearcoat={1.0} />
        <GlassPart name="passenger_window" displayName="Passenger Window" category="Glass"
          position={[-0.01, 0.30, -0.66]}
          geometry={<boxGeometry args={[0.02, 0.32, 1.25]} />} />
        <mesh position={[-0.04, 0.04, -0.6]}
          userData={{ partName: 'passenger_door', displayName: 'Passenger Door', category: 'Chassis & Body', isBody: true }}>
          <boxGeometry args={[0.02, 0.02, 0.12]} />
          <meshPhysicalMaterial color={chromeTrim} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════
          GLASS (Adjusted positions to connect cleanly)
         ═══════════════════════════════════════════════ */}
      <GlassPart name="windshield" displayName="Windshield" category="Glass"
        position={[0, 0.85, 0.6]} rotation={[0.42, 0, 0]}
        geometry={<boxGeometry args={[1.56, 0.025, 0.70]} />} />

      <GlassPart name="rear_window" displayName="Rear Window" category="Glass"
        position={[0, 0.85, -0.9]} rotation={[-0.42, 0, 0]}
        geometry={<boxGeometry args={[1.5, 0.025, 0.60]} />} />

      {/* ═══════════════════════════════════════════════
          LIGHTS
         ═══════════════════════════════════════════════ */}
      {[[-0.72, 0.44, 2.42], [0.72, 0.44, 2.42]].map((pos, i) => (
        <group key={`headlight_group_${i}`} position={pos}>
          <Part name={i === 0 ? 'headlight_left' : 'headlight_right'}
            displayName={`Laser Headlight – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color="#202028" position={[0, 0, 0]}
            geometry={<boxGeometry args={[0.42, 0.14, 0.08]} />}
            metalness={0.3} roughness={0.2} clearcoat={0.9} />
          <EmissivePart name={i === 0 ? 'drl_left' : 'drl_right'}
            displayName={`DRL Strip – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color="#ffd700" emissive="#ffaa00" emissiveIntensity={2.5}
            position={[0, 0.03, 0.03]}
            geometry={<boxGeometry args={[0.36, 0.015, 0.02]} />} />
        </group>
      ))}

      {[[-0.68, 0.46, -2.42], [0.68, 0.46, -2.42]].map((pos, i) => (
        <mesh key={`taillight_group_${i}`} position={pos} name={i === 0 ? 'taillight_left' : 'taillight_right'}
          userData={{ partName: i === 0 ? 'taillight_left' : 'taillight_right',
            displayName: `Laser Taillight – ${i === 0 ? 'Left' : 'Right'}`, category: 'Chassis & Body' }}>
          <boxGeometry args={[0.46, 0.08, 0.04]} />
          <meshStandardMaterial color="#ee0000" emissive="#ff0000" emissiveIntensity={2} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════
          WHEELS
         ═══════════════════════════════════════════════ */}
      <WheelAssembly position={[-0.95, 0.28, 1.48]} label="Front Left" />
      <WheelAssembly position={[0.95, 0.28, 1.48]} label="Front Right" />
      <WheelAssembly position={[-0.95, 0.28, -1.48]} label="Rear Left" />
      <WheelAssembly position={[0.95, 0.28, -1.48]} label="Rear Right" />

      {/* ═══════════════════════════════════════════════
          ENGINE BAY
         ═══════════════════════════════════════════════ */}
      <Part name="engine_block" displayName="S58 Turbo I6 Block" category="Engine Bay"
        color="#32323c" position={[0, 0.42, 1.58]}
        geometry={<boxGeometry args={[1.1, 0.32, 0.9]} />}
        metalness={0.65} roughness={0.45} />

      <Part name="intake_manifold" displayName="Carbon Intake Cover" category="Engine Bay"
        color="#2c2c36" position={[0, 0.64, 1.58]}
        geometry={<boxGeometry args={[0.8, 0.08, 0.5]} />}
        metalness={0.4} roughness={0.5} clearcoat={0.6} />

      <Part name="turbocharger" displayName="Twin Turbocharger" category="Engine Bay"
        color="#404050" position={[0.30, 0.50, 1.2]}
        geometry={<cylinderGeometry args={[0.09, 0.09, 0.16, 16]} />}
        metalness={0.7} roughness={0.3} />

      <Part name="radiator" displayName="Radiator Core" category="Engine Bay"
        color="#222" position={[0, 0.36, 2.22]}
        geometry={<boxGeometry args={[1.3, 0.36, 0.06]} />}
        metalness={0.4} roughness={0.6} />

      <Part name="air_filter" displayName="Performance Intake filter" category="Engine Bay"
        color="#4a3a2a" position={[-0.4, 0.60, 1.38]}
        geometry={<cylinderGeometry args={[0.11, 0.14, 0.16, 12]} />}
        metalness={0.3} roughness={0.7} />

      {/* ═══════════════════════════════════════════════
          EXHAUST SYSTEM
         ═══════════════════════════════════════════════ */}
      <Part name="exhaust_muffler" displayName="Sport Muffler" category="Exhaust System"
        color="#3c3c46" position={[0, 0.14, -1.95]}
        geometry={<boxGeometry args={[0.7, 0.15, 0.42]} />}
        metalness={0.6} roughness={0.4} />

      {[[-0.42, 0.14, -2.48], [-0.24, 0.14, -2.48], [0.24, 0.14, -2.48], [0.42, 0.14, -2.48]].map((pos, i) => (
        <Part key={`exhaust_tip_${i}`} name={`exhaust_tip_${i}`}
          displayName={`Chrome Exhaust Tip ${i + 1}`} category="Exhaust System"
          color={chromeTrim} position={pos} rotation={[Math.PI / 2, 0, 0]}
          geometry={<cylinderGeometry args={[0.04, 0.05, 0.15, 16]} />}
          metalness={0.95} roughness={0.05} clearcoat={0.9} />
      ))}

      <Part name="exhaust_pipe" displayName="Exhaust Down-pipe" category="Exhaust System"
        color="#3c3c46" position={[0, 0.14, -1.25]} rotation={[Math.PI / 2, 0, 0]}
        geometry={<cylinderGeometry args={[0.035, 0.035, 0.95, 8]} />}
        metalness={0.6} roughness={0.4} />

      <Part name="catalytic_converter" displayName="Sport Catalytic Converter" category="Exhaust System"
        color="#404050" position={[0, 0.18, -0.65]}
        geometry={<boxGeometry args={[0.2, 0.12, 0.32]} />}
        metalness={0.5} roughness={0.5} />

      {/* ═══════════════════════════════════════════════
          INTERIOR
         ═══════════════════════════════════════════════ */}
      <Part name="dashboard" displayName="Dashboard" category="Interior"
        color="#15151c" position={[0, 0.70, 0.38]}
        geometry={<boxGeometry args={[1.56, 0.20, 0.32]} />}
        metalness={0.2} roughness={0.8} />

      <Part name="steering_wheel" displayName="M Performance Wheel" category="Interior"
        color="#1c1c22" position={[-0.38, 0.80, 0.44]} rotation={[0.35, 0, 0]}
        geometry={<torusGeometry args={[0.14, 0.016, 12, 24]} />}
        metalness={0.3} roughness={0.6} />

      <Part name="driver_seat" displayName="M Carbon Bucket Seat – Driver" category="Interior"
        color="#15151c" position={[-0.38, 0.44, -0.15]}
        geometry={<boxGeometry args={[0.42, 0.42, 0.48]} />}
        metalness={0.1} roughness={0.92} />

      <Part name="passenger_seat" displayName="M Carbon Bucket Seat – Passenger" category="Interior"
        color="#15151c" position={[0.38, 0.44, -0.15]}
        geometry={<boxGeometry args={[0.42, 0.42, 0.48]} />}
        metalness={0.1} roughness={0.92} />

      <Part name="center_console" displayName="Center Console" category="Interior"
        color="#101016" position={[0, 0.44, 0.05]}
        geometry={<boxGeometry args={[0.28, 0.18, 0.75]} />}
        metalness={0.3} roughness={0.7} />

      <Part name="gear_shifter" displayName="DCT Shifter" category="Interior"
        color={chromeTrim} position={[0, 0.58, 0.0]}
        geometry={<cylinderGeometry args={[0.018, 0.014, 0.08, 8]} />}
        metalness={0.85} roughness={0.15} />

      <EmissivePart name="idrive_screen" displayName="Live Curved iDrive Screen" category="Interior"
        color="#080812" emissive="#1a33aa" emissiveIntensity={0.6}
        position={[0, 0.85, 0.42]} rotation={[0.12, 0, 0]}
        geometry={<boxGeometry args={[0.5, 0.20, 0.012]} />} />
    </group>
  )
}
