/** Location suggestions for onboarding — continent → country → cities/regions. */

export type ContinentId =
  | "europe"
  | "north_america"
  | "asia"
  | "oceania"
  | "latin_america"
  | "africa"
  | "middle_east"
  | "remote";

export type LocationOption = {
  id: string;
  label: string;
  continent: ContinentId;
  kind: "continent" | "country" | "region" | "remote";
  /** Lowercase tokens for typeahead (delhi, nyc, …) */
  aliases?: string[];
};

export const CONTINENTS: { id: ContinentId; label: string }[] = [
  { id: "europe", label: "Europe" },
  { id: "north_america", label: "North America" },
  { id: "asia", label: "Asia" },
  { id: "oceania", label: "Oceania" },
  { id: "latin_america", label: "Latin America" },
  { id: "africa", label: "Africa" },
  { id: "middle_east", label: "Middle East" },
  { id: "remote", label: "Remote / multi-region" },
];

/**
 * Curated job-market set: all EU + common tech hubs worldwide.
 * Typeahead + custom “Add …” covers the long tail without a geo API.
 */
export const LOCATION_OPTIONS: LocationOption[] = [
  // Europe — EU + common markets
  { id: "eu", label: "EU", continent: "europe", kind: "region", aliases: ["european union", "europe"] },
  { id: "ireland", label: "Ireland", continent: "europe", kind: "country", aliases: ["ie", "éire"] },
  { id: "dublin", label: "Dublin, Ireland", continent: "europe", kind: "region", aliases: ["dublin"] },
  { id: "cork", label: "Cork, Ireland", continent: "europe", kind: "region", aliases: ["cork"] },
  { id: "galway", label: "Galway, Ireland", continent: "europe", kind: "region", aliases: ["galway"] },
  { id: "uk", label: "United Kingdom", continent: "europe", kind: "country", aliases: ["uk", "britain", "great britain"] },
  { id: "london", label: "London, UK", continent: "europe", kind: "region", aliases: ["london"] },
  { id: "manchester", label: "Manchester, UK", continent: "europe", kind: "region", aliases: ["manchester"] },
  { id: "edinburgh", label: "Edinburgh, UK", continent: "europe", kind: "region", aliases: ["edinburgh"] },
  { id: "germany", label: "Germany", continent: "europe", kind: "country", aliases: ["de", "deutschland"] },
  { id: "berlin", label: "Berlin, Germany", continent: "europe", kind: "region", aliases: ["berlin"] },
  { id: "munich", label: "Munich, Germany", continent: "europe", kind: "region", aliases: ["munich", "münchen"] },
  { id: "hamburg", label: "Hamburg, Germany", continent: "europe", kind: "region", aliases: ["hamburg"] },
  { id: "netherlands", label: "Netherlands", continent: "europe", kind: "country", aliases: ["nl", "holland"] },
  { id: "amsterdam", label: "Amsterdam, Netherlands", continent: "europe", kind: "region", aliases: ["amsterdam"] },
  { id: "france", label: "France", continent: "europe", kind: "country", aliases: ["fr"] },
  { id: "paris", label: "Paris, France", continent: "europe", kind: "region", aliases: ["paris"] },
  { id: "spain", label: "Spain", continent: "europe", kind: "country", aliases: ["es", "españa"] },
  { id: "madrid", label: "Madrid, Spain", continent: "europe", kind: "region", aliases: ["madrid"] },
  { id: "barcelona", label: "Barcelona, Spain", continent: "europe", kind: "region", aliases: ["barcelona"] },
  { id: "portugal", label: "Portugal", continent: "europe", kind: "country", aliases: ["pt"] },
  { id: "lisbon", label: "Lisbon, Portugal", continent: "europe", kind: "region", aliases: ["lisbon", "lisboa"] },
  { id: "sweden", label: "Sweden", continent: "europe", kind: "country", aliases: ["se"] },
  { id: "stockholm", label: "Stockholm, Sweden", continent: "europe", kind: "region", aliases: ["stockholm"] },
  { id: "denmark", label: "Denmark", continent: "europe", kind: "country", aliases: ["dk"] },
  { id: "copenhagen", label: "Copenhagen, Denmark", continent: "europe", kind: "region", aliases: ["copenhagen", "københavn"] },
  { id: "norway", label: "Norway", continent: "europe", kind: "country", aliases: ["no"] },
  { id: "oslo", label: "Oslo, Norway", continent: "europe", kind: "region", aliases: ["oslo"] },
  { id: "finland", label: "Finland", continent: "europe", kind: "country", aliases: ["fi"] },
  { id: "helsinki", label: "Helsinki, Finland", continent: "europe", kind: "region", aliases: ["helsinki"] },
  { id: "belgium", label: "Belgium", continent: "europe", kind: "country", aliases: ["be"] },
  { id: "brussels", label: "Brussels, Belgium", continent: "europe", kind: "region", aliases: ["brussels", "bruxelles"] },
  { id: "austria", label: "Austria", continent: "europe", kind: "country", aliases: ["at"] },
  { id: "vienna", label: "Vienna, Austria", continent: "europe", kind: "region", aliases: ["vienna", "wien"] },
  { id: "switzerland", label: "Switzerland", continent: "europe", kind: "country", aliases: ["ch"] },
  { id: "zurich", label: "Zurich, Switzerland", continent: "europe", kind: "region", aliases: ["zurich", "zürich"] },
  { id: "italy", label: "Italy", continent: "europe", kind: "country", aliases: ["it"] },
  { id: "milan", label: "Milan, Italy", continent: "europe", kind: "region", aliases: ["milan", "milano"] },
  { id: "rome", label: "Rome, Italy", continent: "europe", kind: "region", aliases: ["rome", "roma"] },
  { id: "poland", label: "Poland", continent: "europe", kind: "country", aliases: ["pl"] },
  { id: "warsaw", label: "Warsaw, Poland", continent: "europe", kind: "region", aliases: ["warsaw", "warszawa"] },
  { id: "hungary", label: "Hungary", continent: "europe", kind: "country", aliases: ["hu", "magyarország"] },
  { id: "budapest", label: "Budapest, Hungary", continent: "europe", kind: "region", aliases: ["budapest"] },
  { id: "czech", label: "Czechia", continent: "europe", kind: "country", aliases: ["cz", "czech republic", "czechia"] },
  { id: "prague", label: "Prague, Czechia", continent: "europe", kind: "region", aliases: ["prague", "praha"] },
  { id: "romania", label: "Romania", continent: "europe", kind: "country", aliases: ["ro"] },
  { id: "bucharest", label: "Bucharest, Romania", continent: "europe", kind: "region", aliases: ["bucharest"] },
  { id: "greece", label: "Greece", continent: "europe", kind: "country", aliases: ["gr"] },
  { id: "athens", label: "Athens, Greece", continent: "europe", kind: "region", aliases: ["athens"] },
  { id: "croatia", label: "Croatia", continent: "europe", kind: "country", aliases: ["hr"] },
  { id: "bulgaria", label: "Bulgaria", continent: "europe", kind: "country", aliases: ["bg"] },
  { id: "slovakia", label: "Slovakia", continent: "europe", kind: "country", aliases: ["sk"] },
  { id: "slovenia", label: "Slovenia", continent: "europe", kind: "country", aliases: ["si"] },
  { id: "estonia", label: "Estonia", continent: "europe", kind: "country", aliases: ["ee"] },
  { id: "tallinn", label: "Tallinn, Estonia", continent: "europe", kind: "region", aliases: ["tallinn"] },
  { id: "latvia", label: "Latvia", continent: "europe", kind: "country", aliases: ["lv"] },
  { id: "lithuania", label: "Lithuania", continent: "europe", kind: "country", aliases: ["lt"] },
  { id: "luxembourg", label: "Luxembourg", continent: "europe", kind: "country", aliases: ["lu"] },
  { id: "malta", label: "Malta", continent: "europe", kind: "country", aliases: ["mt"] },
  { id: "cyprus", label: "Cyprus", continent: "europe", kind: "country", aliases: ["cy"] },
  { id: "iceland", label: "Iceland", continent: "europe", kind: "country", aliases: ["is"] },
  { id: "remote-europe", label: "Remote Europe", continent: "europe", kind: "remote", aliases: ["remote eu", "remote europe"] },

  // North America
  { id: "usa", label: "United States", continent: "north_america", kind: "country", aliases: ["us", "usa", "america"] },
  { id: "nyc", label: "New York, NY", continent: "north_america", kind: "region", aliases: ["new york", "nyc", "ny"] },
  { id: "sf", label: "San Francisco Bay Area", continent: "north_america", kind: "region", aliases: ["san francisco", "sf", "bay area", "silicon valley"] },
  { id: "la", label: "Los Angeles, CA", continent: "north_america", kind: "region", aliases: ["los angeles", "la"] },
  { id: "seattle", label: "Seattle, WA", continent: "north_america", kind: "region", aliases: ["seattle"] },
  { id: "austin", label: "Austin, TX", continent: "north_america", kind: "region", aliases: ["austin"] },
  { id: "chicago", label: "Chicago, IL", continent: "north_america", kind: "region", aliases: ["chicago"] },
  { id: "boston", label: "Boston, MA", continent: "north_america", kind: "region", aliases: ["boston"] },
  { id: "denver", label: "Denver, CO", continent: "north_america", kind: "region", aliases: ["denver"] },
  { id: "canada", label: "Canada", continent: "north_america", kind: "country", aliases: ["ca", "canada"] },
  { id: "toronto", label: "Toronto, Canada", continent: "north_america", kind: "region", aliases: ["toronto"] },
  { id: "vancouver", label: "Vancouver, Canada", continent: "north_america", kind: "region", aliases: ["vancouver"] },
  { id: "montreal", label: "Montreal, Canada", continent: "north_america", kind: "region", aliases: ["montreal", "montréal"] },
  { id: "remote-na", label: "Remote North America", continent: "north_america", kind: "remote", aliases: ["remote us", "remote canada"] },

  // Asia
  { id: "india", label: "India", continent: "asia", kind: "country", aliases: ["in", "india"] },
  { id: "delhi", label: "Delhi NCR, India", continent: "asia", kind: "region", aliases: ["delhi", "new delhi", "ncr", "gurgaon", "gurugram", "noida"] },
  { id: "mumbai", label: "Mumbai, India", continent: "asia", kind: "region", aliases: ["mumbai", "bombay"] },
  { id: "bangalore", label: "Bengaluru, India", continent: "asia", kind: "region", aliases: ["bangalore", "bengaluru"] },
  { id: "hyderabad", label: "Hyderabad, India", continent: "asia", kind: "region", aliases: ["hyderabad"] },
  { id: "chennai", label: "Chennai, India", continent: "asia", kind: "region", aliases: ["chennai", "madras"] },
  { id: "pune", label: "Pune, India", continent: "asia", kind: "region", aliases: ["pune"] },
  { id: "singapore", label: "Singapore", continent: "asia", kind: "country", aliases: ["sg", "singapore"] },
  { id: "japan", label: "Japan", continent: "asia", kind: "country", aliases: ["jp", "japan"] },
  { id: "tokyo", label: "Tokyo, Japan", continent: "asia", kind: "region", aliases: ["tokyo"] },
  { id: "korea", label: "South Korea", continent: "asia", kind: "country", aliases: ["kr", "korea"] },
  { id: "seoul", label: "Seoul, South Korea", continent: "asia", kind: "region", aliases: ["seoul"] },
  { id: "vietnam", label: "Vietnam", continent: "asia", kind: "country", aliases: ["vn", "viet", "vietnam"] },
  { id: "hanoi", label: "Hanoi, Vietnam", continent: "asia", kind: "region", aliases: ["hanoi", "ha noi"] },
  { id: "hcmc", label: "Ho Chi Minh City, Vietnam", continent: "asia", kind: "region", aliases: ["ho chi minh", "saigon", "hcmc"] },
  { id: "thailand", label: "Thailand", continent: "asia", kind: "country", aliases: ["th"] },
  { id: "bangkok", label: "Bangkok, Thailand", continent: "asia", kind: "region", aliases: ["bangkok"] },
  { id: "indonesia", label: "Indonesia", continent: "asia", kind: "country", aliases: ["id"] },
  { id: "jakarta", label: "Jakarta, Indonesia", continent: "asia", kind: "region", aliases: ["jakarta"] },
  { id: "malaysia", label: "Malaysia", continent: "asia", kind: "country", aliases: ["my"] },
  { id: "kl", label: "Kuala Lumpur, Malaysia", continent: "asia", kind: "region", aliases: ["kuala lumpur", "kl"] },
  { id: "philippines", label: "Philippines", continent: "asia", kind: "country", aliases: ["ph"] },
  { id: "manila", label: "Manila, Philippines", continent: "asia", kind: "region", aliases: ["manila"] },
  { id: "taiwan", label: "Taiwan", continent: "asia", kind: "country", aliases: ["tw"] },
  { id: "taipei", label: "Taipei, Taiwan", continent: "asia", kind: "region", aliases: ["taipei"] },
  { id: "hongkong", label: "Hong Kong", continent: "asia", kind: "country", aliases: ["hk", "hong kong"] },
  { id: "china", label: "China", continent: "asia", kind: "country", aliases: ["cn", "prc"] },
  { id: "shanghai", label: "Shanghai, China", continent: "asia", kind: "region", aliases: ["shanghai"] },
  { id: "beijing", label: "Beijing, China", continent: "asia", kind: "region", aliases: ["beijing"] },

  // Oceania
  { id: "australia", label: "Australia", continent: "oceania", kind: "country", aliases: ["au", "australia"] },
  { id: "sydney", label: "Sydney, Australia", continent: "oceania", kind: "region", aliases: ["sydney"] },
  { id: "melbourne", label: "Melbourne, Australia", continent: "oceania", kind: "region", aliases: ["melbourne"] },
  { id: "nz", label: "New Zealand", continent: "oceania", kind: "country", aliases: ["nz", "new zealand"] },
  { id: "auckland", label: "Auckland, New Zealand", continent: "oceania", kind: "region", aliases: ["auckland"] },

  // Latin America
  { id: "brazil", label: "Brazil", continent: "latin_america", kind: "country", aliases: ["br", "brazil", "brasil"] },
  { id: "saopaulo", label: "São Paulo, Brazil", continent: "latin_america", kind: "region", aliases: ["sao paulo", "são paulo"] },
  { id: "mexico", label: "Mexico", continent: "latin_america", kind: "country", aliases: ["mx", "mexico"] },
  { id: "mexicocity", label: "Mexico City", continent: "latin_america", kind: "region", aliases: ["mexico city", "cdmx"] },
  { id: "argentina", label: "Argentina", continent: "latin_america", kind: "country", aliases: ["ar"] },
  { id: "buenosaires", label: "Buenos Aires, Argentina", continent: "latin_america", kind: "region", aliases: ["buenos aires"] },
  { id: "colombia", label: "Colombia", continent: "latin_america", kind: "country", aliases: ["co"] },
  { id: "chile", label: "Chile", continent: "latin_america", kind: "country", aliases: ["cl"] },

  // Africa / ME
  { id: "uae", label: "United Arab Emirates", continent: "middle_east", kind: "country", aliases: ["uae", "emirates"] },
  { id: "dubai", label: "Dubai, UAE", continent: "middle_east", kind: "region", aliases: ["dubai"] },
  { id: "abudhabi", label: "Abu Dhabi, UAE", continent: "middle_east", kind: "region", aliases: ["abu dhabi"] },
  { id: "saudi", label: "Saudi Arabia", continent: "middle_east", kind: "country", aliases: ["sa", "ksa"] },
  { id: "israel", label: "Israel", continent: "middle_east", kind: "country", aliases: ["il", "israel"] },
  { id: "telaviv", label: "Tel Aviv, Israel", continent: "middle_east", kind: "region", aliases: ["tel aviv"] },
  { id: "southafrica", label: "South Africa", continent: "africa", kind: "country", aliases: ["za", "south africa"] },
  { id: "capetown", label: "Cape Town, South Africa", continent: "africa", kind: "region", aliases: ["cape town"] },
  { id: "nigeria", label: "Nigeria", continent: "africa", kind: "country", aliases: ["ng", "nigeria"] },
  { id: "lagos", label: "Lagos, Nigeria", continent: "africa", kind: "region", aliases: ["lagos"] },
  { id: "kenya", label: "Kenya", continent: "africa", kind: "country", aliases: ["ke"] },
  { id: "nairobi", label: "Nairobi, Kenya", continent: "africa", kind: "region", aliases: ["nairobi"] },
  { id: "egypt", label: "Egypt", continent: "africa", kind: "country", aliases: ["eg"] },

  // Remote
  { id: "remote-worldwide", label: "Remote worldwide", continent: "remote", kind: "remote", aliases: ["remote", "anywhere", "worldwide"] },
];

