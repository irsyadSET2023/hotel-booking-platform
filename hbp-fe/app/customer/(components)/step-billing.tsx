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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

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
        <FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!err.firstName}>
              <FieldLabel>First name</FieldLabel>
              <Input
                placeholder="John"
                aria-invalid={!!err.firstName}
                {...form.register("firstName")}
              />
              <FieldError errors={[err.firstName]} />
            </Field>
            <Field data-invalid={!!err.lastName}>
              <FieldLabel>Last name</FieldLabel>
              <Input
                placeholder="Doe"
                aria-invalid={!!err.lastName}
                {...form.register("lastName")}
              />
              <FieldError errors={[err.lastName]} />
            </Field>
          </div>

          {/* Address */}
          <Field data-invalid={!!err.addressLine1}>
            <FieldLabel>Address line 1</FieldLabel>
            <Input
              placeholder="123 Main St"
              aria-invalid={!!err.addressLine1}
              {...form.register("addressLine1")}
            />
            <FieldError errors={[err.addressLine1]} />
          </Field>

          <Field>
            <FieldLabel>
              Address line 2{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </FieldLabel>
            <Input placeholder="Suite 4B" {...form.register("addressLine2")} />
          </Field>

          {/* Country + City */}
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!err.countryUuid}>
              <FieldLabel>Country</FieldLabel>
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
              <FieldError errors={[err.countryUuid]} />
            </Field>

            <Field data-invalid={!!err.cityUuid}>
              <FieldLabel>City</FieldLabel>
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
              <FieldError errors={[err.cityUuid]} />
            </Field>
          </div>

          {/* Postal code */}
          <Field data-invalid={!!err.postalCode}>
            <FieldLabel>Postal code</FieldLabel>
            <Input
              placeholder="10001"
              aria-invalid={!!err.postalCode}
              {...form.register("postalCode")}
            />
            <FieldError errors={[err.postalCode]} />
          </Field>

          {/* Phone */}
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!err.phoneCountryCodeUuid}>
              <FieldLabel>Phone country</FieldLabel>
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
              <FieldError errors={[err.phoneCountryCodeUuid]} />
            </Field>

            <Field data-invalid={!!err.phoneNumber}>
              <FieldLabel>Phone number</FieldLabel>
              <Input
                placeholder="123456789"
                aria-invalid={!!err.phoneNumber}
                {...form.register("phoneNumber")}
              />
              <FieldError errors={[err.phoneNumber]} />
            </Field>
          </div>
        </FieldGroup>

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
