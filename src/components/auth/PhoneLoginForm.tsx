"use client";

import { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

export default function PhoneLoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize RecaptchaVerifier
    if (recaptchaContainerRef.current && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: "invisible",
      });
    }
    
    // Cleanup
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!window.recaptchaVerifier) throw new Error("Recaptcha not initialized");
      
      const appVerifier = window.recaptchaVerifier;
      // Format number to include country code if missing (Basic validation)
      const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+234${phoneNumber.replace(/^0+/, '')}`;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;

    setLoading(true);
    setError("");

    try {
      await confirmationResult.confirm(verificationCode);
      // AuthContext will detect the signed-in user and the login page
      // will redirect to onboarding (new user) or dashboard (returning user).
    } catch (err: any) {
      console.error(err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Invisible Recaptcha */}
      <div ref={recaptchaContainerRef}></div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-danger-light text-danger text-sm">
          {error}
        </div>
      )}

      {!confirmationResult ? (
        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="input"
              placeholder="+234 800 000 0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="code">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              className="input text-center tracking-[0.5em] font-mono text-lg"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted mt-2 text-center">
              Enter the 6-digit code sent to your phone.
            </p>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
          <button 
            type="button"
            className="text-sm text-primary hover:underline mt-2 text-center"
            onClick={() => setConfirmationResult(null)}
            disabled={loading}
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
}
