"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/app/lib/axios";
import { useCart } from "@/app/providers/shopping-cart"; // adjust the path if needed
import { Navbar } from "../components/navbar/Navbar";
import Image from "next/image";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  console.log(products);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-100 relative overflow-hidden">
        {/* Background Image Pattern */}
        <div className="absolute inset-0 bg-[url('/images/pattern.jpg')] opacity-10 z-0" />

        <div className="relative z-10 px-4 py-12 max-w-7xl mx-auto">
          <motion.h1
            className="text-5xl font-bold text-gray-800 mb-10 text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Explore Our Products
          </motion.h1>

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product, idx) => (
                <motion.div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Image
                    src={product.images?.[0]}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-4 flex flex-col justify-between h-[200px]">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-purple-600">
                        ${product.price}
                      </span>
                      <button
                        onClick={() =>
                          addToCart({
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.images?.[0],
                          })
                        }
                        className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full hover:bg-purple-600 transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
