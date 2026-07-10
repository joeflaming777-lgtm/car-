import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { createSmoothBodyGeometry } from '../utils/carGeometry'

/* ═══════════════════════════════════════════════════════════
   BMW M3 SEDAN — Realistic Procedural Model
   Smooth body curves, proper proportions, detailed wheels
   ═══════════════════════════════════════════════════════════ */

/* Reusable tagged mesh component */
function Part({ name, displayName, category, geometry, color, position, rotation, scale, isBody,
  metalness = 0.6, roughness = 0.3, clearcoat = 0.5, clearcoatRoughness = 0.2, transparent, opacity, ...props }) {
  return (
    <mesh name={name} position={position} rotation={rotation} scale={scale}
      userData={{ partName: name, displayName, category, isBody: !!isBody }} {...props}>
      {geometry instanceof THREE.BufferGeometry ? <primitive object={geometry} attach="geometry" /> : geometry}
      <meshPhysicalMaterial color={color || '#2c2c3a'} metalness={metalness} roughness={roughness}
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
  const spokeCount = 10

  return (
    <group position={position}>
      {/* Tire — torus rotated around Y to face the side */}
      <mesh name={`tire_${prefix}`} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `tire_${prefix}`, displayName: `Tire – ${label}`, category: 'Wheel Assembly' }}>
        <torusGeometry args={[0.32, 0.1, 16, 32]} />
        <meshPhysicalMaterial color="#1a1a1e" metalness={0.0} roughness={0.95} clearcoat={0.1} />
      </mesh>

      {/* Rim — outer ring rotated around Y to face the side */}
      <mesh name={`rim_${prefix}`} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `rim_${prefix}`, displayName: `M Forged Rim – ${label}`, category: 'Wheel Assembly' }}>
        <torusGeometry args={[0.26, 0.035, 8, 32]} />
        <meshPhysicalMaterial color="#a0a0b0" metalness={0.95} roughness={0.08} clearcoat={0.8} />
      </mesh>

      {/* Rim spokes — rotated around X to radiate outward in Y-Z plane */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2
        const cx = Math.cos(angle) * 0.15
        const cy = Math.sin(angle) * 0.15
        return (
          <mesh key={`spoke_${i}`} position={[0.01, cy, cx]} rotation={[angle, 0, 0]}
            userData={{ partName: `rim_${prefix}`, displayName: `M Forged Rim – ${label}`, category: 'Wheel Assembly' }}>
            <boxGeometry args={[0.015, 0.2, 0.025]} />
            <meshPhysicalMaterial color="#9a9aaa" metalness={0.95} roughness={0.08} clearcoat={0.8} />
          </mesh>
        )
      })}

      {/* Hub center cap */}
      <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}
        userData={{ partName: `rim_${prefix}`, displayName: `M Forged Rim – ${label}`, category: 'Wheel Assembly' }}>
        <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
        <meshPhysicalMaterial color="#888898" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Brake disc */}
      <Part name={`brake_disc_${prefix}`} displayName={`Drilled Brake Disc – ${label}`} category="Wheel Assembly"
        color="#606068" position={[-0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}
        geometry={<cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />}
        metalness={0.85} roughness={0.25} clearcoat={0.3} />

      {/* Brake caliper */}
      <Part name={`brake_caliper_${prefix}`} displayName={`M Compound Caliper – ${label}`} category="Wheel Assembly"
        color="#cc2222" position={[-0.01, 0.15, 0]}
        geometry={<boxGeometry args={[0.04, 0.1, 0.13]} />}
        metalness={0.5} roughness={0.4} clearcoat={0.6} />
    </group>
  )
}

