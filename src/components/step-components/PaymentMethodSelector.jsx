// Adapted from booking-form/1. components/3. step-components/4. PaymentMethodSelector.tsx
import React from "react";
// Assuming SectionTitle and VariantCard components are adapted and imported
import SectionTitle from "../form-sections/SectionTitle";
import VariantCard from "../ui/VariantCard";

/**
 * Basic PaymentMethodSelector component ready for Tailwind styling.
 */
export default function PaymentMethodSelector(props) {
  const {
    title = "PAYMENT METHOD",
    methods = [
      { id: "full-payment", title: "Full Payment", subtitle: "Pay the entire amount upfront", description: "" },
      { id: "loan", title: "EMI Option", subtitle: "Start your ride with Zero down payment", description: "EMI starting from ₹499/month" },
    ],
    selectedMethodId = "",
    onSelect,
    // borderColor, // Removed for Tailwind
    // selectedBorderColor, // Removed for Tailwind
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const containerClasses = `${className}`;

  return (
    <div className={containerClasses} {...rest}>
      <SectionTitle title={title} />

      {methods.map((method) => (
        <VariantCard
          key={method.id}
          title={method.title}
          subtitle={method.subtitle}
          description={method.description}
          isSelected={method.id === selectedMethodId}
          onClick={() => onSelect && onSelect(method.id)}
          // Pass Tailwind classes or rely on VariantCard's internal state styling
          // className="..."
          // borderColor and selectedBorderColor props removed
        />
      ))}
    </div>
  );
}
