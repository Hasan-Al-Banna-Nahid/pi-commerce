"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { Product } from "@/app/types/product";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/app/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/products?featured=true&limit=4");
        setProducts(res.data.products);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">
        Featured Products
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <h3 className="font-semibold">{product.name}</h3>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{formatCurrency(product.price)}</p>
                  {product.discount > 0 && (
                    <Badge variant="secondary">{product.discount}% OFF</Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => router.push(`/products/${product._id}`)}
                >
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
