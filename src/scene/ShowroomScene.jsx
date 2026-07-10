import React, { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import useShowroomStore from '../store/useShowroomStore'
import CarController from './CarController'

function ShowroomLighting() {
  return (
    <>
      <ambientLight intensity={0.3} color="#b0c4de" />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.5} color="#aaccff" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={0.8}
        intensity={1.0}
        color="#ffffff"
        castShadow
      />
      {/* Accent rim lights */}
      <pointLight position={[-6, 2, 0]} intensity={0.3} color="#00d4ff" distance={15} />
      <pointLight position={[6, 2, 0]} intensity={0.3} color="#a855f7" distance={15} />
    </>
  )
}

function ShowroomFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#0a0a12"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a1a2e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#222244"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.6}
        scale={20}
        blur={2}
        far={4}
        color="#000022"
      />
    </>
  )
}

function FallbackLoader() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  )
}

export default function ShowroomScene() {
  const controlsRef = useRef()
  const cameraAnimating = useShowroomStore((s) => s.cameraAnimating)

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [5, 3, 7], fov: 45, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
      >
        <ShowroomLighting />

        <Suspense fallback={<FallbackLoader />}>
          <Environment preset="city" background={false} />
          <CarController />
        </Suspense>

        <ShowroomFloor />

        <OrbitControls
          ref={controlsRef}
          enabled={!cameraAnimating}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 0.5, 0]}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  )
}
