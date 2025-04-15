import { ProductGrid } from "@/app/products/product-grid";
import { Hero } from "@/app/components/hero";
import { CategorySection } from "@/app/products/category-section";
import { Testimonials } from "@/app/components/testimonials";
import { Newsletter } from "@/app/components/newsletter";
import { Navbar } from "./components/navbar/Navbar";
import AmazonStyleHomepage from "./components/HomePage";

export default function Home() {
  return (
    <main>
      <Navbar />

      <AmazonStyleHomepage />
      <Hero
        title="Premium Digital Devices Solutions"
        description="Discover our high-quality digital Devices equipment and supplies for your business needs"
        ctaText="Shop Now"
        ctaLink="/products"
        secondaryText="Learn More"
        secondaryLink="/about"
      />
      {/* <CategorySection /> */}
      {/* <FeaturedProducts /> */}
      <ProductGrid />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
