// Adapted from booking-form/1. components/3. step-components/6. ComponentsSection.tsx
import React from "react";
// Assuming SectionTitle and VariantCard components are adapted and imported
import SectionTitle from "../form-sections/SectionTitle";
import VariantCard from "../ui/VariantCard";

/**
 * Basic ComponentsSection component ready for Tailwind styling.
 */
export default function ComponentsSection(props) {
  const {
    components = [],
    selectedComponentIds = [],
    onSelect, // Expects (id, isSelected)
    // borderColor, // Removed for Tailwind
    // selectedBorderColor, // Removed for Tailwind
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Group components by type
  const groupedComponents = components.reduce((acc, component) => {
    const type = component.component_type || "OTHER";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(component);
    return acc;
  }, {});

  // Order of sections (optional)
  const sectionOrder = ["ACCESSORY", "PACKAGE", "WARRANTY", "SERVICE", "OTHER"];

  // Map component types to human-readable names
  const getComponentTypeName = (type) => {
    switch (type) {
      case "ACCESSORY": return "Accessories";
      case "PACKAGE": return "Packages";
      case "WARRANTY": return "Warranty";
      case "SERVICE": return "Servicing";
      default: return "Optional Components";
    }
  };

  // Placeholder classes - apply Tailwind here
  const containerClasses = `${className}`;
  const sectionClasses = "mb-8";
  const noComponentsClasses = "p-4 text-center text-neutral-500 text-sm";

  return (
    <div className={containerClasses} {...rest}>
      {sectionOrder.map((componentType) => {
        const componentsOfType = groupedComponents[componentType];

        if (!componentsOfType || componentsOfType.length === 0) return null;

        return (
          <div key={componentType} className={sectionClasses}>
            <SectionTitle title={getComponentTypeName(componentType)} />

            {componentsOfType.map((component) => {
              const isSelected = selectedComponentIds.includes(component.id);
              const isDisabled = component.is_required; // Disable interaction for required items

              return (
                <VariantCard
                  key={component.id}
                  title={component.title}
                  subtitle={component.subtitle}
                  description={component.description}
                  price={
                    component.price > 0
                      ? `₹${component.price.toLocaleString("en-IN")}`
                      : "" // Show empty string if price is 0
                  }
                  includedText={component.is_required ? "Mandatory" : ""}
                  isSelected={isSelected}
                  onClick={isDisabled ? undefined : () => {
                    if (onSelect) {
                      onSelect(component.id, !isSelected);
                    }
                  }}
                  // Pass Tailwind classes for styling based on state
                  className={` ${isDisabled ? 'opacity-80 cursor-default' : ''}`}
                  // Pass style for potential overrides (like opacity was used before)
                  // style={{ opacity: component.is_required ? 0.8 : 1 }} // Or handle via Tailwind class
                />
              );
            })}
          </div>
        );
      })}

      {components.length === 0 && (
        <div className={noComponentsClasses}>
          No components available. Please select a vehicle first.
        </div>
      )}
    </div>
  );
}
