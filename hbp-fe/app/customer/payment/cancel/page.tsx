import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CancelPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center space-y-5 max-w-sm">
        <span className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </span>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Payment cancelled</h1>
          <p className="text-sm text-muted-foreground">
            Your payment was not completed. No charges have been made. You can
            go back and try again.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/room">Browse rooms</Link>
          </Button>
          <Button asChild>
            <Link href="/customer">Try again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
