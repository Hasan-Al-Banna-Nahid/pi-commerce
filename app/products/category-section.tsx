"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Category } from "@/app/types/product";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function CategorySection() {
  const router = useRouter();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated collections tailored to your needs
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Card className="relative group h-full overflow-hidden rounded-xl border border-gray-200/50 bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-end z-20 text-white p-6">
                  <CardHeader className="p-0 w-full">
                    <CardTitle className="text-2xl font-bold text-left">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 w-full mt-1">
                    <p className="text-gray-300 text-sm">
                      {category.count} premium products
                    </p>
                  </CardContent>
                  <Button
                    onClick={() =>
                      router.push(`/products?category=${category.id}`)
                    }
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full justify-between px-0 group-hover:text-white text-gray-300 hover:bg-transparent hover:underline"
                  >
                    Explore collection
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