export default function CarModelM3({ groupRef }) {
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

  /* ─── Smooth body geometry from side profile ─── */
  const bodyLowerGeo = useMemo(() => {
    const profile = [
      [-2.5, 0.10],  // front bottom
      [-2.4, 0.08],  // front lip
      [-2.55, 0.15], // front splitter forward
      [-2.55, 0.38], // front bumper face
      [-2.45, 0.50], // hood start
      [-2.0, 0.56],  // hood mid
      [-1.2, 0.60],  // hood peak
      [-0.7, 0.62],  // base of windshield
      [-0.7, 0.62],  // windshield base
      [0.0, 0.60],   // roof center
      [0.7, 0.58],   // rear roof
      [1.2, 0.54],   // rear window base
      [1.6, 0.50],   // trunk start
      [2.2, 0.48],   // trunk end
      [2.45, 0.42],  // rear bumper top
      [2.55, 0.35],  // rear bumper face
      [2.55, 0.15],  // rear bottom bumper
      [2.4, 0.08],   // rear lip
      [2.5, 0.10],   // rear skirt
      // Underbody
      [2.3, 0.06],
      [1.8, 0.05],
      [0.0, 0.04],
      [-1.8, 0.05],
      [-2.3, 0.06],
    ]
    return createSmoothBodyGeometry(profile, 1.85, 80, 0.04)
  }, [])

  /* ─── Cabin / Greenhouse geometry ─── */
  const cabinGeo = useMemo(() => {
    const profile = [
      [-0.7, 0.0],   // windshield base
      [-0.55, 0.40], // windshield top
      [-0.1, 0.44],  // roof front
      [0.5, 0.44],   // roof mid
      [0.85, 0.40],  // roof rear
      [1.1, 0.25],   // rear window top
      [1.25, 0.0],   // rear window base / C-pillar bottom
    ]
    return createSmoothBodyGeometry(profile, 1.65, 40, 0.03)
  }, [])

  const bodyColor = '#8a8a94' // Nardo Grey inspired
  const darkTrim = '#1a1a22'
  const chromeTrim = '#c8c8d0'

  return (
    <group>
      {/* ═══════════════════════════════════════════════
          LOWER BODY — Smooth Extruded Profile
         ═══════════════════════════════════════════════ */}
      <Part name="body_lower" displayName="Body Shell" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.38, 0]}
        geometry={bodyLowerGeo}
        metalness={0.75} roughness={0.18} clearcoat={0.9} clearcoatRoughness={0.05} />

      {/* ═══════════════════════════════════════════════
          CABIN / GREENHOUSE (Positioned flush with lower body)
         ═══════════════════════════════════════════════ */}
      <Part name="body_cabin" displayName="Cabin Structure" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.89, -0.15]}
        geometry={cabinGeo}
        metalness={0.75} roughness={0.18} clearcoat={0.9} clearcoatRoughness={0.05} />

      {/* Roof panel flush with cabin top */}
      <Part name="roof" displayName="Roof Panel" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 1.11, -0.15]}
        geometry={<boxGeometry args={[1.72, 0.04, 2.0]} />}
        metalness={0.75} roughness={0.18} clearcoat={0.9} clearcoatRoughness={0.05} />

      {/* ═══════════════════════════════════════════════
          FRONT FASCIA — M3 Aggressive Style
         ═══════════════════════════════════════════════ */}
      <Part name="front_bumper" displayName="M3 Front Bumper" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.32, 2.5]}
        geometry={<boxGeometry args={[2.0, 0.40, 0.18]} />}
        metalness={0.7} roughness={0.2} clearcoat={0.8} />

      <Part name="kidney_grille_left" displayName="Kidney Grille – Left" category="Chassis & Body"
        color={darkTrim} position={[-0.3, 0.42, 2.56]}
        geometry={<boxGeometry args={[0.42, 0.42, 0.06]} />}
        metalness={0.15} roughness={0.85} clearcoat={0.3} />

      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`grille_slat_l_${i}`} position={[-0.12 - i * 0.065, 0.42, 2.60]}
          userData={{ partName: 'kidney_grille_left', displayName: 'Kidney Grille – Left', category: 'Chassis & Body' }}>
          <boxGeometry args={[0.012, 0.36, 0.02]} />
          <meshPhysicalMaterial color="#0a0a10" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}

      <Part name="kidney_grille_right" displayName="Kidney Grille – Right" category="Chassis & Body"
        color={darkTrim} position={[0.3, 0.42, 2.56]}
        geometry={<boxGeometry args={[0.42, 0.42, 0.06]} />}
        metalness={0.15} roughness={0.85} clearcoat={0.3} />

      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`grille_slat_r_${i}`} position={[0.12 + i * 0.065, 0.42, 2.60]}
          userData={{ partName: 'kidney_grille_right', displayName: 'Kidney Grille – Right', category: 'Chassis & Body' }}>
          <boxGeometry args={[0.012, 0.36, 0.02]} />
          <meshPhysicalMaterial color="#0a0a10" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}

      <mesh position={[0, 0.42, 2.58]}
        userData={{ partName: 'grille_frame', displayName: 'Grille Chrome Frame', category: 'Chassis & Body' }}>
        <torusGeometry args={[0.22, 0.015, 6, 4]} />
        <meshPhysicalMaterial color={chromeTrim} metalness={0.95} roughness={0.05} />
      </mesh>

      <Part name="front_splitter" displayName="M Performance Splitter" category="Chassis & Body" isBody
        color={darkTrim} position={[0, 0.1, 2.6]}
        geometry={<boxGeometry args={[2.1, 0.04, 0.2]} />}
        metalness={0.3} roughness={0.7} clearcoat={0.4} />

      {[[-0.7, 0.2, 2.56], [0.7, 0.2, 2.56]].map((pos, i) => (
        <Part key={`front_intake_${i}`} name={`front_intake_${i === 0 ? 'left' : 'right'}`}
          displayName={`Air Intake – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={darkTrim} position={pos}
          geometry={<boxGeometry args={[0.35, 0.12, 0.06]} />}
          metalness={0.2} roughness={0.8} />
      ))}

      {/* ═══════════════════════════════════════════════
          REAR — Sedan Style
         ═══════════════════════════════════════════════ */}
      <Part name="rear_bumper" displayName="Rear Bumper" category="Chassis & Body" isBody
        color={bodyColor} position={[0, 0.28, -2.5]}
        geometry={<boxGeometry args={[2.0, 0.35, 0.15]} />}
        metalness={0.7} roughness={0.2} clearcoat={0.8} />

      <Part name="rear_diffuser" displayName="M Performance Diffuser" category="Chassis & Body"
        color={darkTrim} position={[0, 0.1, -2.55]}
        geometry={<boxGeometry args={[1.6, 0.08, 0.15]} />}
        metalness={0.3} roughness={0.7} />

      <Part name="trunk_spoiler" displayName="M Performance Lip Spoiler" category="Chassis & Body"
        color={darkTrim} position={[0, 0.73, -2.08]}
        geometry={<boxGeometry args={[1.5, 0.025, 0.08]} />}
        metalness={0.4} roughness={0.5} clearcoat={0.6} />

      {/* ═══════════════════════════════════════════════
          SIDE DETAILS
         ═══════════════════════════════════════════════ */}
      {[[-1.0, 0.13, 0], [1.0, 0.13, 0]].map((pos, i) => (
        <Part key={`side_skirt_${i}`} name={i === 0 ? 'left_side_skirt' : 'right_side_skirt'}
          displayName={`M Side Skirt – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body" isBody
          color={darkTrim} position={pos}
          geometry={<boxGeometry args={[0.06, 0.08, 3.8]} />}
          metalness={0.3} roughness={0.6} />
      ))}

      {[[-0.98, 0.52, 1.2], [0.98, 0.52, 1.2]].map((pos, i) => (
        <Part key={`fender_vent_${i}`} name={`fender_vent_${i === 0 ? 'left' : 'right'}`}
          displayName={`M Fender Vent – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={darkTrim} position={pos}
          geometry={<boxGeometry args={[0.04, 0.08, 0.25]} />}
          metalness={0.2} roughness={0.8} />
      ))}

      {[[-0.92, 0.95, 0.6], [0.92, 0.95, 0.6]].map((pos, i) => (
        <Part key={`mirror_${i}`} name={`mirror_${i === 0 ? 'left' : 'right'}`}
          displayName={`Side Mirror – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
          color={bodyColor} position={pos}
          geometry={<sphereGeometry args={[0.06, 8, 8]} />}
          metalness={0.7} roughness={0.2} clearcoat={0.8} />
      ))}

      {/* Wheel Arches */}
      {[
        { pos: [-0.88, 0.32, 1.55], ry: 0 },
        { pos: [0.88, 0.32, 1.55], ry: 0 },
        { pos: [-0.88, 0.32, -1.55], ry: 0 },
        { pos: [0.88, 0.32, -1.55], ry: 0 },
      ].map(({ pos, ry }, i) => (
        <mesh key={`arch_${i}`} position={pos} rotation={[0, ry, Math.PI / 2]}
          userData={{ partName: `wheel_arch_${i}`, displayName: `Wheel Arch ${i + 1}`, category: 'Chassis & Body' }}>
          <torusGeometry args={[0.38, 0.04, 6, 16, Math.PI]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.7} roughness={0.2} clearcoat={0.8} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════
          HOOD (HINGED)
         ═══════════════════════════════════════════════ */}
      <group ref={hoodPivotRef} position={[0, 0.7, 0.8]}>
        <Part name="hood" displayName="Carbon Fiber Hood" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, 0.9]}
          geometry={<boxGeometry args={[1.8, 0.045, 1.7]} />}
          metalness={0.75} roughness={0.18} clearcoat={0.9} />

        <mesh position={[0, 0.04, 0.85]}
          userData={{ partName: 'hood', displayName: 'Carbon Fiber Hood', category: 'Chassis & Body', isBody: true }}>
          <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color={bodyColor} metalness={0.75} roughness={0.18}
            clearcoat={0.9} clearcoatRoughness={0.05} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════
          TRUNK (HINGED)
         ═══════════════════════════════════════════════ */}
      <group ref={trunkPivotRef} position={[0, 0.7, -1.55]}>
        <Part name="trunk" displayName="Trunk Lid" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.45]}
          geometry={<boxGeometry args={[1.7, 0.04, 0.85]} />}
          metalness={0.75} roughness={0.18} clearcoat={0.9} />
      </group>

      {/* ═══════════════════════════════════════════════
          DOORS (HINGED)
         ═══════════════════════════════════════════════ */}
      <group ref={driverDoorPivotRef} position={[-0.95, 0.6, 0.6]}>
        <Part name="driver_door" displayName="Driver Door" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.5]}
          geometry={<boxGeometry args={[0.06, 0.62, 1.05]} />}
          metalness={0.75} roughness={0.18} clearcoat={0.9} />
        <GlassPart name="driver_window" displayName="Driver Window" category="Glass"
          position={[0.01, 0.33, -0.5]}
          geometry={<boxGeometry args={[0.025, 0.35, 0.9]} />} />
        <mesh position={[0.04, 0.05, -0.5]}
          userData={{ partName: 'driver_door', displayName: 'Driver Door', category: 'Chassis & Body', isBody: true }}>
          <boxGeometry args={[0.02, 0.025, 0.12]} />
          <meshPhysicalMaterial color={chromeTrim} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <group ref={passengerDoorPivotRef} position={[0.95, 0.6, 0.6]}>
        <Part name="passenger_door" displayName="Passenger Door" category="Chassis & Body" isBody
          color={bodyColor} position={[0, 0, -0.5]}
          geometry={<boxGeometry args={[0.06, 0.62, 1.05]} />}
          metalness={0.75} roughness={0.18} clearcoat={0.9} />
        <GlassPart name="passenger_window" displayName="Passenger Window" category="Glass"
          position={[-0.01, 0.33, -0.5]}
          geometry={<boxGeometry args={[0.025, 0.35, 0.9]} />} />
        <mesh position={[-0.04, 0.05, -0.5]}
          userData={{ partName: 'passenger_door', displayName: 'Passenger Door', category: 'Chassis & Body', isBody: true }}>
          <boxGeometry args={[0.02, 0.025, 0.12]} />
          <meshPhysicalMaterial color={chromeTrim} metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      <Part name="rear_left_door" displayName="Rear Door – Left" category="Chassis & Body" isBody
        color={bodyColor} position={[-0.95, 0.6, -0.55]}
        geometry={<boxGeometry args={[0.06, 0.62, 0.95]} />}
        metalness={0.75} roughness={0.18} clearcoat={0.9} />
      <Part name="rear_right_door" displayName="Rear Door – Right" category="Chassis & Body" isBody
        color={bodyColor} position={[0.95, 0.6, -0.55]}
        geometry={<boxGeometry args={[0.06, 0.62, 0.95]} />}
        metalness={0.75} roughness={0.18} clearcoat={0.9} />

      {/* ═══════════════════════════════════════════════
          GLASS (Adjusted positions to connect cleanly)
         ═══════════════════════════════════════════════ */}
      <GlassPart name="windshield" displayName="Windshield" category="Glass"
        position={[0, 0.9, 0.65]} rotation={[0.45, 0, 0]}
        geometry={<boxGeometry args={[1.6, 0.025, 0.75]} />} />

      <GlassPart name="rear_window" displayName="Rear Window" category="Glass"
        position={[0, 0.9, -0.95]} rotation={[-0.45, 0, 0]}
        geometry={<boxGeometry args={[1.5, 0.025, 0.65]} />} />

      <GlassPart name="left_rear_window" displayName="Rear Side Window – Left" category="Glass"
        position={[-0.87, 0.95, -0.55]}
        geometry={<boxGeometry args={[0.025, 0.35, 0.85]} />} />
      <GlassPart name="right_rear_window" displayName="Rear Side Window – Right" category="Glass"
        position={[0.87, 0.95, -0.55]}
        geometry={<boxGeometry args={[0.025, 0.35, 0.85]} />} />

      {/* ═══════════════════════════════════════════════
          LIGHTS
         ═══════════════════════════════════════════════ */}
      {[[-0.7, 0.5, 2.48], [0.7, 0.5, 2.48]].map((pos, i) => (
        <group key={`headlight_group_${i}`} position={pos}>
          <Part name={i === 0 ? 'headlight_left' : 'headlight_right'}
            displayName={`Laser Headlight – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color="#222230" position={[0, 0, 0]}
            geometry={<boxGeometry args={[0.45, 0.15, 0.08]} />}
            metalness={0.3} roughness={0.2} clearcoat={0.9} />
          <EmissivePart name={i === 0 ? 'drl_left' : 'drl_right'}
            displayName={`DRL Strip – ${i === 0 ? 'Left' : 'Right'}`} category="Chassis & Body"
            color="#ffdd00" emissive="#ffcc00" emissiveIntensity={3}
            position={[0, 0.04, 0.03]}
            geometry={<boxGeometry args={[0.38, 0.02, 0.02]} />} />
          <mesh position={[0, -0.02, 0.03]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      {[[-0.65, 0.52, -2.48], [0.65, 0.52, -2.48]].map((pos, i) => (
        <group key={`taillight_group_${i}`} position={pos}>
          <mesh name={i === 0 ? 'taillight_left' : 'taillight_right'}
            userData={{ partName: i === 0 ? 'taillight_left' : 'taillight_right',
              displayName: `LED Taillight – ${i === 0 ? 'Left' : 'Right'}`, category: 'Chassis & Body' }}>
            <boxGeometry args={[0.42, 0.1, 0.05]} />
            <meshStandardMaterial color="#ff1111" emissive="#ff0000" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[i === 0 ? 0.25 : -0.25, 0, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.04]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {/* ═══════════════════════════════════════════════
          WHEELS
         ═══════════════════════════════════════════════ */}
      <WheelAssembly position={[-0.92, 0.32, 1.55]} label="Front Left" />
      <WheelAssembly position={[0.92, 0.32, 1.55]} label="Front Right" />
      <WheelAssembly position={[-0.92, 0.32, -1.55]} label="Rear Left" />
      <WheelAssembly position={[0.92, 0.32, -1.55]} label="Rear Right" />

      {/* ═══════════════════════════════════════════════
          ENGINE BAY
         ═══════════════════════════════════════════════ */}
      <Part name="engine_block" displayName="S58 Twin-Turbo I6 Block" category="Engine Bay"
        color="#3a3a48" position={[0, 0.50, 1.65]}
        geometry={<boxGeometry args={[1.1, 0.35, 0.95]} />}
        metalness={0.6} roughness={0.45} clearcoat={0.2} />

      <Part name="intake_manifold" displayName="Intake Manifold" category="Engine Bay"
        color="#454558" position={[0, 0.72, 1.65]}
        geometry={<boxGeometry args={[0.75, 0.1, 0.55]} />}
        metalness={0.5} roughness={0.5} />

      <Part name="turbocharger" displayName="Twin Turbocharger" category="Engine Bay"
        color="#505060" position={[0.32, 0.58, 1.25]}
        geometry={<cylinderGeometry args={[0.1, 0.1, 0.18, 16]} />}
        metalness={0.7} roughness={0.3} />

      <Part name="radiator" displayName="Radiator" category="Engine Bay"
        color="#2d2d38" position={[0, 0.42, 2.28]}
        geometry={<boxGeometry args={[1.3, 0.4, 0.06]} />}
        metalness={0.4} roughness={0.6} />

      <Part name="air_filter" displayName="Performance Air Filter" category="Engine Bay"
        color="#3d2d1d" position={[-0.4, 0.68, 1.45]}
        geometry={<cylinderGeometry args={[0.12, 0.15, 0.18, 12]} />}
        metalness={0.3} roughness={0.7} />

      {/* ═══════════════════════════════════════════════
          EXHAUST SYSTEM
         ═══════════════════════════════════════════════ */}
      <Part name="exhaust_muffler" displayName="Exhaust Muffler" category="Exhaust System"
        color="#404050" position={[0, 0.16, -2.0]}
        geometry={<boxGeometry args={[0.7, 0.16, 0.45]} />}
        metalness={0.6} roughness={0.4} />

      {[[-0.45, 0.16, -2.58], [-0.25, 0.16, -2.58], [0.25, 0.16, -2.58], [0.45, 0.16, -2.58]].map((pos, i) => (
        <Part key={`exhaust_tip_${i}`} name={`exhaust_tip_${i}`}
          displayName={`M Exhaust Tip ${i + 1}`} category="Exhaust System"
          color={chromeTrim} position={pos} rotation={[Math.PI / 2, 0, 0]}
          geometry={<cylinderGeometry args={[0.045, 0.055, 0.16, 16]} />}
          metalness={0.95} roughness={0.05} clearcoat={0.9} />
      ))}

      <Part name="exhaust_pipe" displayName="Exhaust Down-pipe" category="Exhaust System"
        color="#404050" position={[0, 0.16, -1.3]} rotation={[Math.PI / 2, 0, 0]}
        geometry={<cylinderGeometry args={[0.035, 0.035, 1.0, 8]} />}
        metalness={0.6} roughness={0.4} />

      <Part name="catalytic_converter" displayName="Catalytic Converter" category="Exhaust System"
        color="#484858" position={[0, 0.2, -0.7]}
        geometry={<boxGeometry args={[0.2, 0.14, 0.35]} />}
        metalness={0.5} roughness={0.5} />

      {/* ═══════════════════════════════════════════════
          INTERIOR
         ═══════════════════════════════════════════════ */}
      <Part name="dashboard" displayName="Dashboard" category="Interior"
        color="#1a1216" position={[0, 0.78, 0.42]}
        geometry={<boxGeometry args={[1.6, 0.22, 0.35]} />}
        metalness={0.15} roughness={0.85} />

      <Part name="steering_wheel" displayName="M Sport Steering Wheel" category="Interior"
        color="#1e1e24" position={[-0.38, 0.88, 0.48]} rotation={[0.35, 0, 0]}
        geometry={<torusGeometry args={[0.15, 0.018, 12, 24]} />}
        metalness={0.3} roughness={0.55} />

      <Part name="driver_seat" displayName="M Sport Seat – Driver" category="Interior"
        color="#1a1216" position={[-0.38, 0.52, -0.1]}
        geometry={<boxGeometry args={[0.45, 0.45, 0.5]} />}
        metalness={0.08} roughness={0.92} />

      <Part name="passenger_seat" displayName="M Sport Seat – Passenger" category="Interior"
        color="#1a1216" position={[0.38, 0.52, -0.1]}
        geometry={<boxGeometry args={[0.45, 0.45, 0.5]} />}
        metalness={0.08} roughness={0.92} />

      <Part name="center_console" displayName="Center Console" category="Interior"
        color="#151218" position={[0, 0.52, 0.08]}
        geometry={<boxGeometry args={[0.3, 0.2, 0.8]} />}
        metalness={0.2} roughness={0.7} />

      <Part name="gear_shifter" displayName="Manual Gear Shifter" category="Interior"
        color={chromeTrim} position={[0, 0.66, 0.02]}
        geometry={<cylinderGeometry args={[0.02, 0.016, 0.1, 8]} />}
        metalness={0.85} roughness={0.15} />

      <EmissivePart name="idrive_screen" displayName="iDrive Display" category="Interior"
        color="#0a0a18" emissive="#1133cc" emissiveIntensity={0.6}
        position={[0, 0.94, 0.48]} rotation={[0.12, 0, 0]}
        geometry={<boxGeometry args={[0.45, 0.22, 0.015]} />} />
    </group>
  )
}
