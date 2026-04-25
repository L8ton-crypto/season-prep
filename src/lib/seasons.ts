export type Season = "spring" | "summer" | "autumn" | "winter";

export const SEASONS: { id: Season; label: string; emoji: string; months: number[]; accent: string; gradient: string }[] = [
  { id: "spring", label: "Spring", emoji: "🌱", months: [3, 4, 5], accent: "text-emerald-300", gradient: "from-emerald-500/20 to-lime-500/10" },
  { id: "summer", label: "Summer", emoji: "☀️", months: [6, 7, 8], accent: "text-amber-300", gradient: "from-amber-500/20 to-yellow-500/10" },
  { id: "autumn", label: "Autumn", emoji: "🍂", months: [9, 10, 11], accent: "text-orange-300", gradient: "from-orange-500/20 to-red-500/10" },
  { id: "winter", label: "Winter", emoji: "❄️", months: [12, 1, 2], accent: "text-sky-300", gradient: "from-sky-500/20 to-indigo-500/10" },
];

export const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: "wardrobe", label: "Wardrobe", emoji: "👕" },
  { id: "school", label: "School", emoji: "🎒" },
  { id: "holiday", label: "Holiday", emoji: "🏖️" },
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "activities", label: "Activities", emoji: "⚽" },
  { id: "health", label: "Health", emoji: "💊" },
  { id: "general", label: "General", emoji: "📌" },
];

