"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Check, Shield, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryText?: string;
  secondaryLink?: string;
  showSearch?: boolean;
  showTrustBadges?: boolean;
}

export function Hero({
  title,
  description,
  ctaText,
  ctaLink,
  secondaryText,
  secondaryLink,
  showTrustBadges = true,
}: HeroProps) {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-r   from-indigo-800 via-blue-600 to-slate-600 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            {description}
          </p>

          {/* Search Bar (Amazon-style) */}

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button
              onClick={() => router.push(ctaLink)}
              className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            >
              {ctaText}
            </Button>
            {secondaryText && secondaryLink && (
              <Button
                onClick={() => router.push(secondaryLink)}
                variant="outline"
                className="px-8 py-4 text-lg border-white text-blue-500 hover:bg-white/10 hover:text-white"
              >
                {secondaryText}
              </Button>
            )}
          </div>
        </div>

        {/* Trust Badges (Amazon-style) */}
        {showTrustBadges && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="bg-red-500 p-3 rounded-full mb-3">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Free Shipping</h3>
              <p className="text-blue-100">On orders over $50</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="bg-yellow-500 p-3 rounded-full mb-3">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-1">30-Day Returns</h3>
              <p className="text-blue-100">No hassle return policy</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="bg-slate-500 p-3 rounded-full mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Secure Payment</h3>
              <p className="text-blue-100">100% protected transactions</p>
            </div>
          </div>
        )}

        {/* Trending Categories (Optional) */}
        <div className="mt-12 hidden lg:block">
          <h3 className="text-center text-lg font-medium mb-4 text-blue-200">
            Popular Categories
          </h3>
          <div className="flex justify-center gap-4">
            {["Electronics", "Fashion", "Home & Kitchen", "Books", "Toys"].map(
              (category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="px-4 py-2 text-white border-white hover:bg-white/20 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/categories/${category
                        .toLowerCase()
                        .replace(" & ", "-")}`
                    )
                  }
                >
                  {category}
                </Badge>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
