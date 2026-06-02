"use server";

import { parseResponse, requestApi } from "@/lib/utils";
import { RequestMethod } from "../enums";
import type { CheckoutCartData } from "../customer/(schema)/customer-checkout-cart-schema";

/* ---------- check email ---------- */

type BillingAddress = {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string | null;
  countryUuid: string;
  cityUuid: string;
  postalCode: string;
  phoneCountryCodeUuid: string;
  phoneNumber: string;
};

export async function checkCustomerEmail(email: string): Promise<{
  success: boolean;
  isVerified: boolean;
  message: string;
  billingAddress: BillingAddress | null;
}> {
  const response = await requestApi({
    path: `/customers/check-email`,
    method: RequestMethod.POST,
    data: { email },
  });

  if (!response.success) {
    return {
      success: false,
      isVerified: false,
      message: response.message,
      billingAddress: null,
    };
  }

  const data = response.data as {
    isVerified: boolean;
    billingAddress: BillingAddress | null;
  };
  return {
    success: true,
    isVerified: data.isVerified,
    billingAddress: data.billingAddress ?? null,
    message: response.message,
  };
}

/* ---------- send OTP ---------- */

export async function sendOtp(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const response = await requestApi({
    path: `/customers/otp/send`,
    method: RequestMethod.POST,
    data: { email },
  });

  return { success: response.success, message: response.message };
}

/* ---------- verify OTP ---------- */

export async function verifyOtp(
  email: string,
  code: string,
): Promise<{ success: boolean; message: string }> {
  const response = await requestApi({
    path: `/customers/otp/verify`,
    method: RequestMethod.POST,
    data: { email, code },
  });

  return { success: response.success, message: response.message };
}

/* ---------- checkout cart ---------- */

export async function checkoutCart(
  payload: CheckoutCartData,
): Promise<{ success: boolean; message: string; data?: { url: string } }> {
  const response = await requestApi({
    path: `/customers/checkout/cart`,
    method: RequestMethod.POST,
    data: payload,
  });

  return {
    success: response.success,
    message: response.message,
    data: response.data,
  };
}
