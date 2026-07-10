import React, { useRef, useCallback, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import useShowroomStore from '../store/useShowroomStore'
import CarModelM3 from '../models/CarModelM3'
import CarModelM4 from '../models/CarModelM4'
import CarModelX5 from '../models/CarModelX5'
import ExhaustUpgrade from '../models/ExhaustUpgrade'

const MATERIAL_PRESETS = {
  metallic: { metalness: 0.9, roughness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.1 },
  matte: { metalness: 0.1, roughness: 0.85, clearcoat: 0.0, clearcoatRoughness: 0.5 },
  carbon: { metalness: 0.3, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.15 },
  chrome: { metalness: 1.0, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.02 },
}

// Categories for sidebar grouping order
const CATEGORIES = ['Chassis & Body', 'Glass', 'Engine Bay', 'Wheel Assembly', 'Exhaust System', 'Interior']
const BODY_CATEGORIES = ['Chassis & Body']

export default function CarController() {
  const {
    activeCarId, selectedPart, selectPart, clearSelection,
    partColors, partMaterials, getPartColor, getPartMaterial,
    openParts, xrayMode, exhaustUpgrade,
    setCameraAnimating,
  } = useShowroomStore()

  const carGroupRef = useRef()
  const pivotsRef = useRef()
  const sceneRef = useRef()
  const { camera, gl } = useThree()
  const highlightedRef = useRef(null)
  const originalMaterialsRef = useRef(new Map())
  const animationsRef = useRef({})

  // ─── Render the active car model ───
  const CarModel = useMemo(() => {
    switch (activeCarId) {
      case 'm4': return CarModelM4
      case 'x5': return CarModelX5
      default: return CarModelM3
    }
  }, [activeCarId])

  // ─── Collect all parts after mount ───
  const partsRegistry = useRef(new Map())

  useEffect(() => {
    if (!sceneRef.current) return
    partsRegistry.current.clear()
    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.userData.partName) {
        partsRegistry.current.set(child.userData.partName, {
          name: child.userData.partName,
          displayName: child.userData.displayName || child.name,
          category: child.userData.category || 'Other',
          isBody: child.userData.isBody || false,
          mesh: child,
        })
      }
    })

    // Expose parts list to the store for the sidebar
    const partsList = []
    partsRegistry.current.forEach((v) => partsList.push(v))
    window.__showroomParts = partsList
    window.dispatchEvent(new Event('showroom-parts-ready'))
  }, [activeCarId, exhaustUpgrade])

  // ─── Part highlight system ───
  const highlightPart = useCallback((mesh) => {
    // Remove previous highlight
    if (highlightedRef.current && highlightedRef.current !== mesh) {
      unhighlightPart(highlightedRef.current)
    }

    if (mesh.material) {
      // Store original
      if (!originalMaterialsRef.current.has(mesh.uuid)) {
        originalMaterialsRef.current.set(mesh.uuid, {
          emissive: mesh.material.emissive ? mesh.material.emissive.clone() : new THREE.Color(0),
          emissiveIntensity: mesh.material.emissiveIntensity || 0,
        })
      }
      // Apply highlight
      if (mesh.material.emissive) {
        mesh.material.emissive.set(0x00d4ff)
        mesh.material.emissiveIntensity = 0.4
      }
    }
    highlightedRef.current = mesh
  }, [])

  const unhighlightPart = useCallback((mesh) => {
    if (mesh && mesh.material && originalMaterialsRef.current.has(mesh.uuid)) {
      const orig = originalMaterialsRef.current.get(mesh.uuid)
      if (mesh.material.emissive) {
        mesh.material.emissive.copy(orig.emissive)
        mesh.material.emissiveIntensity = orig.emissiveIntensity
      }
      originalMaterialsRef.current.delete(mesh.uuid)
    }
  }, [])

  // ─── Camera focus on part ───
  const focusOnPart = useCallback((mesh) => {
    const box = new THREE.Box3().setFromObject(mesh)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = Math.max(maxDim * 4, 3)

    // Offset camera to the side for a nice angle
    const targetPos = new THREE.Vector3(
      center.x + distance * 0.6,
      center.y + distance * 0.4,
      center.z + distance * 0.7
    )

    setCameraAnimating(true)
    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(center),
      onComplete: () => {
        camera.lookAt(center)
        setCameraAnimating(false)
      },
    })
  }, [camera, setCameraAnimating])

  // ─── Click handler ───
  const handleClick = useCallback((event) => {
    event.stopPropagation()
    const mesh = event.object

    if (mesh.userData.partName) {
      highlightPart(mesh)
      focusOnPart(mesh)
      selectPart({
        name: mesh.userData.partName,
        displayName: mesh.userData.displayName,
        category: mesh.userData.category,
      })
    }
  }, [highlightPart, focusOnPart, selectPart])

  // Handle click on empty space to deselect
  const handleMissed = useCallback(() => {
    if (highlightedRef.current) {
      unhighlightPart(highlightedRef.current)
      highlightedRef.current = null
    }
    clearSelection()
  }, [unhighlightPart, clearSelection])

  // ─── Animate hinged parts (GSAP) ───
  useEffect(() => {
    if (!pivotsRef.current) return
    const pivots = pivotsRef.current

    // Hood
    if (pivots.hoodPivot) {
      gsap.to(pivots.hoodPivot.rotation, {
        x: openParts.hood ? -0.8 : 0,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }

    // Driver Door (left side, opens outward via Y rotation)
    if (pivots.driverDoorPivot) {
      gsap.to(pivots.driverDoorPivot.rotation, {
        y: openParts.driverDoor ? -1.2 : 0,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }

    // Passenger Door (right side, opens outward via Y rotation)
    if (pivots.passengerDoorPivot) {
      gsap.to(pivots.passengerDoorPivot.rotation, {
        y: openParts.passengerDoor ? 1.2 : 0,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }

    // Trunk
    if (pivots.trunkPivot) {
      gsap.to(pivots.trunkPivot.rotation, {
        x: openParts.trunk ? 0.7 : 0,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }
  }, [openParts])

  // ─── X-Ray Mode ───
  useEffect(() => {
    if (!sceneRef.current) return

    sceneRef.current.traverse((child) => {
      if (!child.isMesh) return

      if (child.userData.isBody) {
        if (xrayMode) {
          child.material.transparent = true
          gsap.to(child.material, {
            opacity: 0.12,
            duration: 0.6,
            ease: 'power2.inOut',
          })
        } else {
          gsap.to(child.material, {
            opacity: 1.0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              child.material.transparent = false
            },
          })
        }
      }
    })
  }, [xrayMode])

  // ─── Real-time color/material updates ───
  useEffect(() => {
    if (!sceneRef.current) return

    sceneRef.current.traverse((child) => {
      if (!child.isMesh || !child.userData.partName) return

      const partName = child.userData.partName
      const customColor = getPartColor(activeCarId, partName)
      const materialPreset = getPartMaterial(activeCarId, partName)

      if (customColor) {
        child.material.color.set(customColor)
      }

      if (materialPreset && MATERIAL_PRESETS[materialPreset]) {
        const preset = MATERIAL_PRESETS[materialPreset]
        Object.entries(preset).forEach(([key, value]) => {
          if (child.material[key] !== undefined) {
            child.material[key] = value
          }
        })
      }
    })
  }, [partColors, partMaterials, activeCarId, getPartColor, getPartMaterial])

  // ─── Highlight selected part from sidebar ───
  useEffect(() => {
    if (!selectedPart || !sceneRef.current) return

    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.userData.partName === selectedPart.name) {
        highlightPart(child)
        focusOnPart(child)
      }
    })
  }, [selectedPart?.name])

  return (
    <group
      ref={sceneRef}
      onClick={handleClick}
      onPointerMissed={handleMissed}
    >
      <CarModel groupRef={pivotsRef} />
      {exhaustUpgrade && <ExhaustUpgrade />}
    </group>
  )
}

export { CATEGORIES, MATERIAL_PRESETS }
