import { Check, Mail, CreditCard, ShoppingBag } from "lucide-react";

const STEPS = [
  { id: 1, label: "Verify Email", icon: Mail },
  { id: 2, label: "Billing", icon: CreditCard },
  { id: 3, label: "Review & Pay", icon: ShoppingBag },
];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center w-full mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = currentStep > step.id;
        const active = currentStep === step.id;
        return (
          <li
            key={step.id}
            className={`flex items-center ${idx < STEPS.length - 1 ? "flex-1" : ""}`}
          >
            <div className="flex flex-col items-center gap-1">
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {done ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </span>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  active
                    ? "text-primary"
                    : done
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-5 mx-2 transition-colors ${
                  done ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
