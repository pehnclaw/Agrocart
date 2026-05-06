import { NextResponse } from "next/server";

// We use require because africastalking doesn't have official TS types/ESM export in all versions
const options = {
  apiKey: process.env.AFRICASTALKING_API_KEY || "",
  username: process.env.AFRICASTALKING_USERNAME || "",
};

const AfricasTalking = require("africastalking")(options);
const sms = AfricasTalking.SMS;

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ error: "Missing 'to' or 'message'" }, { status: 400 });
    }

    // Format phone number (Africa's Talking prefers E.164 format)
    // If it starts with 0, we assume it's Nigerian (+234) for now as a default
    let formattedTo = to.trim();
    if (formattedTo.startsWith("0")) {
      formattedTo = "+234" + formattedTo.substring(1);
    } else if (!formattedTo.startsWith("+")) {
      formattedTo = "+" + formattedTo;
    }

    console.log(`Attempting to send SMS to ${formattedTo}: ${message}`);

    const result = await sms.send({
      to: [formattedTo],
      message: message,
      from: process.env.AFRICASTALKING_SENDER_ID || undefined, // Use alpha-numeric sender ID if provided
    });

    console.log("SMS Send Result:", result);

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Africa's Talking Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send SMS" }, { status: 500 });
  }
}
