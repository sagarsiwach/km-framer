// Adapted from booking-form/1. components/2. form-sections/5. LoadingIndicator.tsx
import React from "react";
// Removed Framer Motion

/**
 * Basic LoadingIndicator component ready for Tailwind styling.
 */
export default function LoadingIndicator(props) {
  const {
    text = "Loading...",
    showText = true,
    // color, // Removed for Tailwind, use text/border color utilities
    size = "medium", // small, medium, large
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Determine Tailwind classes based on size
  const spinnerSizeClasses =
    size === "small" ? "w-6 h-6 border-2" :
    size === "large" ? "w-12 h-12 border-4" :
    "w-8 h-8 border-3"; // Default medium size, border thickness example

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col items-center justify-center p-4 ${className}`;
  const spinnerClasses = `animate-spin rounded-full border-neutral-200 border-t-blue-600 ${spinnerSizeClasses}`; // Example colors
  const textClasses = "mt-3 text-neutral-600 text-sm";

  return (
    <div className={containerClasses} {...rest}>
      <div className={spinnerClasses} role="status" aria-label={text}>
        {/* Screen reader only text if needed */}
        {/* <span className="sr-only">{text}</span> */}
      </div>
      {showText && <div className={textClasses}>{text}</div>}
    </div>
  );
}
