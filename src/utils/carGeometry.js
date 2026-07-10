import * as THREE from 'three'

/**
 * Creates a smooth car body shape from a 2D side-profile curve.
 * The profile is defined as an array of [x, y] points (side view),
 * then extruded along the Z axis to create the 3D body shell.
 * It is then rotated 90 degrees around Y so length is along Z and width is along X.
 */
export function createBodyGeometry(profilePoints, width, bevelRadius = 0.08) {
  const shape = new THREE.Shape()
  shape.moveTo(profilePoints[0][0], profilePoints[0][1])
  for (let i = 1; i < profilePoints.length; i++) {
    shape.lineTo(profilePoints[i][0], profilePoints[i][1])
  }
  shape.closePath()

  const extrudeSettings = {
    steps: 1,
    depth: width,
    bevelEnabled: true,
    bevelThickness: bevelRadius,
    bevelSize: bevelRadius,
    bevelSegments: 4,
  }

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geo.center()
  geo.rotateY(Math.PI / 2) // Align extruded Z-axis to X-axis, and X-axis to Z-axis
  return geo
}

/**
 * Creates a smooth car body from a side profile using CatmullRom spline.
 * It is then rotated 90 degrees around Y so length is along Z and width is along X.
 */
export function createSmoothBodyGeometry(profilePoints, width, segments = 60, bevelRadius = 0.06) {
  // Create a smooth spline from the profile points
  const curve = new THREE.CatmullRomCurve3(
    profilePoints.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    true, // closed
    'catmullrom',
    0.3 // tension
  )

  const pts = curve.getPoints(segments)
  const shape = new THREE.Shape()
  shape.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i].x, pts[i].y)
  }
  shape.closePath()

  const extrudeSettings = {
    steps: 1,
    depth: width,
    bevelEnabled: true,
    bevelThickness: bevelRadius,
    bevelSize: bevelRadius,
    bevelSegments: 3,
  }

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geo.center()
  geo.rotateY(Math.PI / 2) // Align extruded Z-axis to X-axis, and X-axis to Z-axis
  return geo
}

/**
 * Creates a wheel rim with spokes.
 */
export function createRimGeometry(outerRadius, innerRadius, thickness, spokeCount = 5) {
  const group = new THREE.Group()

  // Outer ring
  const outerGeo = new THREE.TorusGeometry(outerRadius, thickness * 0.3, 8, 32)
  // Hub
  const hubGeo = new THREE.CylinderGeometry(innerRadius * 0.35, innerRadius * 0.35, thickness, 16)
  // Center cap
  const capGeo = new THREE.CylinderGeometry(innerRadius * 0.2, innerRadius * 0.2, thickness * 1.1, 16)

  return { outerGeo, hubGeo, capGeo, spokeCount }
}

/**
 * Creates a fender arch shape (half-torus for wheel well)
 */
export function createWheelArchGeometry(radius, tubeRadius = 0.04, arc = Math.PI) {
  return new THREE.TorusGeometry(radius, tubeRadius, 8, 16, arc)
}

/**
 * Generates the cabin (greenhouse) glass shape as extruded geometry.
 * It is then rotated 90 degrees around Y.
 */
export function createCabinGlassGeometry(profilePoints, width) {
  const shape = new THREE.Shape()
  shape.moveTo(profilePoints[0][0], profilePoints[0][1])
  for (let i = 1; i < profilePoints.length; i++) {
    shape.lineTo(profilePoints[i][0], profilePoints[i][1])
  }
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  })
  geo.center()
  geo.rotateY(Math.PI / 2) // Align extruded Z-axis to X-axis, and X-axis to Z-axis
  return geo
}
