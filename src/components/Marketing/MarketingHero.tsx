import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  MARKETING_BADGE_CLASS,
  MARKETING_HERO_OVERLAY_BOTTOM_CLASS,
  MARKETING_HERO_OVERLAY_TOP_CLASS,
  MARKETING_HERO_SECTION_CLASS,
} from '@/styles/marketing';

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  containerClassName?: string;
};

export default function MarketingHero({
  eyebrow,
  title,
  subtitle,
  children,
  containerClassName,
}: Props) {
  return (
    <section className={MARKETING_HERO_SECTION_CLASS}>
      <div aria-hidden className={MARKETING_HERO_OVERLAY_TOP_CLASS} />
      <div aria-hidden className={MARKETING_HERO_OVERLAY_BOTTOM_CLASS} />

      <div className={['container mx-auto px-4 py-20 md:py-24 relative', containerClassName].filter(Boolean).join(' ')}>
        <div className="max-w-4xl mx-auto text-center">
          {eyebrow ? (
            <Badge className={['mb-5 px-4 py-1 border', MARKETING_BADGE_CLASS].join(' ')}>
              {eyebrow}
            </Badge>
          ) : null}

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">
            {title}
          </h1>

          {subtitle ? (
            <p className="text-base md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          ) : null}

          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

