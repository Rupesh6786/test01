
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { initialProductsData } from '@/lib/product-data';
import type { Product, Address } from '@/types';
import { Loader2, PlusCircle, Home, Briefcase, MapPin, ShoppingCart } from 'lucide-react';
import { AddressFormModal } from '@/components/AddressFormModal';
import { useToast } from '@/hooks/use-toast';
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, Unsubscribe } from "firebase/firestore";
import type {} from '@/types/razorpay'; 

const RAZORPAY_KEY_ID = "rzp_test_lw1YZ20Ss4PtqR"; 

export default function CheckoutPage() {
  const params = useParams();
  const productId = params.productId as string;
  const router = useRouter();
  const { currentUser, isLoggedIn, loading: authLoading, openAuthModal } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Omit<Product, 'description' | 'aiHint'> | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isRazorpayScriptLoaded, setIsRazorpayScriptLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const scriptId = 'razorpay-checkout-script';
    if (document.getElementById(scriptId)) {
      setIsRazorpayScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayScriptLoaded(true);
    script.onerror = () => {
      toast({ title: "Error", description: "Could not load payment gateway. Please try again later.", variant: "destructive"});
      setIsRazorpayScriptLoaded(false);
    }
    document.body.appendChild(script);
    return () => {
      // Only remove if this instance added it and it's still there
      const existingScript = document.getElementById(scriptId);
      if (existingScript && existingScript.parentNode === document.body) {
        document.body.removeChild(existingScript);
      }
    };
  }, [toast]);

  useEffect(() => {
    if (productId) {
      const foundProduct = initialProductsData.find(p => p.id === productId);
      if (foundProduct) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { aiHint, description, ...coreProductDetails } = foundProduct;
        setProduct(coreProductDetails);
      }
      setIsLoadingProduct(false);
    }
  }, [productId]);

  useEffect(() => {
    let unsubscribeAddresses: Unsubscribe | undefined;
    if (isLoggedIn && currentUser) {
      setIsLoadingAddresses(true);
      const addressesCol = collection(db, "users", currentUser.uid, "addresses");
      const q = query(addressesCol);

      unsubscribeAddresses = onSnapshot(q, (querySnapshot) => {
        const fetchedAddresses: Address[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedAddresses.push({ id: docSnap.id, ...docSnap.data() } as Address);
        });
        setAddresses(fetchedAddresses);
        const defaultAddress = fetchedAddresses.find(a => a.isDefault);
        if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
        } else if (fetchedAddresses.length > 0) {
            setSelectedAddressId(fetchedAddresses[0].id);
        }
        setIsLoadingAddresses(false);
      }, (error) => {
        console.error("Error fetching addresses: ", error);
        toast({ title: "Error", description: "Could not fetch addresses.", variant: "destructive" });
        setIsLoadingAddresses(false);
      });
    } else {
      setAddresses([]);
      setIsLoadingAddresses(false);
    }
    return () => {
      if (unsubscribeAddresses) unsubscribeAddresses();
    };
  }, [currentUser, isLoggedIn, toast]);

  const handleProceedToPayment = useCallback(async () => {
    if (!isLoggedIn || !currentUser) {
      toast({ title: "Login Required", description: "Please log in to proceed.", variant: "destructive" });
      openAuthModal();
      return;
    }
    if (!selectedAddressId) {
      toast({ title: "Address Required", description: "Please select or add a shipping address.", variant: "destructive" });
      return;
    }
    if (!product) {
        toast({ title: "Error", description: "Product details not available.", variant: "destructive" });
        return;
    }
    if (!isRazorpayScriptLoaded) {
        toast({ title: "Payment Gateway Loading", description: "Please wait for the payment gateway to load or try refreshing.", variant: "destructive"});
        return;
    }
    if (RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID) {
      toast({ title: "Configuration Error", description: "Razorpay Key ID not configured.", variant: "destructive" });
      console.error("Razorpay Key ID is not configured. Please replace 'YOUR_RAZORPAY_KEY_ID'.");
      return;
    }

    setIsProcessingPayment(true);

    const amountInPaise = product.price * 100; 

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      name: "Classic-Solution", 
      description: `Order for ${product.brand} ${product.model}`,
      handler: (response) => {
        console.log("Razorpay Response:", response);
        toast({
          title: "Payment Successful!",
          description: `Payment ID: ${response.razorpay_payment_id}. Your order is confirmed.`,
        });
        // For now, redirect to my account page. In a real app, verify payment server-side first.
        // Then create an order in DB and redirect to order confirmation.
        router.push('/my-account'); 
        setIsProcessingPayment(false);
      },
      prefill: {
        name: currentUser.displayName || "",
        email: currentUser.email || "",
      },
      notes: {
        address: addresses.find(a => a.id === selectedAddressId)?.line1 || "N/A",
        productId: product.id,
        userId: currentUser.uid,
      },
      theme: {
        color: "#2563EB", 
      },
      modal: {
        ondismiss: () => {
          toast({ title: "Payment Canceled", description: "Your payment process was canceled.", variant: "destructive"});
          setIsProcessingPayment(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error("Razorpay Payment Failed:", response);
        toast({
          title: "Payment Failed",
          description: `${response.error.description || 'An unknown error occurred.'} (Code: ${response.error.code})`,
          variant: "destructive",
        });
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (error) {
        console.error("Error initializing Razorpay: ", error);
        toast({ title: "Payment Error", description: "Could not initialize payment gateway.", variant: "destructive" });
        setIsProcessingPayment(false);
    }

  }, [isLoggedIn, currentUser, selectedAddressId, product, toast, openAuthModal, router, addresses, isRazorpayScriptLoaded]);
  
  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'Home': return <Home className="w-4 h-4 text-primary mr-2 shrink-0" />;
      case 'Work': return <Briefcase className="w-4 h-4 text-primary mr-2 shrink-0" />;
      default: return <MapPin className="w-4 h-4 text-primary mr-2 shrink-0" />;
    }
  };

  const handleAddressAdded = () => {
    setIsAddAddressModalOpen(false);
    toast({ title: "Address Added", description: "New address successfully saved."});
  };

  if (authLoading || isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="font-headline text-2xl font-semibold">Product not found</h1>
        <Button variant="link" onClick={() => router.push('/products')} className="mt-4">Go back to products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-primary" /> Checkout
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Image
                  src={product.imageUrl}
                  alt={`${product.brand} ${product.model}`}
                  width={80}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold">{product.brand} {product.model}</h3>
                  <p className="text-sm text-muted-foreground">{product.capacity} - {product.condition}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>₹{product.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span>Free (Standard)</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="text-accent">₹{product.price.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="font-headline text-xl">Shipping Address</CardTitle>
              {isLoggedIn && (
                <Button variant="outline" size="sm" onClick={() => setIsAddAddressModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!isLoggedIn ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Please log in to select or add an address.</p>
                  <Button onClick={() => openAuthModal()}>Login / Register</Button>
                </div>
              ) : isLoadingAddresses ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                 <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No addresses found. Please add one.</p>
                     <Button variant="outline" onClick={() => setIsAddAddressModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
                    </Button>
                </div>
              ) : (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {addresses.map((address) => (
                      <Label
                        key={address.id}
                        htmlFor={`checkout-${address.id}`}
                        className="flex items-start p-4 border rounded-md cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                      >
                        <RadioGroupItem value={address.id} id={`checkout-${address.id}`} className="mr-3 mt-1 shrink-0" />
                        <div className="flex-grow">
                          <div className="flex items-center font-semibold mb-1">
                             {getAddressIcon(address.type)}
                             {address.type} Address
                             {address.isDefault && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.line1}</p>
                          {address.line2 && <p className="text-sm text-muted-foreground">{address.line2}</p>}
                          <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zipCode} - {address.country}</p>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
          
          {isLoggedIn && (
            <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" 
                onClick={handleProceedToPayment}
                disabled={
                    (!selectedAddressId && addresses.length > 0) || 
                    !isRazorpayScriptLoaded || 
                    isProcessingPayment ||
                    (RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID)
                }
            >
                {isProcessingPayment ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isProcessingPayment ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          )}
           {(RAZORPAY_KEY_ID === "YOUR_RAZORPAY_KEY_ID" || !RAZORPAY_KEY_ID) && isLoggedIn && (
             <p className="text-xs text-destructive text-center">Razorpay integration is not fully configured. Payment will not proceed.</p>
           )}
        </div>
      </div>

      {isAddAddressModalOpen && currentUser && (
        <AddressFormModal
          isOpen={isAddAddressModalOpen}
          onClose={() => setIsAddAddressModalOpen(false)}
          userId={currentUser.uid}
          onAddressAdded={handleAddressAdded}
        />
      )}
    </div>
  );
}
