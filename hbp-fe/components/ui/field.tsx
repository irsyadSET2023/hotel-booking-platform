import * as React from "react";
import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <div
      data-slot="field"
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "flex-row items-center gap-2"
          : "flex-col gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-data-[invalid=true]/field:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

interface FieldErrorProps extends React.ComponentProps<"p"> {
  errors?: ({ message?: string } | null | undefined)[];
}

function FieldError({
  className,
  errors,
  children,
  ...props
}: FieldErrorProps) {
  const message =
    errors?.find((e) => e?.message)?.message ?? (children as string);
  if (!message) return null;
  return (
    <p
      data-slot="field-error"
      className={cn("text-xs text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError };
