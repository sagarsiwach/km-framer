// Adapted from booking-form/1. components/1. ui/Button.tsx
import React from "react"; // Assuming React 17+ new JSX transform

/**
 * Basic Button component ready for Tailwind styling.
 */
export default function Button(props) {
  const {
    text = "Button",
    rightIcon = false,
    leftIcon = false,
    // primaryColor, // Removed for Tailwind
    // textColor, // Removed for Tailwind
    width = "w-full", // Example Tailwind class
    height = "auto", // Example Tailwind class
    disabled = false,
    variant = "primary", // primary, secondary, outline, ghost, destructive
    size = "default", // small, default, large
    loading = false,
    onClick,
    type = "button",
    className = "", // Allow passing Tailwind classes
    ...rest // Keep other props like aria-*
  } = props;

  // Basic structure, styling to be done via Tailwind classes passed in `className`
  // or applied directly based on variant/size props in the parent component.

  // Loading spinner component (basic SVG)
  const Spinner = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin" // Example Tailwind class
    >
      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10" />
      {/* Simplified spinner */}
    </svg>
  );

  // Right arrow icon (basic SVG)
  const ArrowIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.16669 10H15.8334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4.16669L15.8333 10L10 15.8334"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Placeholder for base button style classes (you'll define these)
  const baseClasses = "flex items-center justify-center gap-2 rounded font-medium transition-all";
  // Placeholder for size classes
  const sizeClasses = size === 'small' ? 'px-3 py-2 text-sm' : size === 'large' ? 'px-8 py-5 text-lg' : 'px-6 py-4 text-base';
  // Placeholder for variant classes
  const variantClasses =
    variant === 'primary' ? 'bg-blue-600 text-white border-none hover:bg-blue-700' :
    variant === 'secondary' ? 'bg-neutral-100 text-neutral-900 border-none hover:bg-neutral-200' :
    variant === 'outline' ? 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50' :
    variant === 'ghost' ? 'bg-transparent text-neutral-900 hover:bg-neutral-100' :
    variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700' : '';
  const disabledClasses = disabled || loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      // Combine base, size, variant, disabled, width, height, and custom classes
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${width} ${height} ${className}`}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      type={type}
      aria-disabled={disabled || loading}
      data-loading={loading}
      {...rest}
    >
      {loading && (
        <span className={text ? "mr-2" : ""}> {/* Example Tailwind */}
          <Spinner />
        </span>
      )}

      {leftIcon && !loading && <span>{leftIcon}</span>} {/* Pass icon component/element as prop */}

      {text}

      {rightIcon && !loading && <span><ArrowIcon /></span>}
    </button>
  );
}
