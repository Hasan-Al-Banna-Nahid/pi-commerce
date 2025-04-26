"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/lib/axios";
import { useCart } from "@/app/providers/shopping-cart";
import { Navbar } from "../components/navbar/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define the Product interface to match database schema
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subCategory: string[];
  brand: string;
  discount: number;
  rating: number;
  reviews: any[];
}

// Define the API response type
interface ApiResponse {
  products: Product[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [showSubcategories, setShowSubcategories] = useState<boolean>(false);
  const [showBrands, setShowBrands] = useState<boolean>(false);

  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<ApiResponse>("/api/products");
        const fetchedProducts = res.data.products.map((product) => ({
          ...product,
          subCategory: Array.isArray(product.subCategory)
            ? product.subCategory
            : [product.subCategory].filter(Boolean),
        }));
        setProducts(fetchedProducts);

        const uniqueCategories: string[] = [
          "All",
          ...new Set(
            fetchedProducts.map((product: Product) => product.category)
          ),
        ];
        setCategories(uniqueCategories);

        setFilteredProducts(fetchedProducts);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeCategory === "All") {
      setSubCategories([]);
      setBrands([]);
      setShowSubcategories(false);
      setShowBrands(false);
    } else {
      const filteredByCategory = products.filter(
        (product) => product.category === activeCategory
      );
      const uniqueSubCategories = [
        ...new Set(
          filteredByCategory.flatMap((product) => product.subCategory)
        ),
      ];
      const uniqueBrands = [
        ...new Set(filteredByCategory.map((product) => product.brand)),
      ];
      setSubCategories(uniqueSubCategories);
      setBrands(uniqueBrands);
    }
  }, [activeCategory, products]);

  useEffect(() => {
    let filtered: Product[] = products;

    if (activeCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === activeCategory
      );
    }

    if (activeSubcategory) {
      filtered = filtered.filter((product) =>
        product.subCategory.includes(activeSubcategory)
      );
    }

    if (activeBrand) {
      filtered = filtered.filter((product) => product.brand === activeBrand);
    }

    setFilteredProducts(filtered);
  }, [activeCategory, activeSubcategory, activeBrand, products]);

  const handleCategoryClick = (category: string): void => {
    setActiveCategory(category);
    setActiveSubcategory(null);
    setActiveBrand(null);
    setShowSubcategories(false);
    setShowBrands(false);
  };

  const handleSubcategoryClick = (subcategory: string | null): void => {
    setActiveSubcategory(subcategory);
  };

  const handleBrandClick = (brand: string | null): void => {
    setActiveBrand(brand);
  };

  const toggleSubcategories = (): void => {
    setShowSubcategories((prev) => !prev);
  };

  const toggleBrands = (): void => {
    setShowBrands((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="relative py-16 px-4 sm:px-6 lg:px-8">
        {/* Category, Subcategory, and Brand Section */}
        <div className="max-w-7xl mx-auto mb-12">
          {/* Category Tabs and Toggle Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 bg-white rounded-lg shadow-lg p-4">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-blue-800 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </motion.button>
              ))}
            </div>
            {activeCategory !== "All" && (
              <div className="flex space-x-3">
                {subCategories.length > 0 && (
                  <motion.button
                    className="px-6 py-3 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300 shadow-sm"
                    onClick={toggleSubcategories}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={
                      showSubcategories
                        ? "Hide subcategories"
                        : "Show subcategories"
                    }
                    aria-controls="subcategories"
                    aria-expanded={showSubcategories}
                  >
                    {showSubcategories
                      ? "Hide Subcategories"
                      : "Show Subcategories"}
                  </motion.button>
                )}
                {brands.length > 0 && (
                  <motion.button
                    className="px-6 py-3 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300 shadow-sm"
                    onClick={toggleBrands}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={showBrands ? "Hide brands" : "Show brands"}
                    aria-controls="brands"
                    aria-expanded={showBrands}
                  >
                    {showBrands ? "Hide Brands" : "Show Brands"}
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Subcategory Tabs */}
          {activeCategory !== "All" &&
            showSubcategories &&
            subCategories.length > 0 && (
              <motion.div
                id="subcategories"
                className="mt-4 bg-white rounded-lg shadow-lg p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex space-x-2 overflow-x-auto">
                  <motion.button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeSubcategory === null
                        ? "bg-blue-800 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => handleSubcategoryClick(null)}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={activeSubcategory === null}
                  >
                    All Subcategories
                  </motion.button>
                  {subCategories.map((subcategory) => (
                    <motion.button
                      key={subcategory}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeSubcategory === subcategory
                          ? "bg-blue-800 text-white shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => handleSubcategoryClick(subcategory)}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      aria-pressed={activeSubcategory === subcategory}
                    >
                      {subcategory}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Brand Tabs */}
          {activeCategory !== "All" && showBrands && brands.length > 0 && (
            <motion.div
              id="brands"
              className="mt-4 bg-white rounded-lg shadow-lg p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex space-x-2 overflow-x-auto">
                <motion.button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeBrand === null
                      ? "bg-blue-800 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => handleBrandClick(null)}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={activeBrand === null}
                >
                  All Brands
                </motion.button>
                {brands.map((brand) => (
                  <motion.button
                    key={brand}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeBrand === brand
                        ? "bg-blue-800 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => handleBrandClick(brand)}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={activeBrand === brand}
                  >
                    {brand}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-12">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              No products found for the selected filters.
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    {/* Product Image */}
                    <div className="relative group bg-transparent">
                      <Image
                        src={
                          product.images?.[0] || "/default-product-image.jpg"
                        }
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-56 object-cover bg-transparent transition-transform duration-500 group-hover:scale-110"
                      />
                      {idx % 5 === 0 && (
                        <div className="absolute top-3 left-3 bg-red-600 text-xs font-bold text-white px-3 py-1 rounded-full shadow-md">
                          Deal of the Day
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-bold text-gray-900 px-3 py-1 rounded-full shadow-md">
                        Best Seller
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-5 flex flex-col space-y-4">
                      <h2 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors duration-200">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-xl font-bold text-gray-900">
                              BDT{" "}
                              {(product.price - product.discount).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              BDT {product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-red-600 font-semibold">
                              {(
                                (product.discount / product.price) *
                                100
                              ).toFixed(0)}
                              % off
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">
                            BDT {product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(product.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.175 0l-3.39 2.46c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.81 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({product.reviews.length})
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/products/${product._id}`)}
                        className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg hover:bg-blue-900 transition-all duration-300 shadow-md hover:shadow-xl"
                        aria-label={`View details for ${product.name}`}
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
