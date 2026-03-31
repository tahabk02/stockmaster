import type { ZoneNode } from "./WarehouseUI";

export const WAREHOUSE_ZONES: ZoneNode[] = [
  { id: "A1", name: "ALPHA_LATTICE", load: 78, capacity: 5000, status: "OPTIMAL", type: "DRY", coords: { x: 10, y: 10, z: 0 } },
  { id: "B2", name: "BETA_CRYO", load: 92, capacity: 2000, status: "CRITICAL", type: "COLD", coords: { x: 40, y: 10, z: 0 } },
  { id: "C3", name: "GAMMA_HAZ", load: 45, capacity: 1500, status: "OPTIMAL", type: "HAZMAT", coords: { x: 10, y: 45, z: 0 } },
  { id: "D4", name: "DELTA_BUFF", load: 12, capacity: 10000, status: "SYNCING", type: "DRY", coords: { x: 40, y: 45, z: 0 } },
  { id: "E5", name: "EPSILON_CORE", load: 65, capacity: 8000, status: "OPTIMAL", type: "DRY", coords: { x: 70, y: 10, z: 0 } },
  { id: "F6", name: "ZETA_FLUX", load: 30, capacity: 3000, status: "OPTIMAL", type: "DRY", coords: { x: 70, y: 45, z: 0 } },
];
