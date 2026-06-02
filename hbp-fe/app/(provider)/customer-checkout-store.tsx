import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BillingValues } from "@/app/customer/(components)/step-billing";

interface CheckoutState {
  email: string;
  billing: BillingValues | null;
  setEmail: (email: string) => void;
  setBilling: (billing: BillingValues) => void;
  clearCheckout: () => void;
}

const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      email: "",
      billing: null,
      setEmail: (email) => set({ email }),
      setBilling: (billing) => set({ billing }),
      clearCheckout: () => set({ email: "", billing: null }),
    }),
    { name: "hbp-checkout" },
  ),
);

export default useCheckoutStore;
