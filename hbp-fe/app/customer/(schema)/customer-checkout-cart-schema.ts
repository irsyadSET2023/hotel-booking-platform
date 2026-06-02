import { z } from "zod";

export const CartItemsSchema = z.array(
  z.object({
    roomCategoryUuid: z.string(),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    specialRequests: z.string().optional(),
    guestName: z.string(),
    guestEmail: z.email(),
  }),
);

export const BillingDetailsSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  cityUuid: z.string(),
  countryUuid: z.string(),
  postalCode: z.string(),
  phoneCountryCodeUuid: z.string(),
  phoneNumber: z.string().min(7).max(15),
});

export const CheckoutCartSchema = z.object({
  email: z.string().email(),
  billingDetails: BillingDetailsSchema,
  cartItems: CartItemsSchema,
  currency: z.string().optional(),
});

export type CheckoutCartData = z.infer<typeof CheckoutCartSchema>;
