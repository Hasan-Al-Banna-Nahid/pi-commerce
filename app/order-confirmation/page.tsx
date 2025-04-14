// app/orders-confirmation/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OrderConfirmation() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Thank you for your purchase. Your order has been received and is being
        processed.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <Link href="/order">View Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
