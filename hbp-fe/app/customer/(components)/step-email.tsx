"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import {
  checkCustomerEmail,
  sendOtp,
  verifyOtp,
} from "@/app/(services)/customer-service";
import type { BillingValues } from "./step-billing";

const emailSchema = z.object({ email: z.string().email("Invalid email") });
const otpSchema = z.object({ code: z.string().min(4).max(8) });

interface StepEmailProps {
  defaultEmail?: string;
  onVerified: (email: string, billingAddress?: BillingValues | null) => void;
}

export function StepEmail({ defaultEmail, onVerified }: StepEmailProps) {
  const [isPending, setIsPending] = useState(false);
  const [phase, setPhase] = useState<"email" | "otp">("email");
  const [pendingEmail, setPendingEmail] = useState(defaultEmail ?? "");
  const [serverError, setServerError] = useState("");

  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail ?? "" },
  });

  const otpForm = useForm<{ code: string }>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const handleCheckEmail = emailForm.handleSubmit(async (values) => {
    setServerError("");
    setIsPending(true);
    try {
      const res = await checkCustomerEmail(values.email);
      if (res.isVerified) {
        const billing = res.billingAddress
          ? {
              ...res.billingAddress,
              addressLine2: res.billingAddress.addressLine2 ?? undefined,
            }
          : null;
        onVerified(values.email, billing);
        return;
      }
      const otpRes = await sendOtp(values.email);
      if (!otpRes.success) {
        setServerError(otpRes.message);
        return;
      }
      setPendingEmail(values.email);
      setPhase("otp");
    } finally {
      setIsPending(false);
    }
  });

  const handleResendOtp = async () => {
    setServerError("");
    setIsPending(true);
    try {
      const res = await sendOtp(pendingEmail);
      if (!res.success) setServerError(res.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyOtp = otpForm.handleSubmit(async (values) => {
    setServerError("");
    setIsPending(true);
    try {
      const res = await verifyOtp(pendingEmail, values.code);
      if (res.success) {
        onVerified(pendingEmail);
      } else {
        setServerError(res.message || "Invalid OTP code. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  });

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {phase === "email" ? (
        <>
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold">Enter your email</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ll check if your email is verified, or send you a code.
            </p>
          </div>

          <form onSubmit={handleCheckEmail} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Continue
            </Button>
          </form>
        </>
      ) : (
        <>
          <div className="text-center space-y-1">
            <ShieldCheck className="w-10 h-10 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Enter verification code</h2>
            <p className="text-sm text-muted-foreground">
              We sent a code to{" "}
              <span className="font-medium">{pendingEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">OTP Code</label>
              <Input
                type="text"
                placeholder="Enter code"
                maxLength={8}
                {...otpForm.register("code")}
              />
              {otpForm.formState.errors.code && (
                <p className="text-xs text-destructive">
                  {otpForm.formState.errors.code.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Verify
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={isPending}
              onClick={handleResendOtp}
            >
              Resend code
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                setPhase("email");
                setServerError("");
              }}
            >
              Use a different email
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
