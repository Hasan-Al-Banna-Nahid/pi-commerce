"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Category } from "@/app/types/product";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // import carousel styles

const categories: Category[] = [
  {
    id: "Laptop",
    name: "Laptops",
    image: "/images/mac.jpg",
    count: 42,
  },
  {
    id: "Mobile",
    name: "Mobiles",
    image: "/images/phone.jpg",
    count: 28,
  },
  {
    id: "Tablet",
    name: "Tablets",
    image: "/images/ipad.jpeg",
    count: 35,
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "/images/airpod.webp",
    count: 19,
  },
];

export function CategorySection() {
  const router = useRouter();

  return (
    <section className="py-16 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-white mb-4">
          Shop by Category
        </h2>
        <p className="text-lg text-white opacity-80">
          Explore our wide range of products across various categories.
        </p>
      </div>

      {/* Logo Carousel */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="relative overflow-hidden rounded-xl shadow-lg group transition-all transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-t from-purple-600 to-pink-600"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white text-center px-4">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{category.count} products</p>
              </CardContent>
              <Button
                onClick={() => router.push(`/products?category=${category.id}`)}
                variant="outline"
                className="mt-4 text-slate-800 border-white hover:bg-white hover:text-primary transition-colors"
              >
                Shop Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
