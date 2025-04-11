"use client";

import { useState } from "react";
import { useProducts } from "@/app/hooks/useProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import ProductItem from "./ProductItem";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function ProductList() {
  const { products, loading, error, pagination, fetchProducts, deleteProduct } =
    useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, pagination.limit, { name: searchTerm });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, pagination.limit, { name: searchTerm });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {loading && !products.length ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            {/* <TableBody>
              {products.map((product) => (
                <ProductItem
                  key={product._id}
                  // product={product}
                  onDelete={deleteProduct}
                />
              ))}
            </TableBody> */}
          </Table>

          {pagination.pages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    isActive={currentPage !== 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4">
                    Page {currentPage} of {pagination.pages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    isActive={currentPage !== pagination.pages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
