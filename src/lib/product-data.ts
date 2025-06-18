
import type { Product } from '@/types';

// Raw product data without AI-generated descriptions
export const initialProductsData: Omit<Product, 'description'>[] = [
  {
    id: '1',
    brand: 'CoolWave',
    model: 'X2000',
    price: 25000,
    capacity: '1.5 Ton',
    warranty: '1 Year Parts, 5 Years Compressor',
    imageUrl: 'https://placehold.co/400x300.png',
    features: 'Inverter Technology, Smart Controls, Air Purification',
    condition: 'Used',
    aiHint: 'modern air conditioner',
  },
  {
    id: '2',
    brand: 'ArcticBlast',
    model: 'ProSilent',
    price: 18000,
    capacity: '1.0 Ton',
    warranty: '6 Months Seller Warranty',
    imageUrl: 'https://placehold.co/400x300.png',
    features: 'Quiet Operation, Energy Saver, Turbo Cool',
    condition: 'Used',
    aiHint: 'compact air conditioner',
  },
  {
    id: '3',
    brand: 'FrostFlow',
    model: 'EcoSmart',
    price: 32000,
    capacity: '2.0 Ton',
    warranty: 'Brand New - 1 Year Manufacturer Warranty',
    imageUrl: 'https://placehold.co/400x300.png',
    features: 'Eco Mode, Wi-Fi Enabled, Dehumidifier',
    condition: 'New',
    aiHint: 'large air conditioner',
  },
   {
    id: '4',
    brand: 'ChillMaster',
    model: 'CompactCool',
    price: 15000,
    capacity: '0.8 Ton',
    warranty: '3 Months Warranty',
    imageUrl: 'https://placehold.co/400x300.png',
    features: 'Portable, Easy Install, Remote Control',
    condition: 'Used',
    aiHint: 'window air conditioner',
  },
];
