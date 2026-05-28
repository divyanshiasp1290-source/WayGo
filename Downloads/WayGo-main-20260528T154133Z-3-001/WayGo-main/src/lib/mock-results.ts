export type VehicleType = "taxi" | "sharing" | "bus";

export interface SearchResult {
  id: string;
  type: VehicleType;
  operator: string;
  vehicleClass: string;
  departure: string;
  arrival: string;
  durationMin: number;
  price: number;
  seatsAvailable: number;
  rating: number;
  amenities: string[];
  taxiRideId?: string;
  sharingRideId?: string;
  routeId?: string;
  taxiId?: string;
  ownerType?: "vendor" | "admin";
}

const TAXI_OPERATORS = [
  { name: "BlueRide Sedan", cls: "Sedan • 4 seats", amen: ["AC", "Bottle water", "Music"] },
  { name: "Premier SUV", cls: "SUV • 6 seats", amen: ["AC", "Extra luggage", "Charger"] },
  { name: "City Hatchback", cls: "Hatchback • 4 seats", amen: ["AC", "Music"] },
  { name: "Elite Innova", cls: "MUV • 7 seats", amen: ["AC", "Recliner", "WiFi"] },
];

const SHARING_OPERATORS = [
  { name: "ShareGo Sedan", cls: "Shared Sedan • per seat", amen: ["AC", "Verified driver"] },
  { name: "PoolRide SUV", cls: "Shared SUV • per seat", amen: ["AC", "Female-friendly"] },
  { name: "QuickPool", cls: "Shared MUV • per seat", amen: ["AC", "Live tracking"] },
];

const BUS_OPERATORS = [
  { name: "Skyline Travels", cls: "AC Sleeper (2+1)", amen: ["WiFi", "Charger", "Blanket"] },
  { name: "GreenLine Express", cls: "AC Seater (2+2)", amen: ["WiFi", "Charger"] },
  { name: "Royal Coach", cls: "Volvo AC Multi-Axle", amen: ["WiFi", "Snacks", "Reading light"] },
  { name: "NightRunner", cls: "Non-AC Sleeper", amen: ["Charger", "Blanket"] },
];

function seedFrom(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

function fmtTime(h: number, m: number) {
  const hh = String(((h % 24) + 24) % 24).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function generateResults(
  type: VehicleType,
  from: string,
  to: string,
  date: string,
): SearchResult[] {
  const rand = seedFrom(`${type}|${from}|${to}|${date}`);
  const ops =
    type === "taxi" ? TAXI_OPERATORS : type === "sharing" ? SHARING_OPERATORS : BUS_OPERATORS;
  const count = type === "taxi" ? 6 : type === "sharing" ? 5 : 8;
  const baseDistance = 80 + Math.floor(rand() * 400);

  return Array.from({ length: count }, (_, i) => {
    const op = ops[i % ops.length];
    const departHour = 5 + Math.floor(rand() * 18);
    const departMin = Math.floor(rand() * 12) * 5;
    const durationMin =
      type === "taxi"
        ? 60 + Math.floor(rand() * 240)
        : type === "sharing"
          ? 90 + Math.floor(rand() * 200)
          : 180 + Math.floor(rand() * 480);
    const arriveTotal = departHour * 60 + departMin + durationMin;
    const arrH = Math.floor(arriveTotal / 60);
    const arrM = arriveTotal % 60;
    const basePrice =
      type === "taxi"
        ? baseDistance * 12
        : type === "sharing"
          ? baseDistance * 3.2
          : baseDistance * 1.8;
    const price = Math.round((basePrice + rand() * 400) / 10) * 10;
    return {
      id: `${type}-${i}-${departHour}${departMin}`,
      type,
      operator: op.name,
      vehicleClass: op.cls,
      departure: fmtTime(departHour, departMin),
      arrival: fmtTime(arrH, arrM),
      durationMin,
      price,
      seatsAvailable:
        type === "taxi"
          ? 4 + Math.floor(rand() * 3)
          : type === "sharing"
            ? 1 + Math.floor(rand() * 4)
            : 8 + Math.floor(rand() * 25),
      rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
      amenities: op.amen,
    };
  }).sort((a, b) => a.price - b.price);
}

export function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export const POPULAR_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Goa",
  "Kochi",
  "Lucknow",
];
