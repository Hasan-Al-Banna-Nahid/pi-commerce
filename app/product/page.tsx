import { ProductGrid } from "@/app/components/products/product-grid";
import { Hero } from "@/app/components/hero";
import { CategorySection } from "@/app/components/products/category-section";
import { FeaturedProducts } from "@/app/components/products/featured-products";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-8">
      <Hero
        title="Digital Devices & Automobiles"
        description="High-quality digital Devices equipment and supplies for your business"
        ctaText="Shop Now"
        ctaLink="/products"
      />
      <CategorySection />
      <FeaturedProducts />
      <ProductGrid />
    </div>
  );
}
