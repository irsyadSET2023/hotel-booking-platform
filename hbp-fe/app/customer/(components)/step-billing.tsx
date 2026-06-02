"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { SearchableSelect } from "./searchable-select";
import { getCountries, getCities } from "@/app/(services)/reference-service";
import type { Country, City } from "@/app/interfaces";

export const billingSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  addressLine1: z.string().min(1, "Required"),
  addressLine2: z.string().optional(),
  countryUuid: z.string().min(1, "Required"),
  cityUuid: z.string().min(1, "Required"),
  postalCode: z.string().min(1, "Required"),
  phoneCountryCodeUuid: z.string().min(1, "Required"),
  phoneNumber: z.string().min(7, "Min 7 digits").max(15, "Max 15 digits"),
});

export type BillingValues = z.infer<typeof billingSchema>;

interface StepBillingProps {
  defaultValues?: Partial<BillingValues>;
  onNext: (values: BillingValues) => void;
  onBack: () => void;
}

export function StepBilling({
  defaultValues,
  onNext,
  onBack,
}: StepBillingProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  const form = useForm<BillingValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: defaultValues ?? {},
  });

  const selectedCountryUuid = form.watch("countryUuid");

  useEffect(() => {
    getCountries().then((data) => {
      setCountries(data);
      setLoadingCountries(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedCountryUuid) {
      setCities([]);
      form.setValue("cityUuid", "");
      return;
    }
    setLoadingCities(true);
    getCities(selectedCountryUuid).then((data) => {
      setCities(data);
      setLoadingCities(false);
    });
  }, [selectedCountryUuid]);

  const handleSubmit = form.handleSubmit((values) => onNext(values));
  const err = form.formState.errors;
  const errMsg = (name: keyof BillingValues) =>
    err[name]?.message ? (
      <p className="text-xs text-destructive mt-0.5">{err[name]!.message}</p>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold">Billing details</h2>
        <p className="text-sm text-muted-foreground">
          These details will be used for your booking invoice.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">First name</label>
            <Input placeholder="John" {...form.register("firstName")} />
            {errMsg("firstName")}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Last name</label>
            <Input placeholder="Doe" {...form.register("lastName")} />
            {errMsg("lastName")}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Address line 1</label>
          <Input placeholder="123 Main St" {...form.register("addressLine1")} />
          {errMsg("addressLine1")}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Address line 2{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input placeholder="Suite 4B" {...form.register("addressLine2")} />
        </div>

        {/* Country + City */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Country</label>
            {loadingCountries ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading…
              </div>
            ) : (
              <SearchableSelect
                value={form.watch("countryUuid") ?? ""}
                placeholder="Select country"
                items={countries}
                onValueChange={(v) =>
                  form.setValue("countryUuid", v, { shouldValidate: true })
                }
              />
            )}
            {errMsg("countryUuid")}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">City</label>
            {loadingCities ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading…
              </div>
            ) : (
              <SearchableSelect
                value={form.watch("cityUuid") ?? ""}
                placeholder="Select city"
                items={cities}
                disabled={!selectedCountryUuid}
                onValueChange={(v) =>
                  form.setValue("cityUuid", v, { shouldValidate: true })
                }
              />
            )}
            {errMsg("cityUuid")}
          </div>
        </div>

        {/* Postal code */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Postal code</label>
          <Input placeholder="10001" {...form.register("postalCode")} />
          {errMsg("postalCode")}
        </div>

        {/* Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone country</label>
            {loadingCountries ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading…
              </div>
            ) : (
              <SearchableSelect
                value={form.watch("phoneCountryCodeUuid") ?? ""}
                placeholder="Select country"
                items={countries}
                onValueChange={(v) =>
                  form.setValue("phoneCountryCodeUuid", v, {
                    shouldValidate: true,
                  })
                }
              />
            )}
            {errMsg("phoneCountryCodeUuid")}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone number</label>
            <Input placeholder="123456789" {...form.register("phoneNumber")} />
            {errMsg("phoneNumber")}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>
    </div>
  );
}
