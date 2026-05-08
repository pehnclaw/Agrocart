import { Trip } from "@/types";

/**
 * Agro-Carbon Engine v1.0
 * 
 * Logic:
 * - Average truck CO2: 0.16kg per ton-km
 * - Distance: Estimated based on Hub-to-Hub (Mock 150km avg)
 */
export function calculateTripCarbon(trip: Trip) {
  // Mock distance for simulation (in reality, calculate from Lat/Lng)
  const avgDistanceKm = 185; 
  
  // Total weight in tons (estimated from batch count if weight isn't available on trip)
  const estimatedTons = trip.batchIds.length * 0.5; // Avg 500kg per batch
  
  const co2Kg = estimatedTons * avgDistanceKm * 0.16;
  
  return {
    co2Kg: Math.round(co2Kg),
    credits: (co2Kg / 1000).toFixed(3) // 1 Carbon Credit = 1 Ton of CO2
  };
}

export function getTotalCarbonOffset(trips: Trip[]) {
  const totalCo2 = trips.reduce((sum, t) => sum + calculateTripCarbon(t).co2Kg, 0);
  return {
    totalCo2Kg: totalCo2,
    totalCredits: (totalCo2 / 1000).toFixed(2)
  };
}
