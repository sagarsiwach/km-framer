// Adapted from booking-form/1. components/3. step-components/2. VariantSelector.tsx
import React from "react";
// Assuming SectionTitle and VariantCard components are adapted and imported
import SectionTitle from "../form-sections/SectionTitle";
import VariantCard from "../ui/VariantCard";

/**
 * Basic VariantSelector component ready for Tailwind styling.
 */
export default function VariantSelector(props) {
  const {
    title = "CHOOSE VARIANT",
    variants = [], // Expects array of { id, title, subtitle, description, price_addition, is_default }
    selectedVariantId = "",
    onSelect,
    // borderColor, // Removed for Tailwind
    // selectedBorderColor, // Removed for Tailwind
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const containerClasses = `${className}`;
  const noVariantsClasses = "p-4 text-center text-neutral-500 text-sm";

  return (
    <div className={containerClasses} {...rest}>
      <SectionTitle title={title} />

      {variants.map((variant) => (
        <VariantCard
          key={variant.id}
          title={variant.title}
          subtitle={variant.subtitle}
          description={variant.description}
          price={
            variant.price_addition > 0
              ? `₹${variant.price_addition.toLocaleString("en-IN")}`
              : "" // Show empty if price_addition is 0 or less
          }
          pricePrefix={variant.price_addition > 0 ? "+" : ""} // Show "+" only if there's an addition
          includedText={variant.price_addition <= 0 ? "Included" : ""} // Show "Included" if price_addition is 0 or less
          isSelected={variant.id === selectedVariantId}
          onClick={() => onSelect && onSelect(variant.id)}
          // Pass Tailwind classes or rely on VariantCard's internal state styling
          // className="..."
          // borderColor and selectedBorderColor props removed
        />
      ))}

      {variants.length === 0 && (
        <div className={noVariantsClasses}>
          No variants available. Please select a vehicle first.
        </div>
      )}
    </div>
  );
}
