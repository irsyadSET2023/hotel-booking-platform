import { Suspense } from "react";
import { CheckoutStepper } from "./(components)/checkout-stepper";

export default function CustomerPage() {
  return (
    <Suspense>
      <CheckoutStepper />
    </Suspense>
  );
}
