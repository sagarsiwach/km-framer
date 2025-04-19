// Adapted from booking-form/1. components/1. ui/Checkbox.tsx
import React, { useState, useEffect } from "react";

/**
 * Basic Checkbox component ready for Tailwind styling.
 */
export default function Checkbox(props) {
  const {
    label = "I agree to the terms and conditions",
    description = "",
    checked = false,
    onChange,
    error = "",
    required = false,
    disabled = false,
    // checkboxColor, // Removed for Tailwind
    // borderColor, // Removed for Tailwind
    // errorColor, // Removed for Tailwind
    id,
    name,
    className = "", // Allow passing Tailwind classes
    labelClassName = "",
    checkboxClassName = "",
    ...rest
  } = props;

  const [isChecked, setIsChecked] = useState(checked);
  const uniqueId =
    id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (e) => {
    if (disabled) return;

    const newValue = e.target.checked;
    setIsChecked(newValue);

    if (onChange) {
      // Pass boolean value directly
      onChange(newValue);
    }
  };

  // Checkmark icon (basic SVG)
  const checkmarkIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white" // Example Tailwind
    >
      <path
        d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex items-start mb-4 ${className}`;
  const checkboxContainerClasses = "relative w-5 h-5 mr-3 mt-0.5 flex-shrink-0";
  const inputClasses = "absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed";
  const customCheckboxBaseClasses = "w-5 h-5 border rounded flex items-center justify-center transition-all pointer-events-none";
  const customCheckboxStateClasses = error ? 'border-red-600' : isChecked ? 'bg-blue-600 border-blue-600' : 'border-neutral-300 bg-transparent';
  const labelContainerClasses = "flex flex-col";
  const labelBaseClasses = `text-sm font-light leading-relaxed ${labelClassName}`; // Adjusted font weight
  const descriptionClasses = "text-xs text-neutral-500 mt-1";
  const errorClasses = "text-xs text-red-600 mt-1";

  return (
    <div {...rest}>
      <div className={containerClasses}>
        <div className={checkboxContainerClasses}>
          <input
            type="checkbox"
            id={uniqueId}
            name={name || uniqueId}
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={!!error}
            required={required}
            aria-describedby={
              error ? `${uniqueId}-error` : description ? `${uniqueId}-description` : undefined
            }
            className={inputClasses}
          />
          {/* Custom Checkbox Visual */}
          <div
            className={`${customCheckboxBaseClasses} ${customCheckboxStateClasses} ${checkboxClassName}`}
            aria-hidden="true"
          >
            {isChecked && checkmarkIcon}
          </div>
        </div>
        <div className={labelContainerClasses}>
          <label htmlFor={uniqueId} className={labelBaseClasses}>
            {label}{" "}
            {required && <span className="text-red-600">*</span>}
          </label>
          {description && (
            <div id={`${uniqueId}-description`} className={descriptionClasses}>{description}</div>
          )}
        </div>
      </div>
      {error && (
        <div id={`${uniqueId}-error`} className={errorClasses} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
