"use client";

import { Product } from "@/app/types/product";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";

interface ProductItemProps {
  product: Product;
  onDelete: (id: string) => Promise<void>;
}

export default function ProductItem({ product, onDelete }: ProductItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(product._id);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow key={product._id}>
      <TableCell>
        <div className="flex items-center gap-4">
          {product.images.length > 0 && (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={50}
              height={50}
              className="rounded-md object-cover"
            />
          )}
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-500">
              {product.description.substring(0, 50)}...
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>${product.price.toFixed(2)}</TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product._id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
