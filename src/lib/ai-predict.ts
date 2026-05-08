import { ProduceBatch } from "@/types";

/**
 * Agro-Predict AI Algorithm v1.0
 * 
 * Logic:
 * - Analyzes volume over the last 30 days.
 * - Applies a 1.2x multiplier for "Peak Season" (Simulated).
 * - Predicts next week's volume based on 7-day rolling average.
 */
export function predictHubDemand(batches: ProduceBatch[]) {
  if (batches.length === 0) return 0;

  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  
  // Calculate average daily volume over the last 7 days
  const recentBatches = batches.filter(b => b.createdAt >= sevenDaysAgo);
  const totalRecentVolume = recentBatches.reduce((sum, b) => sum + b.weightKg, 0);
  const avgDailyVolume = totalRecentVolume / 7;

  // Predict next week (7 days) with a slight growth/seasonality factor
  const seasonalityFactor = 1.15; // Simulated 15% growth factor
  const prediction = avgDailyVolume * 7 * seasonalityFactor;

  return Math.round(prediction / 100) * 100; // Round to nearest 100kg
}

export function getConfidenceScore(batches: ProduceBatch[]) {
  // Higher number of data points = Higher confidence
  if (batches.length > 50) return "High";
  if (batches.length > 10) return "Medium";
  return "Low (Awaiting more data)";
}
