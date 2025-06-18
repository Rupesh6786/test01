
export interface Product {
  id: string;
  brand: string;
  model: string;
  price: number;
  capacity: string; // e.g., "1.5 Ton"
  warranty: string; // e.g., "1 Year"
  imageUrl: string;
  features: string; // comma-separated initial features
  condition: "New" | "Used";
  aiHint: string; // for placeholder image
  description?: string; // AI generated
}

export interface Service {
  id: string;
  name: string;
  description: string;
  priceRange?: string; // e.g., "$50 - $100"
  price?: number; // For specific service price, if applicable
  icon?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  aiHint?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string; // for videos
  title: string;
  description?: string;
  aiHint: string;
}

export interface Address {
  id: string; // Firestore document ID
  userId: string; // To link address to user
  type: 'Home' | 'Work' | 'Other'; // e.g., Home, Work
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Appointment {
  id: string; // Firestore document ID
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  bookingDate: string; // Store as ISO string "yyyy-MM-dd"
  bookingTime: string;
  budget?: string;
  status: 'Payment Pending' | 'Confirmed' | 'Completed' | 'Cancelled'; // Added 'Payment Pending'
  createdAt: any; // Firestore ServerTimestamp for ordering
  paymentId?: string; // Razorpay Payment ID
  pricePaid?: number; // Amount paid, in smallest currency unit (e.g., paise)
}
