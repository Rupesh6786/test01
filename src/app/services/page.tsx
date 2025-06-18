"use client";

import { useRef, useState, useEffect } from 'react';
import { ServiceBookingForm } from '@/components/ServiceBookingForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench, Wind, Pipette, Unplug, Settings, ThermometerSun, Cpu, Replace, PackagePlus, Cog } from 'lucide-react';
import type { Service } from '@/types';

const servicesList: Service[] = [
  { id: '1', name: 'Filter Cleaning', description: 'Thorough cleaning of AC filters for improved air quality and efficiency.', priceRange: '₹300 - ₹500', icon: "Wind" },
  { id: '2', name: 'Dry Service', description: 'Comprehensive dry servicing including cleaning of coils and outer unit.', priceRange: '₹500 - ₹800', icon: "ThermometerSun" },
  { id: '3', name: 'Gas Charging', description: 'AC refrigerant gas top-up or full recharge by certified technicians.', priceRange: '₹1500 - ₹3000', icon: "Pipette" },
  { id: '4', name: 'AC Fitting / Installation', description: 'Professional fitting and installation of new or used AC units.', priceRange: '₹1000 - ₹2000', icon: "Settings" },
  { id: '5', name: 'Dismantling', description: 'Safe and careful dismantling of existing AC units for relocation or disposal.', priceRange: '₹500 - ₹1000', icon: "Unplug" },
  { id: '6', name: 'Z Service (Jet Pump Service)', description: 'Intensive cleaning using a high-pressure jet pump for deep-seated dirt.', priceRange: '₹800 - ₹1200', icon: "Wrench" },
  { id: '7', name: 'Piping', description: 'Copper piping work for AC installations and extensions.', priceRange: 'Varies by length', icon: "Pipette" },
  { id: '8', name: 'PCB Repair', description: 'Expert repair services for AC Printed Circuit Boards (PCBs).', priceRange: 'Varies', icon: "Cpu" },
  { id: '9', name: 'Compressor Replacement', description: 'Replacement of faulty AC compressors with quality parts.', priceRange: 'Varies', icon: "Replace" },
  { id: '10', name: 'AC Installation', description: 'Standard installation services for all types of AC units, ensuring optimal performance.', priceRange: '₹1200 - ₹2500', icon: "PackagePlus" },
  { id: '11', name: 'Motor Replacement', description: 'Replacement of blower motors, fan motors, and other AC motors.', priceRange: 'Varies', icon: "Cog" },
];

const IconMap: { [key: string]: React.ElementType } = {
  Wind,
  ThermometerSun,
  Pipette,
  Settings,
  Unplug,
  Wrench,
  Cpu,
  Replace,
  PackagePlus,
  Cog,
  Default: Wrench,
};

export default function ServicesPage() {
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const [selectedServiceForForm, setSelectedServiceForForm] = useState<string | undefined>(undefined);

  const handleServiceCardClick = (serviceName: string) => {
    setSelectedServiceForForm(serviceName);
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // To reset selected service if form is submitted or component unmounts,
  // to prevent stale pre-selection on next click if form isn't keyed
  useEffect(() => {
    if (selectedServiceForForm) {
        // Optional: clear after a delay if form doesn't reset it
        // const timer = setTimeout(() => setSelectedServiceForForm(undefined), 500);
        // return () => clearTimeout(timer);
    }
  }, [selectedServiceForForm])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Our AC Services</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Reliable and professional AC services to keep you cool. Schedule your appointment today!
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {servicesList.map(service => {
          const IconComponent = service.icon ? IconMap[service.icon] || IconMap.Default : IconMap.Default;
          
          return (
            <Card 
              key={service.id} 
              className="hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleServiceCardClick(service.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleServiceCardClick(service.name);}}
              aria-label={`Select service: ${service.name}`}
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <IconComponent className="w-10 h-10 text-primary" />
                <div>
                  <CardTitle className="font-headline text-xl">{service.name}</CardTitle>
                  {service.priceRange && <p className="text-sm text-accent">{service.priceRange}</p>}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div ref={bookingFormRef} className="max-w-3xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow-xl scroll-mt-20">
        <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-foreground mb-6 text-center">
          Book Your Service Appointment
        </h2>
        <ServiceBookingForm 
            availableServices={servicesList} 
            initialServiceType={selectedServiceForForm}
            key={selectedServiceForForm} // Re-mount form to ensure defaultValues takes effect on selection
        />
      </div>
    </div>
  );
}

// Add type for Service Icon
declare module '@/types' {
  interface Service {
    icon?: string;
  }
}