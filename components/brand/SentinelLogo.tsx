"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type LogoVariant = "full" | "isotipo" | "wordmark";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SentinelLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  isotipoWidth?: number;
  wordmarkWidth?: number;
  gap?: number;
  hoverAnimation?: boolean;
  className?: string;
}

// Size mappings
const isotipoSizes: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 72,
  xl: 120,
};

const wordmarkSizes: Record<LogoSize, number> = {
  xs: 60,
  sm: 80,
  md: 120,
  lg: 180,
  xl: 300,
};

export function SentinelLogo({
  variant = "full",
  size = "md",
  isotipoWidth,
  wordmarkWidth,
  gap = 12,
  hoverAnimation = false,
  className = "",
}: SentinelLogoProps) {
  const isoWidth = isotipoWidth ?? isotipoSizes[size];
  const isoHeight = isoWidth;
  const wordWidth = wordmarkWidth ?? wordmarkSizes[size];
  const wordHeight = Math.round(wordWidth * 0.25); // Approximate aspect ratio

  // Isotipo component with optional hover animation
  const Isotipo = () => {
    const img = (
      <Image
        src="/Logo/Isotipo.svg"
        alt="Sentinel OS"
        width={isoWidth}
        height={isoHeight}
        priority
        unoptimized={false}
        className="object-contain"
      />
    );

    if (hoverAnimation) {
      return (
        <motion.div
          whileHover={{
            rotate: [0, -8, 6, -4, 0],
            scale: [1, 1.08, 1.04, 1],
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="inline-flex"
        >
          {img}
        </motion.div>
      );
    }

    return <div className="inline-flex">{img}</div>;
  };

  // Wordmark component
  const Wordmark = () => (
    <Image
      src="/Logo/Sentinel.svg"
      alt="Sentinel OS"
      width={wordWidth}
      height={wordHeight}
      priority
      unoptimized={false}
      className="object-contain"
    />
  );

  // Render based on variant
  if (variant === "isotipo") {
    return <div className={className}><Isotipo /></div>;
  }

  if (variant === "wordmark") {
    return <div className={className}><Wordmark /></div>;
  }

  // variant === "full"
  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: `${gap}px` }}
    >
      <Isotipo />
      <Wordmark />
    </div>
  );
}
