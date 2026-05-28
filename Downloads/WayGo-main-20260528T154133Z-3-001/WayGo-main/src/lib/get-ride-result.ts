import { generateResults, type SearchResult, type VehicleType } from "@/lib/mock-results";
import { searchPublishedRides } from "@/lib/ride-search";

export async function getRideResult(
  resultId: string,
  type: VehicleType,
  from: string,
  to: string,
  date: string,
): Promise<SearchResult | null> {
  if (type === "bus") {
    const mock = generateResults("bus", from, to, date);
    return mock.find((r) => r.id === resultId) ?? mock[0] ?? null;
  }

  const live = await searchPublishedRides(type, from, to, date);
  return live.find((r) => r.id === resultId) ?? live[0] ?? null;
}
