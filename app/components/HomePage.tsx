"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "@/app/hooks/useProduct"; // Adjust the import path as needed
import { useRouter } from "next/navigation";

const AmazonStyleHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  // Use the useProducts hook to fetch products
  const { products, loading, error, fetchProducts } = useProducts();

  // Derive hero images from the first 3 products
  const heroImages = products.slice(0, 3).map((product, index) => ({
    id: product._id,
    src: product.images[0] || "/images/placeholder.jpg",
    alt: product.name,
  }));

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      mobile: "",
      tablet: "",
    };
    return iconMap[category] || "🛒"; // Fallback icon
  };

  // Derive categories dynamically from product.category
  const categories = Object.entries(
    products.reduce((acc, product) => {
      if (product.category) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count], index) => ({
    id: index + 1,
    name,
    icon: getCategoryIcon(name),
    count,
  }));

  // Auto-rotate hero images
  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  // Transform products into deals format
  const deals = products.slice(0, 4).map((product) => ({
    id: product._id,
    name: product.name,
    price: `Tk${product.price.toFixed(2)}`,
    originalPrice: product.costPrice
      ? `Tk${product.costPrice.toFixed(2)}`
      : undefined,
    discount: product.costPrice
      ? `${Math.round(
          ((product.costPrice - product.price) / product.costPrice) * 100
        )}% off`
      : undefined,
    image: product.images[0] || "/images/placeholder.jpg",
  }));

  // Recommended products
  const recommended = products.map((product) => ({
    id: product._id,
    name: product.name,
    price: `Tk${product.price.toFixed(2)}`,
    originalPrice: product.costPrice
      ? `Tk${product.costPrice.toFixed(2)}`
      : undefined,
    image: product.images[0] || "/images/placeholder.jpg",
  }));

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-96 w-full overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroImages.map((image, index) => (
            <div
              key={image.id}
              className="w-full flex-shrink-0 relative h-[500px]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center px-16">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white max-w-md"
                >
                  <h1 className="text-4xl font-bold mb-4">
                    Summer Sale is Live!
                  </h1>
                  <p className="text-lg mb-6">
                    Up to 50% off on selected items. Limited time offer.
                  </p>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg">
                    Shop Now
                  </Button>
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + heroImages.length) % heroImages.length
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % heroImages.length)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-2 rounded-full ${
                currentSlide === index ? "bg-amber-500 w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Today's Deals */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Today's Deals</h2>
            <Button
              variant="link"
              className="text-amber-600 hover:text-amber-700"
            >
              See all deals
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md bg-white"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    className="object-contain p-4"
                  />
                  {deal.discount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {deal.discount}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1 line-clamp-2">{deal.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-600">
                      {deal.price}
                    </span>
                    {deal.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {deal.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/products/${deal.id}`)} // Dynamic routing
                    className="w-full mt-3 bg-slate-800 hover:bg-amber-700 text-white"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {isHovered ? "View Details" : "Buy Now"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended For You */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 scrollbar-hide space-x-4">
            {recommended.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-56 bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative h-40 bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-amber-600">
                      {item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        {item.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? "text-amber-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">(124)</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/products/${item.id}`)} // Dynamic routing
                    className="w-full mt-3 bg-slate-800 hover:bg-amber-700 text-white"
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazonStyleHomepage;
