"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/axios";
import axios from "axios";

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

type FetchFilters = Record<string, string | number | boolean | undefined>;

type ProductResponse = {
  product: Product;
};

type ProductListResponse = {
  products: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
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

  const fetchProducts = async (
    page: number = 1,
    limit: number = 10,
    filters: FetchFilters = {}
  ) => {
    try {
      setLoading(true);
      const response = await api.get<ProductListResponse>("/api/products", {
        params: { page, limit, ...filters },
      });

      const { products, pagination: resPagination } = response.data;

      const total = resPagination?.total ?? products.length;
      const resLimit = resPagination?.limit ?? limit;

      setProducts(products);
      setPagination({
        page: resPagination?.page ?? page,
        limit: resLimit,
        total,
        pages: Math.ceil(total / resLimit),
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch products");
      } else {
        setError("Failed to fetch products");
      }
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (formData: FormData): Promise<Product> => {
    try {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 seconds timeout
      const response = await api.post<ProductResponse>(
        "/api/products",
        formData
        // {
        //   headers: { "Content-Type": "multipart/form-data" },
        // }
      );
      return response.data.product;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          JSON.stringify(
            err.response?.data?.errors || "Failed to create product"
          );
        throw new Error(msg);
      }
      throw new Error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    productData: Partial<ProductFormData>,
    images: File[] = []
  ): Promise<Product> => {
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

      const response = await api.put<ProductResponse>(
        `/api/products/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data.product;
    } catch (err) {
      if (axios.isAxiosError(err)) {
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
    } catch (err) {
      if (axios.isAxiosError(err)) {
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
