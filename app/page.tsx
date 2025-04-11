import { ProductGrid } from "@/app/components/products/product-grid";
import { Hero } from "@/app/components/hero";
import { CategorySection } from "@/app/components/products/category-section";
import { FeaturedProducts } from "@/app/components/products/featured-products";
import { Testimonials } from "@/app/components/testimonials";
import { Newsletter } from "@/app/components/newsletter";
import { Navbar } from "./components/navbar/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero
        title="Premium Digital Devices Solutions"
        description="Discover our high-quality digital Devices equipment and supplies for your business needs"
        ctaText="Shop Now"
        ctaLink="/products"
        secondaryText="Learn More"
        secondaryLink="/about"
      />
      <CategorySection />
      <FeaturedProducts />
      <ProductGrid />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
