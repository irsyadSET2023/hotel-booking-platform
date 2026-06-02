"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Loader2,
  ShoppingBag,
  ChevronLeft,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import useCartStore from "@/app/(provider)/cart-store";
import { checkoutCart } from "@/app/(services)/customer-service";
import type { CheckoutCartData } from "@/app/customer/(schema)/customer-checkout-cart-schema";
import type { BillingValues } from "./step-billing";

const guestSchema = z.object({
  guestName: z.string().min(1, "Required"),
  guestEmail: z.string().email("Invalid email"),
  specialRequests: z.string().optional(),
});

const reviewSchema = z.object({
  guests: z.array(guestSchema),
  currency: z.string().optional(),
});

type ReviewValues = z.infer<typeof reviewSchema>;

interface StepReviewProps {
  email: string;
  billing: BillingValues;
  onBack: () => void;
  onSuccess?: () => void;
}

export function StepReview({
  email,
  billing,
  onBack,
  onSuccess,
}: StepReviewProps) {
  const router = useRouter();
  const { cartItems, clearCart } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      guests: cartItems.map((item) => ({
        guestName: item.guestName ?? "",
        guestEmail: item.guestEmail ?? "",
        specialRequests: item.specialRequests ?? "",
      })),
      currency: "MYR",
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "guests" });

  const formatDate = (d?: Date | string) =>
    d
      ? new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" })
      : "—";

  const handleSubmit = form.handleSubmit((values) => {
    setServerError("");
    startTransition(async () => {
      const payload: CheckoutCartData = {
        email,
        billingDetails: billing,
        currency: values.currency,
        cartItems: cartItems.map((item, idx) => ({
          roomCategoryUuid: item.roomCategoryUuid,
          checkInDate: item.checkInDate
            ? new Date(item.checkInDate).toISOString()
            : "",
          checkOutDate: item.checkOutDate
            ? new Date(item.checkOutDate).toISOString()
            : "",
          guestName: values.guests[idx].guestName,
          guestEmail: values.guests[idx].guestEmail,
          specialRequests: values.guests[idx].specialRequests ?? undefined,
        })),
      };

      const res = await checkoutCart(payload);

      console.log("Checkout response:", res);
      if (res.success) {
        clearCart();
        onSuccess?.();
        setSuccess(true);
        const paymentUrl = res?.data?.url;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        }
      } else {
        setServerError(res.message || "Checkout failed. Please try again.");
      }
    });
  });

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <span className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-8 h-8 text-primary" />
        </span>
        <h2 className="text-2xl font-semibold">Booking confirmed!</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your booking has been placed successfully. Check your email for
          payment instructions.
        </p>
        <Button onClick={() => router.push("/room")}>Browse more rooms</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold">Review your cart</h2>
        <p className="text-sm text-muted-foreground">
          Confirm guest details for each room before paying.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field, idx) => {
          const item = cartItems[idx];
          const guestErrors = form.formState.errors.guests?.[idx];
          return (
            <div key={field.id} className="border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{item.roomCategoryName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.hotelName}
                  </p>
                </div>
                {(item.checkInDate || item.checkOutDate) && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <CalendarDays className="w-3 h-3" />
                    {formatDate(item.checkInDate)} →{" "}
                    {formatDate(item.checkOutDate)}
                  </p>
                )}
              </div>

              <div className="border-t pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Guest name
                  </label>
                  <Input
                    placeholder="Full name"
                    {...form.register(`guests.${idx}.guestName`)}
                  />
                  {guestErrors?.guestName && (
                    <p className="text-xs text-destructive">
                      {guestErrors.guestName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Guest email
                  </label>
                  <Input
                    type="email"
                    placeholder="guest@example.com"
                    {...form.register(`guests.${idx}.guestEmail`)}
                  />
                  {guestErrors?.guestEmail && (
                    <p className="text-xs text-destructive">
                      {guestErrors.guestEmail.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Special requests{" "}
                    <span className="normal-case">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Any specific requests..."
                    rows={2}
                    {...form.register(`guests.${idx}.specialRequests`)}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {cartItems.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <ShoppingBag className="w-10 h-10" />
            <p className="text-sm">No items in cart</p>
          </div>
        )}

        {serverError && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isPending || cartItems.length === 0}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Confirm &amp; Pay
          </Button>
        </div>
      </form>
    </div>
  );
}
