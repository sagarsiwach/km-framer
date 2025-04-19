// Adapted from booking-form/1. components/3. step-components/3. ProviderSelector.tsx
import React from "react";
// Assuming SectionTitle component is adapted and imported
import SectionTitle from "../form-sections/SectionTitle";

/**
 * Basic ProviderSelector component ready for Tailwind styling.
 */
export default function ProviderSelector(props) {
  const {
    title = "PROVIDER",
    providers = [], // Expects array of { id, name }
    selectedProviderId = "",
    onSelect,
    // borderColor, // Removed for Tailwind
    // selectedColor, // Removed for Tailwind
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const containerClasses = `${className}`;
  const optionsContainerClasses = "flex flex-wrap gap-3 mb-4";
  const optionButtonBaseClasses = "flex-1 min-w-[120px] px-4 py-3 border rounded text-base font-medium text-center cursor-pointer transition-all duration-200 ease-in-out";
  const optionButtonStateClasses = (isSelected) => isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-neutral-900 border-neutral-300 hover:border-blue-500 hover:bg-blue-50'; // Example state styling
  const noProvidersClasses = "p-4 text-center text-neutral-500 text-sm";

  return (
    <div className={containerClasses} {...rest}>
      <SectionTitle title={title} />

      <div className={optionsContainerClasses}>
        {providers.map((provider) => {
          const isSelected = provider.id === selectedProviderId;
          return (
            <button // Use button for better semantics
              key={provider.id}
              type="button"
              className={`${optionButtonBaseClasses} ${optionButtonStateClasses(isSelected)}`}
              onClick={() => onSelect && onSelect(provider.id)}
              aria-pressed={isSelected} // Indicate selection state
            >
              {provider.name}
            </button>
          );
        })}
      </div>

      {providers.length === 0 && (
        <div className={noProvidersClasses}>
          No providers available.
        </div>
      )}
    </div>
  );
}
