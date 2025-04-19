// Adapted from booking-form/1. components/2. form-sections/1. SectionTitle.tsx
import React from "react";

/**
 * Basic SectionTitle component ready for Tailwind styling.
 */
export default function SectionTitle(props) {
  const {
    title = "Section Title",
    // color, // Removed for Tailwind
    uppercase = true,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const titleClasses = `text-sm font-medium text-neutral-600 mb-3 tracking-wider ${uppercase ? 'uppercase' : ''} ${className}`; // Adjusted tracking

  return (
    <div className={titleClasses} {...rest}>
      {title}
    </div>
  );
}
