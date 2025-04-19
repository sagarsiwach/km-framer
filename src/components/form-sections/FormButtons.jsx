// Adapted from booking-form/1. components/2. form-sections/3. FormButtons.tsx
import React from "react";
// Assuming Button component is adapted and imported
import Button from "../ui/Button";

/**
 * Basic FormButtons component ready for Tailwind styling.
 */
export default function FormButtons(props) {
  const {
    showBackButton = true,
    nextButtonText = "Next",
    backButtonText = "Back",
    showNextButton = true,
    isNextDisabled = false,
    // primaryColor, // Removed for Tailwind
    onNext,
    onBack,
    rightIcon = true, // Prop for Button component
    gap = 4, // Tailwind gap unit (e.g., gap-4)
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  // Use template literal for dynamic gap
  const containerClasses = `flex w-full ${className}`;

  return (
    <div className={`${containerClasses} gap-${gap}`} {...rest}>
      {showBackButton && (
        <Button
          text={backButtonText}
          variant="outline" // Use outline variant for back button
          onClick={onBack}
          className={showNextButton ? "flex-1" : "w-full"} // Adjust width based on presence of next button
          // primaryColor prop is removed, variant handles styling
        />
      )}

      {showNextButton && (
        <Button
          text={nextButtonText}
          rightIcon={rightIcon}
          onClick={onNext}
          className={showBackButton ? "flex-1" : "w-full"} // Adjust width based on presence of back button
          variant="primary" // Use primary variant for next button
          disabled={isNextDisabled}
          // primaryColor prop is removed, variant handles styling
        />
      )}
    </div>
  );
}
