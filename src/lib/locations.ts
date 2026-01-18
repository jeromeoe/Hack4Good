export type Area = "all" | "Central" | "East" | "West";

export const AREA_OPTIONS: { value: Area; label: string }[] = [
  { value: "all", label: "All areas" },
  { value: "Central", label: "Central" },
  { value: "East", label: "East" },
  { value: "West", label: "West" },
];

export function areaFromLocation(location: string): Exclude<Area, "all"> {
  const t = location.toLowerCase();

  if (t.includes("west")) return "West";
  if (t.includes("east")) return "East";

  return "Central";
}
