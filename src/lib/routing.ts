/**
 * Utility functions for Route Optimization & Pricing Algorithm
 */

// Converts degrees to radians
function toRad(value: number) {
  return (value * Math.PI) / 180;
}

/**
 * Calculates the straight-line distance between two coordinates in Kilometers
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in Kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Calculates the optimized escrow payout price based on distance and weight.
 * Rate Card: ₦150 per Ton per Kilometer (Test Baseline).
 *
 * @param distanceKm The distance to travel in kilometers
 * @param weightKg The total weight of the batches in kilograms
 * @returns The suggested price in NGN
 */
export function calculateOptimizedPrice(
  distanceKm: number,
  weightKg: number
): number {
  // Convert kg to Tons (1000kg = 1 Ton)
  const tons = weightKg / 1000;
  
  // Baseline Rate: ₦150 per Ton per km
  const ratePerTonPerKm = 150;
  
  // Base cost
  let optimizedPrice = tons * distanceKm * ratePerTonPerKm;
  
  // Apply a minimum floor price so short trips aren't unprofitable
  // e.g., minimum ₦15,000 to move a truck
  const minPrice = 15000;
  
  return Math.max(optimizedPrice, minPrice);
}
