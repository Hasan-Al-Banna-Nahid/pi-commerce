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

function isAxiosError(error: unknown): error is { response?: { data?: any } } {
  return typeof error === "object" && error !== null && "response" in error;
}

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
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch products");
      } else {
        setError("Failed to fetch products");
      }
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
    } catch (err: unknown) {
      let errorMessage = "Failed to create product";
      if (isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message ||
          JSON.stringify(err.response?.data?.errors || errorMessage);
      }
      throw new Error(errorMessage);
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

      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await api.put(`/api/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.product;
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        throw new Error(
          err.response?.data?.message || "Failed to update product"
        );
      }
      throw new Error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        throw new Error(
          err.response?.data?.message || "Failed to delete product"
        );
      }
      throw new Error("Failed to delete product");
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
