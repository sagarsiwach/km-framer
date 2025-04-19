// Adapted from booking-form/1. components/1. ui/VehicleCards.tsx
import React from "react";

/**
 * Basic VehicleCard component ready for Tailwind styling.
 */
export default function VehicleCard(props) {
  const {
    vehicleName = "KM3000",
    vehicleImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
    vehicleCode = "B10-0001",
    // price, // Price is not used in the original component's render output
    isSelected = false,
    onClick,
    // borderColor, // Removed for Tailwind
    // selectedBorderColor, // Removed for Tailwind
    // backgroundColor, // Removed for Tailwind
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const containerBaseClasses = "flex justify-between items-center rounded-lg border bg-white cursor-pointer transition-all duration-200 ease-in-out mb-1 overflow-hidden"; // mb-1 instead of mb-5px
  const containerStateClasses = isSelected ? 'border-blue-600 ring-3 ring-blue-400' : 'border-neutral-300';
  const imageContainerClasses = "w-40 h-30 relative overflow-hidden"; // Adjusted size
  const imageClasses = "w-full h-full object-cover aspect-4/3"; // aspect-4/3 utility
  const contentClasses = "flex-1 flex flex-col items-end p-5"; // Adjusted padding
  const nameClasses = `text-3xl font-geist tracking-tight mb-1 ${isSelected ? 'font-bold text-blue-700' : 'font-semibold text-neutral-900'}`; // Adjusted size/tracking
  const codeClasses = "text-sm font-mono text-neutral-500"; // font-mono example

  return (
    <div
      className={`${containerBaseClasses} ${containerStateClasses} ${className}`}
      onClick={onClick}
      role="button" // Make it interactive
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick && onClick()} // Keyboard activation
      {...rest}
    >
      <div className={imageContainerClasses}>
        <img src={vehicleImage} alt={vehicleName} className={imageClasses} />
      </div>
      <div className={contentClasses}>
        <div className={nameClasses}>{vehicleName}</div>
        <div className={codeClasses}>{vehicleCode}</div>
      </div>
    </div>
  );
}
