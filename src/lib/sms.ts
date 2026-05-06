/**
 * Utility to send SMS via our internal API bridge
 */
export async function sendAgrocartSMS(to: string, message: string) {
  try {
    const response = await fetch("/api/sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, message }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to send SMS");
    }

    return data;
  } catch (err) {
    console.error("SMS Utility Error:", err);
    // We don't throw here to avoid breaking the main UI flow if SMS fails
    return { success: false, error: err };
  }
}

/**
 * Pre-defined message templates for consistency
 */
export const SMSTemplates = {
  intakeReceipt: (weight: number, crop: string, hub: string) => 
    `Agrocart: Received ${weight}kg of ${crop} from you at ${hub}. Your digital receipt is ready in the app.`,
  
  tripAssigned: (origin: string, destination: string) => 
    `Agrocart: New Load assigned to you! From ${origin} to ${destination}. Please log in to view details and start trip.`,
  
  deliveryComplete: (tripId: string) => 
    `Agrocart: Delivery for Trip #${tripId.slice(-4)} confirmed. Escrow released. Thank you!`,
};
