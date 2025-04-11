"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { Product } from "@/app/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/app/lib/utils";
import { ReviewCard } from "@/app/components/products/review-card";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/products/${params.id}`);
        setProduct(res.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProduct();
    }
  }, [isAuthenticated, params.id]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading product details...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Details</h1>
        <div className="flex gap-2">
          {(role === "vendor" || role === "admin") && (
            <Button onClick={() => router.push(`/products/${params.id}/edit`)}>
              Edit Product
            </Button>
          )}
          <Button onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={product.images[0]} />
                <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <Badge variant={product.isActive ? "default" : "destructive"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-medium">{product.brand || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">{formatCurrency(product.price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="font-medium">{product.quantity}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{product.description}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {product?.images.map((image, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden rounded"
              >
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({product.reviews.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.reviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            product.reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
