"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import useCartStore from "@/app/(provider)/cart-store";
import useCheckoutStore from "@/app/(provider)/customer-checkout-store";
import { StepIndicator } from "./step-indicator";
import { StepEmail } from "./step-email";
import { StepBilling } from "./step-billing";
import { StepReview } from "./step-review";

export function CheckoutStepper() {
  const { cartItems } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStep = Math.min(
    Math.max(Number(searchParams.get("step") ?? 1), 1),
    3,
  ) as 1 | 2 | 3;

  const { email, billing, setEmail, setBilling, clearCheckout } =
    useCheckoutStore();

  const goToStep = (step: 1 | 2 | 3) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(step));
    router.push(`?${params.toString()}`);
  };

  // Guard: redirect back if arriving at a step without prerequisite data
  useEffect(() => {
    if (currentStep === 2 && !email) {
      goToStep(1);
    } else if (currentStep === 3 && (!email || !billing)) {
      goToStep(billing ? 2 : 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, email, billing]);

  if (cartItems.length === 0 && currentStep !== 3) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">
          Add some rooms to your cart before checking out.
        </p>
        <Button onClick={() => router.push("/room")}>Browse rooms</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && (
        <StepEmail
          defaultEmail={email}
          onVerified={(verifiedEmail, billingAddress) => {
            setEmail(verifiedEmail);
            if (billingAddress) {
              setBilling(billingAddress);
            }
            goToStep(2);
          }}
        />
      )}

      {currentStep === 2 && (
        <StepBilling
          defaultValues={billing ?? undefined}
          onNext={(values) => {
            setBilling(values);
            goToStep(3);
          }}
          onBack={() => goToStep(1)}
        />
      )}

      {currentStep === 3 && billing && (
        <StepReview
          email={email}
          billing={billing}
          onBack={() => goToStep(2)}
          onSuccess={() => clearCheckout()}
        />
      )}
    </div>
  );
}
