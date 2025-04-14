"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers/shopping-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/app/lib/utils";
import api from "@/app/lib/axios";
import { Product } from "@/app/types/product";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <Skeleton className="h-72 w-full mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-12 w-40" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center text-red-500">
        Product not found
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    });
    router.push("/checkout");
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-72 object-cover rounded-lg"
            />
          </div>
          <p className="text-lg font-semibold">
            {formatCurrency(product.price)}
          </p>
          {product.discount > 0 && (
            <p className="text-sm text-red-500">{product.discount}% OFF</p>
          )}
          <p className="mt-4 text-muted-foreground">{product.description}</p>
        </CardContent>
        <Button className="m-4" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </Card>
    </div>
  );
}
