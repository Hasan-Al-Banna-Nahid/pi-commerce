"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers/shopping-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/app/lib/utils";
import api from "@/app/lib/axios";
import { Product } from "@/app/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Truck, Shield, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "./navbar/Navbar";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

    const fetchRelatedProducts = async () => {
      if (product) {
        try {
          const priceRange = 0.2; // ±20% price range
          const minPrice = product.price * (1 - priceRange);
          const maxPrice = product.price * (1 + priceRange);
          const res = await api.get(`/api/products`);
          // Filter out the current product
          const filteredProducts = res.data.products.filter(
            (p: Product) => p._id !== id
          );
          setRelatedProducts(filteredProducts.slice(0, 4)); // Ensure max 4 products
        } catch (error) {
          console.error("Failed to fetch related products:", error);
        } finally {
          setRelatedLoading(false);
        }
      }
    };

    fetchProduct();
    if (product) {
      fetchRelatedProducts();
    }
  }, [id, product]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-[500px] w-full rounded-lg mb-4" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-8" />
            <Skeleton className="h-10 w-32 mb-6" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4 text-center">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Product not found
          </h1>
          <Button onClick={() => router.back()} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to products
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (productToAdd: Product, qty: number = quantity) => {
    addToCart({
      id: productToAdd._id,
      name: productToAdd.name,
      price: productToAdd.price,
      quantity: qty,
      image: productToAdd.images[0],
    });
    setSelectedProduct(productToAdd);
    setIsModalOpen(true);
  };

  const discountedPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  return (
    <div>
      <Navbar />
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 gap-2 text-gray-600 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to products
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="relative h-96 w-full mb-4 rounded-lg overflow-hidden">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">
                      {product.rating || 4.8}
                    </span>
                    <span className="mx-1 text-gray-400">|</span>
                    <span className="text-sm text-gray-500">1,234 reviews</span>
                  </div>
                  {product.discount > 0 && (
                    <Badge className="bg-red-500 hover:bg-red-600">
                      {product.discount}% OFF
                    </Badge>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(discountedPrice)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="ml-2 text-sm text-green-600">
                        You save{" "}
                        {formatCurrency(product.price - discountedPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Free delivery on orders over ৳2000
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">
                      1-year warranty included
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">
                    Quantity
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 flex-1 py-6 text-lg shadow-lg"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 py-6 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Buy Now
                  </Button>
                </div>
              </motion.div>

              {/* Product Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-lg font-bold mb-4">Product Details</h2>
                <div className="prose prose-sm text-gray-700">
                  {product.description.split("\n").map((paragraph, i) => (
                    <p key={i} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Display</p>
                      <p className="font-medium">
                        {product.specifications?.display || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Processor</p>
                      <p className="font-medium">
                        {product.specifications?.processor || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">RAM</p>
                      <p className="font-medium">
                        {product.specifications?.ram || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Storage</p>
                      <p className="font-medium">
                        {product.specifications?.storage || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Camera</p>
                      <p className="font-medium">
                        {product.specifications?.camera || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Battery</p>
                      <p className="font-medium">
                        {product.specifications?.battery || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Brand</p>
                      <p className="font-medium">
                        {product.brand || "Generic"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">{product.category || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock</p>
                      <p className="font-medium">
                        {product.stock || "In Stock"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">SKU</p>
                      <p className="font-medium">{product.sku || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related Products Section */}
          {/* <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedLoading
                ? [1, 2, 3, 4].map((i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Skeleton className="h-40 w-full mb-3" />
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))
                : relatedProducts.map((related) => (
                    <Card
                      key={related._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="relative h-40 w-full mb-3">
                          <Image
                            src={related.images[0] || "/placeholder.jpg"}
                            alt={related.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <h3 className="text-sm font-medium line-clamp-2 mb-2">
                          {related.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-bold text-gray-900">
                            {formatCurrency(
                              related.discount > 0
                                ? related.price * (1 - related.discount / 100)
                                : related.price
                            )}
                          </span>
                          {related.discount > 0 && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatCurrency(related.price)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {related.rating || 4.8}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({Math.floor(Math.random() * 1000) + 100} reviews)
                          </span>
                        </div>
                        <Button
                          onClick={() => handleAddToCart(related, 1)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div> */}
        </div>

        {/* Modal */}
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Added to Cart
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </Dialog.Close>
              </div>

              {selectedProduct && (
                <div className="flex items-center space-x-4 mb-6">
                  <Image
                    src={selectedProduct.images?.[0] || "/placeholder.jpg"}
                    alt={selectedProduct.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(
                        selectedProduct.discount > 0
                          ? selectedProduct.price *
                              (1 - selectedProduct.discount / 100)
                          : selectedProduct.price
                      )}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 mb-6">
                The item has been successfully added to your cart.
              </p>

              <div className="flex justify-between space-x-4">
                <Dialog.Close asChild>
                  <button className="flex-1 bg-gray-200 text-gray-900 font-semibold py-2 rounded-md hover:bg-gray-300 transition">
                    Continue Shopping
                  </button>
                </Dialog.Close>
                <button
                  onClick={() => router.push("/checkout")}
                  className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Checkout
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
