// Adapted from booking-form/1. components/2. form-sections/2. PriceDisplay.tsx
import React from "react";

/**
 * Basic PriceDisplay component ready for Tailwind styling.
 */
export default function PriceDisplay(props) {
  const {
    price = 0,
    prefix = "₹",
    showPrefix = true,
    size = "medium", // small, medium, large
    fontWeight = "semibold", // normal, medium, semibold, bold
    showDecimal = false,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Format price
  const formatPrice = (value) => {
    if (typeof value !== 'number') return '0'; // Handle non-number input

    const options = showDecimal
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { minimumFractionDigits: 0, maximumFractionDigits: 0 }; // Ensure no decimals if showDecimal is false

    return value.toLocaleString("en-IN", options);
  };

  // Determine Tailwind classes based on props
  const sizeClasses =
    size === "small" ? "text-base" :
    size === "large" ? "text-2xl" : // Example: Tailwind text-2xl
    "text-xl"; // Default medium size

  const weightClasses =
    fontWeight === "normal" ? "font-normal" :
    fontWeight === "medium" ? "font-medium" :
    fontWeight === "bold" ? "font-bold" :
    "font-semibold"; // Default semibold

  const baseClasses = "font-geist text-neutral-900 tracking-tight"; // Example base classes, adjust font/color

  return (
    <div className={`${baseClasses} ${sizeClasses} ${weightClasses} ${className}`} {...rest}>
      {showPrefix && prefix}
      {formatPrice(price)}
    </div>
  );
}
