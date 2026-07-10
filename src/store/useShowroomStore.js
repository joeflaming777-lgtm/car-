import { create } from 'zustand'

const CAR_DATA = {
  m3: {
    id: 'm3',
    name: 'BMW M3 Sedan',
    year: '2025',
    power: '503 HP',
    torque: '479 lb-ft',
    engine: 'Twin-Turbo I6',
    transmission: '6-Speed Manual',
  },
  m4: {
    id: 'm4',
    name: 'BMW M4 Coupé',
    year: '2025',
    power: '523 HP',
    torque: '479 lb-ft',
    engine: 'Twin-Turbo I6',
    transmission: '8-Speed Auto',
  },
  x5: {
    id: 'x5',
    name: 'BMW X5 SUV',
    year: '2025',
    power: '523 HP',
    torque: '553 lb-ft',
    engine: 'Twin-Turbo V8',
    transmission: '8-Speed Auto',
  },
}

const useShowroomStore = create((set, get) => ({
  // ─── Active Car ───
  activeCarId: 'm3',
  carData: CAR_DATA,
  getActiveCar: () => CAR_DATA[get().activeCarId],
  setActiveCar: (id) =>
    set({
      activeCarId: id,
      selectedPart: null,
      openParts: { hood: false, driverDoor: false, passengerDoor: false, trunk: false },
    }),

  // ─── Selected Part ───
  selectedPart: null,
  selectPart: (partInfo) => set({ selectedPart: partInfo }),
  clearSelection: () => set({ selectedPart: null }),

  // ─── Part Colors (per-car, per-part) ───
  partColors: {},
  setPartColor: (carId, partName, color) =>
    set((state) => ({
      partColors: {
        ...state.partColors,
        [carId]: {
          ...(state.partColors[carId] || {}),
          [partName]: color,
        },
      },
    })),
  getPartColor: (carId, partName) => get().partColors[carId]?.[partName] || null,

  // ─── Part Materials ───
  partMaterials: {},
  setPartMaterial: (carId, partName, material) =>
    set((state) => ({
      partMaterials: {
        ...state.partMaterials,
        [carId]: {
          ...(state.partMaterials[carId] || {}),
          [partName]: material,
        },
      },
    })),
  getPartMaterial: (carId, partName) => get().partMaterials[carId]?.[partName] || 'metallic',

  // ─── Open Parts (animations) ───
  openParts: {
    hood: false,
    driverDoor: false,
    passengerDoor: false,
    trunk: false,
  },
  togglePart: (partKey) =>
    set((state) => ({
      openParts: {
        ...state.openParts,
        [partKey]: !state.openParts[partKey],
      },
    })),

  // ─── X-Ray Mode ───
  xrayMode: false,
  toggleXray: () => set((state) => ({ xrayMode: !state.xrayMode })),

  // ─── Exhaust Upgrade ───
  exhaustUpgrade: false,
  toggleExhaustUpgrade: () =>
    set((state) => ({ exhaustUpgrade: !state.exhaustUpgrade })),

  // ─── Camera animation lock ───
  cameraAnimating: false,
  setCameraAnimating: (val) => set({ cameraAnimating: val }),
}))

export default useShowroomStore