export function currentSeason(date = new Date()): Season {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

export function nextSeason(date = new Date()): Season {
  const s = currentSeason(date);
  const order: Season[] = ["spring", "summer", "autumn", "winter"];
  return order[(order.indexOf(s) + 1) % 4];
}

// First day of each season for countdown.
export function seasonStart(season: Season, year: number): Date {
  const map: Record<Season, [number, number]> = {
    spring: [3, 1],
    summer: [6, 1],
    autumn: [9, 1],
    winter: [12, 1],
  };
  const [m, d] = map[season];
  return new Date(year, m - 1, d);
}

export function nextSeasonStart(date = new Date()): { season: Season; date: Date } {
  const next = nextSeason(date);
  let year = date.getFullYear();
  // If current is autumn -> winter starts Dec same year. If current is winter -> spring next year.
  const cur = currentSeason(date);
  if (cur === "winter" && next === "spring") year += 1;
  return { season: next, date: seasonStart(next, year) };
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export const TEMPLATE_TASKS: { season: Season; category: string; title: string; due_month?: number }[] = [
  // Spring
  { season: "spring", category: "wardrobe", title: "Pack away winter coats and woollens" },
  { season: "spring", category: "wardrobe", title: "Check kids' wellies still fit" },
  { season: "spring", category: "wardrobe", title: "Stock up on sun cream before half term" },
  { season: "spring", category: "wardrobe", title: "Sun hats out of storage, check sizing" },
  { season: "spring", category: "school", title: "Easter holiday childcare booked" },
  { season: "spring", category: "school", title: "Summer term PE kit checked" },
  { season: "spring", category: "holiday", title: "May half term plan locked in" },
  { season: "spring", category: "holiday", title: "Summer holiday booked or shortlisted" },
  { season: "spring", category: "holiday", title: "Passports valid (6+ months remaining)" },
  { season: "spring", category: "home", title: "Clocks forward - last Sunday of March", due_month: 3 },
  { season: "spring", category: "home", title: "Garden tidy - lawn mower serviced" },
  { season: "spring", category: "home", title: "BBQ check, gas bottle refill" },
  { season: "spring", category: "home", title: "Smoke alarm batteries swap (annual)" },
  { season: "spring", category: "activities", title: "Summer sports clubs sign-up" },
  { season: "spring", category: "activities", title: "Swimming lessons confirmed" },
  { season: "spring", category: "health", title: "Hayfever meds stocked" },
  { season: "spring", category: "health", title: "Allergy plan refreshed for school" },

  // Summer
  { season: "summer", category: "wardrobe", title: "Sandals fit check for each kid" },
  { season: "summer", category: "wardrobe", title: "Swimwear sizing for everyone" },
  { season: "summer", category: "wardrobe", title: "Lighter pyjamas in rotation" },
  { season: "summer", category: "wardrobe", title: "Spare sun hats and water bottles" },
  { season: "summer", category: "school", title: "End-of-year teacher gifts sorted", due_month: 7 },
  { season: "summer", category: "school", title: "School photo orders submitted" },
  { season: "summer", category: "school", title: "Summer reading list stocked" },
  { season: "summer", category: "holiday", title: "Travel insurance bought" },
  { season: "summer", category: "holiday", title: "Pet sitter / boarding confirmed" },
  { season: "summer", category: "holiday", title: "Adapters, chargers, suitcases out of loft" },
  { season: "summer", category: "home", title: "Paddling pool / garden toys checked" },
  { season: "summer", category: "home", title: "Fly screens up if needed" },
  { season: "summer", category: "home", title: "Garden watering plan for time away" },
  { season: "summer", category: "activities", title: "Holiday clubs booked early" },
  { season: "summer", category: "activities", title: "Camping kit out and aired" },
  { season: "summer", category: "health", title: "After-sun and insect repellent stocked" },
  { season: "summer", category: "health", title: "Plasters and travel first-aid topped up" },

  // Autumn
  { season: "autumn", category: "wardrobe", title: "School shoes - measure and buy", due_month: 8 },
  { season: "autumn", category: "wardrobe", title: "Wellies and waterproofs checked" },
  { season: "autumn", category: "wardrobe", title: "Winter coats out, sized up if needed" },
  { season: "autumn", category: "wardrobe", title: "Hats, gloves, scarves found" },
  { season: "autumn", category: "school", title: "Back-to-school stationery", due_month: 8 },
  { season: "autumn", category: "school", title: "Uniform sizing and name labels", due_month: 8 },
  { season: "autumn", category: "school", title: "Lunchbox and water bottle replacements" },
  { season: "autumn", category: "school", title: "PE kit refreshed for new year" },
  { season: "autumn", category: "holiday", title: "October half term plan agreed" },
  { season: "autumn", category: "home", title: "Boiler service booked" },
  { season: "autumn", category: "home", title: "Gutters cleared before storms" },
  { season: "autumn", category: "home", title: "Draught proofing checked" },
  { season: "autumn", category: "home", title: "Clocks back - last Sunday of October", due_month: 10 },
  { season: "autumn", category: "home", title: "Halloween decor and costumes sorted" },
  { season: "autumn", category: "activities", title: "After-school clubs term plan" },
  { season: "autumn", category: "activities", title: "Music lessons restart" },
  { season: "autumn", category: "health", title: "Flu jabs booked" },
  { season: "autumn", category: "health", title: "Vitamin D for the family" },

  // Winter
  { season: "winter", category: "wardrobe", title: "Thermals in rotation" },
  { season: "winter", category: "wardrobe", title: "Slippers - check sizing" },
  { season: "winter", category: "wardrobe", title: "Waterproof gloves topped up" },
  { season: "winter", category: "school", title: "Christmas concert/nativity costumes", due_month: 12 },
  { season: "winter", category: "school", title: "Parents' evening notes ready" },
  { season: "winter", category: "school", title: "End-of-term teacher cards" },
  { season: "winter", category: "holiday", title: "Christmas day plan confirmed", due_month: 12 },
  { season: "winter", category: "holiday", title: "Boxing Day and NYE plans" },
  { season: "winter", category: "holiday", title: "Christmas card list updated" },
  { season: "winter", category: "home", title: "Christmas decor up by mid-December", due_month: 12 },
  { season: "winter", category: "home", title: "Salt or grit by the door" },
  { season: "winter", category: "home", title: "Pipe lagging checked" },
  { season: "winter", category: "home", title: "Door and shed locks before holidays" },
  { season: "winter", category: "activities", title: "Pantomime tickets booked" },
  { season: "winter", category: "activities", title: "Ice skating or winter day out planned" },
  { season: "winter", category: "health", title: "Cold and flu meds stocked" },
  { season: "winter", category: "health", title: "Throat lozenges and paracetamol stock" },
];
