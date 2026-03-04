import { Hero } from '@/components/landing/Hero';
import { ImageGridSection } from '@/components/landing/ImageGridSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { DevicesSection } from '@/components/landing/DevicesSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export function LandingPage() {
  return (
    <div>
      <Hero />
      <ImageGridSection />
      <PricingSection />
      <DevicesSection />
      <LandingFooter />
    </div>
  );
}