export function searchLocations(query: string, limit = 12): LocationOption[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const scored = LOCATION_OPTIONS.map((opt) => {
    const label = opt.label.toLowerCase();
    const aliases = (opt.aliases ?? []).map((a) => a.toLowerCase());
    const hay = [label, ...aliases].join(" ");
    let score = 0;
    if (label.startsWith(q) || aliases.some((a) => a.startsWith(q))) score += 50;
    if (hay.includes(q)) score += 20;
    if (opt.kind === "country" && (label.startsWith(q) || aliases.some((a) => a.startsWith(q)))) {
      score += 10;
    }
    if (opt.kind === "region" && hay.includes(q)) score += 5;
    return { opt, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.opt);
}

export function countriesForContinent(continent: ContinentId): LocationOption[] {
  return LOCATION_OPTIONS.filter(
    (o) => o.continent === continent && (o.kind === "country" || o.kind === "remote"),
  );
}

export function regionsForCountryLabel(countryLabel: string): LocationOption[] {
  const needle = countryLabel.toLowerCase();
  return LOCATION_OPTIONS.filter(
    (o) => o.kind === "region" && o.label.toLowerCase().includes(needle.split(",")[0]!),
  );
}

/** Title-case a freeform custom market label. */
export function formatCustomMarketLabel(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}
