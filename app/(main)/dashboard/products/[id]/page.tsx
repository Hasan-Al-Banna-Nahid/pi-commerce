"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/app/lib/axios";

// Define Zod schema
export const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  costPrice: z.coerce.number().min(0, "Cost price cannot be negative"),
  category: z.enum(
    [
      "laptop",
      "mobile",
      "tablet",
      "digital_device",
      "accessories",
      "automobile",
    ]
    // "Category is required"
  ),
});

type ProductFormData = z.infer<typeof ProductSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
  });

  // Fetch existing product details
  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        const product = data.product;
        reset({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          costPrice: product.costPrice,
          category: product.category, // Set category value
        });
        setExistingImages(product.images || []);
      } catch (error) {
        toast.error("Failed to load product");
        console.error(error);
      }
    }

    fetchProduct();
  }, [id, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setNewImages(files);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("stock", String(data.stock));
    formData.append("costPrice", String(data.costPrice));
    formData.append("category", data.category); // Append category to formData

    newImages.forEach((img) => {
      formData.append("images", img);
    });

    try {
      setLoading(true);
      const res = await api.put(`/api/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated!");
      //   router.push("/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Update Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Input */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Description Input */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Price, Stock, CostPrice Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input type="number" id="price" {...register("price")} />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input type="number" id="stock" {...register("stock")} />
                {errors.stock && (
                  <p className="text-red-500 text-sm">{errors.stock.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  type="number"
                  id="costPrice"
                  {...register("costPrice")}
                />
                {errors.costPrice && (
                  <p className="text-red-500 text-sm">
                    {errors.costPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <Label htmlFor="category">Category</Label>
              <select id="category" {...register("category")}>
                <option value="laptop">Laptop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
                <option value="digital_device">Digital Device</option>
                <option value="accessories">Accessories</option>
                <option value="automobile">Automobile</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="images">Upload New Images (Max 5)</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {newImages.map((file, index) => (
                  <Image
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                ))}
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <Label>Existing Images</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {existingImages.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt={`img-${index}`}
                      width={80}
                      height={80}
                      className="rounded-md"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
