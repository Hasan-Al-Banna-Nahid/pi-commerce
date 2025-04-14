"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers/shopping-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/app/lib/utils";
import api from "@/app/lib/axios";
import { Product } from "@/app/types/product";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
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
      <div className="max-w-2xl mx-auto py-16">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-6 w-48 mt-4" />
        <Skeleton className="h-4 w-32 mt-2" />
        <Skeleton className="h-12 w-32 mt-4" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
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
              className="w-full h-72 object-cover"
            />
          </div>
          <p className="text-lg">{formatCurrency(product.price)}</p>
          {product.discount > 0 && (
            <p className="text-sm text-red-500">{product.discount}% OFF</p>
          )}
          <p className="mt-4">{product.description}</p>
        </CardContent>
        <Button className="mt-4" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </Card>
    </div>
  );
}
