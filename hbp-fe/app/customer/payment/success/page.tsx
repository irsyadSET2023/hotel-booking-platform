import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center space-y-5 max-w-sm">
        <span className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Payment successful!</h1>
          <p className="text-sm text-muted-foreground">
            Your booking has been confirmed. A confirmation will be sent to your
            email shortly.
          </p>
        </div>
        <Button asChild>
          <Link href="/room">Browse more rooms</Link>
        </Button>
      </div>
    </div>
  );
}
