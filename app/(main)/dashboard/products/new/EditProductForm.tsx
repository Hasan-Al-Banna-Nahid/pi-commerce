"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProducts } from "@/app/hooks/useProduct";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ProductImagesUpload from "./ProductImagesUpload";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import { Product } from "@/app/types/product";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
});

export default function EditProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { updateProduct } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data.product);
        setExistingImages(response.data.product.images);
        form.reset({
          name: response.data.product.name,
          description: response.data.product.description,
          price: response.data.product.price,
          category: response.data.product.category,
          stock: response.data.product.stock,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, form]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      setUploading(true);
      await updateProduct(productId, values, images);
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Form fields same as CreateProductForm */}

          <ProductImagesUpload
            images={images}
            setImages={setImages}
            existingImages={existingImages}
            onRemoveExisting={removeExistingImage}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
