// Adapted from booking-form/1. components/2. form-sections/4. ErrorDisplay.tsx
import React from "react";
// Assuming Button component is adapted and imported
import Button from "../ui/Button";

/**
 * Basic ErrorDisplay component ready for Tailwind styling.
 */
export default function ErrorDisplay(props) {
  const {
    error = "",
    showRetry = false,
    retryText = "Retry",
    onRetry,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  if (!error) return null;

  // Placeholder classes - apply Tailwind here
  const containerClasses = `p-4 mb-4 bg-red-50 text-red-700 rounded text-sm ${className}`;
  // Button styling will come from the Button component itself

  return (
    <div className={containerClasses} role="alert" {...rest}>
      {error}
      {showRetry && onRetry && (
        <Button
          text={retryText}
          onClick={onRetry}
          variant="destructive" // Use destructive variant for retry in error context
          size="small"
          className="mt-3" // Add margin top
        />
        /* Alternative basic button if Button component not ready:
         <button
           className="mt-3 px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer text-sm font-medium hover:bg-red-700"
           onClick={onRetry}
         >
           {retryText}
         </button>
        */
      )}
    </div>
  );
}
