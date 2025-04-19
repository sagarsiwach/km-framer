// Adapted from booking-form/1. components/1. ui/VariantCard.tsx
import React from "react";

/**
 * Basic VariantCard component ready for Tailwind styling.
 */
export default function VariantCard(props) {
  const {
    title = "Standard Variant",
    subtitle = "5.1h kWh Battery Pack",
    description = "250km Range (IDC)",
    price = "", // Expects formatted string or empty
    includedText = "Included",
    pricePrefix = "+",
    isSelected = false,
    onClick,
    // borderColor, // Removed for Tailwind
    // selectedBorderColor, // Removed for Tailwind
    // backgroundColor, // Removed for Tailwind
    className = "", // Allow passing Tailwind classes
    style = {}, // Keep style prop for potential overrides like opacity
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const containerBaseClasses = "flex justify-between items-center p-5 rounded-lg border bg-white cursor-pointer transition-all duration-200 ease-in-out mb-1"; // mb-1 instead of 5px
  const containerStateClasses = isSelected ? 'border-blue-600 ring-3 ring-blue-400' : 'border-neutral-300';
  const contentClasses = "flex flex-col gap-5"; // Adjusted gap
  const titleContainerClasses = "flex flex-col gap-2.5"; // Adjusted gap
  const titleClasses = `text-2xl font-geist font-semibold tracking-tight mb-1 ${isSelected ? 'text-blue-700' : 'text-neutral-900'}`; // Adjusted size/tracking
  const subtitleClasses = "text-base font-geist font-medium tracking-tight text-neutral-500"; // Adjusted size/tracking
  const descriptionContainerClasses = "flex flex-col gap-2.5"; // Adjusted gap
  const descriptionClasses = "text-base font-geist font-normal tracking-tight text-neutral-500"; // Adjusted size/tracking
  const priceClasses = "flex gap-1 items-center text-lg font-geist font-normal tracking-tight text-neutral-500"; // Adjusted size/tracking

  return (
    <div
      className={`${containerBaseClasses} ${containerStateClasses} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick && onClick()}
      style={style} // Pass through style prop
      {...rest}
    >
      <div className={contentClasses}>
        <div className={titleContainerClasses}>
          <div className={titleClasses}>{title}</div>
          {subtitle && <div className={subtitleClasses}>{subtitle}</div>}
        </div>
        {description && (
          <div className={descriptionContainerClasses}>
            <div className={descriptionClasses}>{description}</div>
          </div>
        )}
      </div>
      <div className={priceClasses}>
        {price ? (
          <>
            <span>{pricePrefix}</span>
            <span>{price}</span>
          </>
        ) : (
          <span>{includedText}</span>
        )}
      </div>
    </div>
  );
}
