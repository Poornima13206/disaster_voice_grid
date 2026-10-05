// Offline "geocoder" for demo purposes: known city lookup, else deterministic jitter around Bengaluru.
const CITIES: Record<string, [number, number]> = {
  bengaluru: [12.9716, 77.5946], bangalore: [12.9716, 77.5946], mumbai: [19.076, 72.8777], chennai: [13.0827, 80.2707],
  hyderabad: [17.385, 78.4867], kolkata: [22.5726, 88.3639], delhi: [28.6139, 77.209], kochi: [9.9312, 76.2673],
  alappuzha: [9.4981, 76.3388], kuttanad: [9.4, 76.4], pune: [18.5204, 73.8567], ahmedabad: [23.0225, 72.5714],
  bhubaneswar: [20.2961, 85.8245], cuttack: [20.4625, 85.883], mysuru: [12.2958, 76.6394], mysore: [12.2958, 76.6394],
  mangaluru: [12.9141, 74.856], patna: [25.5941, 85.1376], guwahati: [26.1445, 91.7362], trivandrum: [8.5241, 76.9366],
};
export function approxCoords(locationText: string): { lat: number; lng: number } {
  const s = locationText.toLowerCase();
  for (const [name, [lat, lng]] of Object.entries(CITIES)) if (s.includes(name)) return { lat, lng };
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return { lat: 12.9716 + ((h % 1000) / 1000 - 0.5) * 0.3, lng: 77.5946 + (((h >> 10) % 1000) / 1000 - 0.5) * 0.3 };
}
