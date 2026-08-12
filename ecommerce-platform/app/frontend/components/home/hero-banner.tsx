import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "../../lib/image-url";

interface HeroBannerProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

export const HeroBanner = ({
  badgeLabel,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  imageUrl,
}: HeroBannerProps) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 min-h-[380px] sm:min-h-[440px] flex items-center shadow-xl">
      <Image
        src={getImageUrl(imageUrl)}
        alt={title}
        fill
        priority
        className="object-cover w-full h-full scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/40 md:to-transparent" />

      <div className="relative z-10 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-10 sm:py-14 w-full max-w-3xl">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-xs sm:text-sm font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
            {badgeLabel}
          </span>
        </div>

        {/* Heading H1 với Padding & Margin tăng cường */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight sm:leading-tight tracking-tight whitespace-pre-line drop-shadow-md my-4 sm:my-6 py-2 sm:py-3">
          {title}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-200 mb-8 max-w-xl leading-relaxed">
          {subtitle}
        </p>

        <div>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-sm sm:text-base font-bold px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl shadow-xl shadow-orange-600/35 transition-all duration-200 hover:-translate-y-0.5"
          >
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </div>
  );
};
