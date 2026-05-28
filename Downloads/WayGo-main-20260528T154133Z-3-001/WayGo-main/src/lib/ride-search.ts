import { supabase } from "@/integrations/supabase/client";
import type { SearchResult, VehicleType } from "@/lib/mock-results";
import { fmtDuration } from "@/lib/mock-results";

function cityMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function minutesToTime(total: number) {
  const h = Math.floor(((total % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type TaxiRideRow = {
  id: string;
  owner_type: string;
  from_city: string;
  to_city: string;
  travel_date: string;
  departure_time: string;
  price: number;
  seats_available: number;
  route_id: string | null;
  taxi_id: string;
  taxis: { model: string; plate_number: string; taxi_type: string; capacity: number } | null;
  routes: { duration_minutes: number | null } | null;
  drivers: { full_name: string | null; rating: number | null } | null;
};

type SharingRideRow = {
  id: string;
  from_city: string;
  to_city: string;
  departure_at: string;
  price_per_seat: number;
  seats_total: number;
  seats_booked: number;
  route_id: string | null;
  taxis: { model: string; taxi_type: string } | null;
  routes: { route_category: string | null; duration_minutes: number | null } | null;
};

export async function searchPublishedRides(
  type: VehicleType,
  from: string,
  to: string,
  date: string,
): Promise<SearchResult[]> {
  if (type === "taxi") {
    return searchTaxiRides(from, to, date);
  }
  if (type === "sharing") {
    return searchSharingRides(from, to, date);
  }
  return [];
}

async function searchTaxiRides(from: string, to: string, date: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from("taxi_rides")
    .select(
      `id, owner_type, from_city, to_city, travel_date, departure_time, price, seats_available, route_id, taxi_id,
      taxis(model, plate_number, taxi_type, capacity),
      routes(duration_minutes),
      drivers(full_name, rating)`,
    )
    .eq("status", "open")
    .eq("travel_date", date)
    .gt("seats_available", 0);

  if (error) {
    console.error("taxi_rides search:", error.message);
    return [];
  }

  const rows = (data ?? []) as TaxiRideRow[];
  const matched = rows.filter(
    (r) => cityMatch(r.from_city, from) && cityMatch(r.to_city, to),
  );

  const vendorRows = matched.filter((r) => r.owner_type === "vendor");
  const adminRows = matched.filter((r) => r.owner_type === "admin");
  const ordered = vendorRows.length ? vendorRows : adminRows;

  return ordered.map((r) => mapTaxiRide(r));
}

async function searchSharingRides(from: string, to: string, date: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from("sharing_rides")
    .select(
      `id, from_city, to_city, departure_at, price_per_seat, seats_total, seats_booked, route_id,
      taxis(model, taxi_type),
      routes(route_category, duration_minutes)`,
    )
    .eq("status", "open");

  if (error) {
    console.error("sharing_rides search:", error.message);
    return [];
  }

  const rows = (data ?? []) as SharingRideRow[];
  return rows
    .filter((r) => {
      const depDate = r.departure_at.slice(0, 10);
      const religious = r.routes?.route_category === "religious";
      return (
        religious &&
        cityMatch(r.from_city, from) &&
        cityMatch(r.to_city, to) &&
        depDate === date
      );
    })
    .map((r) => mapSharingRide(r));
}

function mapTaxiRide(r: TaxiRideRow): SearchResult {
  const durationMin = r.routes?.duration_minutes ?? 120;
  const departMin = parseTimeToMinutes(r.departure_time);
  const arrival = minutesToTime(departMin + durationMin);
  const taxi = r.taxis;
  const driverName = r.drivers?.full_name ?? "Assigned driver";

  return {
    id: `taxi-${r.id}`,
    type: "taxi",
    operator: taxi ? `${taxi.model} · ${taxi.plate_number}` : "Taxi ride",
    vehicleClass: taxi
      ? `${taxi.taxi_type} · ${driverName}`
      : driverName,
    departure: r.departure_time,
    arrival,
    durationMin,
    price: Number(r.price),
    seatsAvailable: r.seats_available,
    rating: Number(r.drivers?.rating ?? 4.5),
    amenities: ["AC", "Verified operator", fmtDuration(durationMin)],
    taxiRideId: r.id,
    routeId: r.route_id ?? undefined,
    taxiId: r.taxi_id,
    ownerType: r.owner_type as "vendor" | "admin",
  };
}

function mapSharingRide(r: SharingRideRow): SearchResult {
  const dep = new Date(r.departure_at);
  const departure = `${String(dep.getHours()).padStart(2, "0")}:${String(dep.getMinutes()).padStart(2, "0")}`;
  const durationMin = r.routes?.duration_minutes ?? 150;
  const arrival = minutesToTime(parseTimeToMinutes(departure) + durationMin);
  const seatsLeft = Math.max(0, r.seats_total - r.seats_booked);
  const taxi = r.taxis;

  return {
    id: `sharing-${r.id}`,
    type: "sharing",
    operator: taxi ? `Shared · ${taxi.model}` : "Shared taxi",
    vehicleClass: taxi ? `${taxi.taxi_type} · Religious route` : "Religious shared taxi",
    departure,
    arrival,
    durationMin,
    price: Number(r.price_per_seat),
    seatsAvailable: seatsLeft,
    rating: 4.6,
    amenities: ["AC", "Religious route", "Per seat"],
    sharingRideId: r.id,
    routeId: r.route_id ?? undefined,
  };
}
