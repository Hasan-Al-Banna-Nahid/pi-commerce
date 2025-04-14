import ProductDetailClient from "@/app/components/productDetail";

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetailClient id={params.id} />;
}
