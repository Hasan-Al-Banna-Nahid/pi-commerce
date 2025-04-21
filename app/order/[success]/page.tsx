"use client";

import { Navbar } from "@/app/components/navbar/Navbar";
import { useCart } from "@/app/providers/shopping-cart";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrderSuccessPage({
  params,
}: {
  params: { success: string };
}) {
  const [hasShownToast, setHasShownToast] = useState(false);
  const { clearCart } = useCart();
  useEffect(() => {
    if (!hasShownToast) {
      clearCart();
      toast.success("Order placed successfully!");
      setHasShownToast(true);
    }
  }, [hasShownToast]);

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">
          Order #{params.success} Confirmed!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="gap-2">
            <Link href="/order">
              <ShoppingBag className="h-4 w-4" />
              View Orders
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
