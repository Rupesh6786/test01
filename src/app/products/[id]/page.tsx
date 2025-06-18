
import { initialProductsData } from '@/lib/product-data';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import type { Product } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tag, ShieldCheck, CircleDollarSign, CheckCircle, Settings, Star } from 'lucide-react';
import Link from 'next/link';

async function getProductDetails(id: string): Promise<Product | undefined> {
  const baseProduct = initialProductsData.find(p => p.id === id);
  if (!baseProduct) {
    return undefined;
  }

  try {
    const aiResponse = await generateProductDescription({
      brand: baseProduct.brand,
      model: baseProduct.model,
      capacity: baseProduct.capacity,
      features: baseProduct.features,
      condition: baseProduct.condition,
    });
    return { ...baseProduct, description: aiResponse.description };
  } catch (error) {
    console.error(`Failed to generate description for ${baseProduct.brand} ${baseProduct.model}:`, error);
    // Fallback description
    return { 
      ...baseProduct, 
      description: `Key features: ${baseProduct.features}. Capacity: ${baseProduct.capacity}. Condition: ${baseProduct.condition}. Reliable and efficient cooling for your comfort.` 
    };
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductDetails(params.id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="font-headline text-2xl font-semibold">Product not found</h1>
        <Link href="/products">
          <Button variant="link" className="mt-4">Go back to products</Button>
        </Link>
      </div>
    );
  }

  const featuresArray = product.features.split(',').map(f => f.trim());

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <Image
              src={product.imageUrl}
              alt={`${product.brand} ${product.model}`}
              data-ai-hint={product.aiHint}
              width={800}
              height={600}
              className="object-cover w-full h-auto md:h-[500px]"
              priority
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 text-sm font-medium rounded-full">
            {product.condition}
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground">{product.brand} {product.model}</h1>
          
          <div className="flex items-center space-x-2">
            <CircleDollarSign className="w-8 h-8 text-accent" />
            <p className="text-4xl font-semibold text-accent">₹{product.price.toLocaleString()}</p>
          </div>

          <CardDescription className="text-lg text-foreground/85 leading-relaxed">
            {product.description}
          </CardDescription>

          <div className="space-y-3 py-4 border-t border-b">
            <div className="flex items-center text-foreground">
              <Tag className="w-5 h-5 mr-3 text-primary" /> 
              <span className="font-medium">Capacity:</span>&nbsp;{product.capacity}
            </div>
            <div className="flex items-center text-foreground">
              <ShieldCheck className="w-5 h-5 mr-3 text-primary" /> 
              <span className="font-medium">Warranty:</span>&nbsp;{product.warranty}
            </div>
             <div className="flex items-center text-foreground">
              <Settings className="w-5 h-5 mr-3 text-primary" /> 
              <span className="font-medium">Type:</span>&nbsp;Air Conditioner
            </div>
          </div>
          
          <div>
            <h3 className="font-headline text-xl font-semibold text-foreground mb-3">Key Features</h3>
            <ul className="space-y-2">
              {featuresArray.map(feature => (
                <li key={feature} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Link href={`/checkout/${product.id}`} className="w-full md:w-auto block mt-6">
            <Button size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8">
              Buy Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Placeholder for Reviews/Ratings section */}
      <div className="mt-16 pt-8 border-t">
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Customer Reviews</h2>
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
          <p className="text-muted-foreground">Customer reviews and ratings coming soon!</p>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return initialProductsData.map(product => ({
    id: product.id,
  }));
}

export const revalidate = 3600; // Revalidate every hour

