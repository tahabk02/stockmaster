export type ZoneNode = {
  id: string;
  name: string;
  load: number;
  capacity: number;
  status: "OPTIMAL" | "CRITICAL" | "SYNCING";
  type: "COLD" | "DRY" | "HAZMAT";
  coords: { x: number; y: number; z: number };
};
