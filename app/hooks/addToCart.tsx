// hooks/use-add-to-cart.ts
"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers/shopping-cart";

type AddToCartParams = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
};

export function useAddToCart() {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return ({ id, name, price, image, quantity = 1 }: AddToCartParams) => {
    if (!isAuthenticated) {
      toast.error("Authentication Required", {
        description: "Please sign in to add items to your cart",
        action: {
          label: "Sign In",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    addToCart({ id, name, price, image, quantity });
    toast.success("Added to cart", {
      description: `${name} (${quantity}x) has been added to your cart`,
    });
  };
}
