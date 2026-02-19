import { calculateDistance } from '@roommate/shared';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export type AmenityType =
  | 'SUPERMARKET'
  | 'GROCERY'
  | 'METRO_STATION'
  | 'TRAIN_STATION'
  | 'BUS_STOP'
  | 'TRAM_STOP'
  | 'BICYCLE_PARKING';

export interface NearbyAmenityResult {
  type: AmenityType;
  name: string;
  latitude: number;
  longitude: number;
  distanceM: number;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Build Overpass QL query for all amenity types within a radius.
 * Uses `[out:json]` and `center` for ways/relations.
 */
function buildOverpassQuery(lat: number, lng: number, radiusM: number): string {
  // around filter uses meters
  const around = `(around:${radiusM},${lat},${lng})`;

  return `
[out:json][timeout:15];
(
  // Supermarkets
  node["shop"="supermarket"]${around};
  way["shop"="supermarket"]${around};

  // Grocery / convenience stores
  node["shop"="convenience"]${around};
  way["shop"="convenience"]${around};

  // Metro stations
  node["station"="subway"]${around};
  node["railway"="subway_entrance"]${around};

  // Train stations
  node["railway"="station"]${around};
  way["railway"="station"]${around};

  // Bus stops
  node["highway"="bus_stop"]${around};

  // Tram stops
  node["railway"="tram_stop"]${around};

  // Bicycle parking
  node["amenity"="bicycle_parking"]${around};
  way["amenity"="bicycle_parking"]${around};
);
out center;
`;
}

/**
 * Classify an Overpass element into an AmenityType.
 */
function classifyElement(el: OverpassElement): AmenityType | null {
  const tags = el.tags || {};

  if (tags.shop === 'supermarket') return 'SUPERMARKET';
  if (tags.shop === 'convenience') return 'GROCERY';
  if (tags.station === 'subway' || tags.railway === 'subway_entrance') return 'METRO_STATION';
  if (tags.railway === 'station') return 'TRAIN_STATION';
  if (tags.highway === 'bus_stop') return 'BUS_STOP';
  if (tags.railway === 'tram_stop') return 'TRAM_STOP';
  if (tags.amenity === 'bicycle_parking') return 'BICYCLE_PARKING';

  return null;
}

/**
 * Get the name of an element, falling back to type-based defaults.
 */
function getElementName(el: OverpassElement, type: AmenityType): string {
  const tags = el.tags || {};
  if (tags.name) return tags.name;

  const defaults: Record<AmenityType, string> = {
    SUPERMARKET: 'Supermercato',
    GROCERY: 'Alimentari',
    METRO_STATION: 'Stazione Metro',
    TRAIN_STATION: 'Stazione Ferroviaria',
    BUS_STOP: 'Fermata Bus',
    TRAM_STOP: 'Fermata Tram',
    BICYCLE_PARKING: 'Deposito Biciclette',
  };

  return defaults[type] || 'Punto di interesse';
}

/**
 * Fetch nearby amenities from Overpass API for a given coordinate.
 * Returns deduplicated, sorted results grouped by type.
 */
export async function fetchNearbyAmenities(
  lat: number,
  lng: number,
  radiusM: number = 1000
): Promise<NearbyAmenityResult[]> {
  const query = buildOverpassQuery(lat, lng, radiusM);

  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data: OverpassResponse = await response.json();

  const results: NearbyAmenityResult[] = [];
  const seen = new Set<string>(); // Deduplicate by name+type

  for (const el of data.elements) {
    const type = classifyElement(el);
    if (!type) continue;

    // Get coordinates — nodes have lat/lon, ways/relations have center
    const elLat = el.lat ?? el.center?.lat;
    const elLon = el.lon ?? el.center?.lon;
    if (elLat === undefined || elLon === undefined) continue;

    const name = getElementName(el, type);
    const dedupeKey = `${type}:${name}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // calculateDistance returns km, convert to meters
    const distanceKm = calculateDistance(lat, lng, elLat, elLon);
    const distanceM = Math.round(distanceKm * 1000);

    results.push({
      type,
      name,
      latitude: elLat,
      longitude: elLon,
      distanceM,
    });
  }

  // Sort by distance
  results.sort((a, b) => a.distanceM - b.distanceM);

  return results;
}
