
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { initialProductsData } from '@/lib/product-data';

async function getProductsWithDescriptions(): Promise<Product[]> {
  const productsWithDescriptions = await Promise.all(
    initialProductsData.map(async (product) => {
      try {
        const aiResponse = await generateProductDescription({
          brand: product.brand,
          model: product.model,
          capacity: product.capacity,
          features: product.features,
          condition: product.condition,
        });
        return { ...product, description: aiResponse.description };
      } catch (error) {
        console.error(`Failed to generate description for ${product.brand} ${product.model}:`, error);
        return { ...product, description: `Key features: ${product.features}. Capacity: ${product.capacity}. Condition: ${product.condition}. Reliable and efficient cooling.` }; // Fallback description
      }
    })
  );
  return productsWithDescriptions;
}

export default async function ProductsPage() {
  const products = await getProductsWithDescriptions();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Our Products</h1>
      <p className="text-lg text-muted-foreground mb-10">Find the perfect pre-owned or new AC unit for your needs. All units are quality-checked.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour
