import React from 'react';
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage';
import PricingSection from '@/components/Marketing/PricingSection';

export default function Precos() {
  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <PricingSection />
    </div>
  );
}
