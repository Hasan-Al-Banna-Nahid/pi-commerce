"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/axios";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  category: string;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  category: string;
  stock: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchProducts = async (page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      const response = await api.get("/api/products", {
        params: { page, limit, ...filters },
      });
      setProducts(response.data.products);
      setPagination({
        page: response.data.pagination?.page || page,
        limit: response.data.pagination?.limit || limit,
        total: response.data.pagination?.total || response.data.products.length,
        pages: Math.ceil(
          (response.data.pagination?.total || response.data.products.length) /
            (response.data.pagination?.limit || limit)
        ),
      });
    } catch (err) {
      setError(
        (err as any).response?.data?.message || "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };
  const createProduct = async (formData: FormData) => {
    try {
      setLoading(true);
      const response = await api.post("/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.product;
    } catch (err) {
      const error = err as any;
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Failed to create product";
      throw new Error(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage)
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    productData: Partial<ProductFormData>,
    images: File[] = []
  ) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Append product data
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Append images
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await api.put(`/api/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.product;
    } catch (err) {
      throw (err as any).response?.data?.message || "Failed to update product";
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/api/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      throw (err as any).response?.data?.message || "Failed to delete product";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
