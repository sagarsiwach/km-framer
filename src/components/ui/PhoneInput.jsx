// Adapted from booking-form/1. components/1. ui/PhoneInput.tsx
import React, { useState, useEffect } from "react";

/**
 * Basic PhoneInput component ready for Tailwind styling.
 */
export default function PhoneInput(props) {
  const {
    label = "Mobile Number",
    placeholder = "Phone number",
    countryCode = "+91",
    value = "",
    onChange,
    error = "",
    description = "",
    required = false,
    disabled = false,
    // borderColor, // Removed for Tailwind
    // focusBorderColor, // Removed for Tailwind
    // errorBorderColor, // Removed for Tailwind
    // labelColor, // Removed for Tailwind
    // placeholderColor, // Removed for Tailwind
    // backgroundColor, // Removed for Tailwind
    id,
    name,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  // Use controlled component pattern directly
  // const [inputValue, setInputValue] = useState(value);
  const uniqueId =
    id || `phone-input-${Math.random().toString(36).substring(2, 9)}`;

  // No need for useEffect if parent controls value
  // useEffect(() => {
  //   setInputValue(value);
  // }, [value]);

  const handleChange = (e) => {
    // Only allow numbers, limit to 10 digits
    const newValue = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    // setInputValue(newValue); // No internal state
    if (onChange) {
      onChange(newValue); // Pass the raw number string
    }
  };

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col mb-4 w-full ${className}`;
  const labelContainerClasses = "mb-2";
  const labelClasses = "block text-xs font-semibold uppercase tracking-wider text-neutral-700";
  const descriptionClasses = "text-xs text-neutral-500 mt-0.5";
  const inputContainerBaseClasses = "flex h-16 rounded-lg overflow-hidden border transition-all duration-200 ease-in-out bg-neutral-50";
  const inputContainerStateClasses = error ? 'border-red-600' : isFocused ? 'border-blue-600 ring-3 ring-blue-400' : 'border-neutral-300';
  const inputContainerDisabledClasses = disabled ? 'opacity-70 cursor-not-allowed' : '';
  const countryCodeClasses = "flex items-center justify-center px-4 bg-neutral-100 text-neutral-900 font-medium text-lg border-r border-neutral-300"; // Adjusted text size
  const inputWrapperClasses = "relative flex-1"; // Wrapper for input and placeholder
  const inputClasses = "w-full h-full px-5 text-lg border-none outline-none bg-transparent text-neutral-900 placeholder-transparent"; // Adjusted text size, placeholder transparent
  // Floating label classes (example)
  const floatingLabelBaseClasses = "absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-lg text-neutral-400 transition-all duration-200 ease-in-out";
  const floatingLabelActiveClasses = "top-3 -translate-y-0 text-xs"; // When focused or has value
  const errorClasses = "text-xs text-red-600 mt-1";

  return (
    <div className={containerClasses} {...rest}>
      <div className={labelContainerClasses}>
        {label && (
          <label htmlFor={uniqueId} className={labelClasses}>
            {label}{" "}
            {required && <span className="text-red-600">*</span>}
          </label>
        )}
        {description && (
          <div id={`${uniqueId}-description`} className={descriptionClasses}>
            {description}
          </div>
        )}
      </div>

      <div className={`${inputContainerBaseClasses} ${inputContainerStateClasses} ${inputContainerDisabledClasses}`}>
        <div className={countryCodeClasses} aria-hidden="true">
          {countryCode}
        </div>
        <div className={inputWrapperClasses}>
          <input
            id={uniqueId}
            type="tel" // Use tel type
            name={name || uniqueId}
            value={value} // Use value prop directly
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${uniqueId}-error` : description ? `${uniqueId}-description` : undefined
            }
            className={inputClasses}
            maxLength={10} // Max length for Indian numbers
            autoComplete="tel-national" // Autocomplete hint
            placeholder={placeholder} // Keep for accessibility, hide visually if needed
          />
           {/* Floating Label (Example) */}
           {/* <label
             htmlFor={uniqueId}
             className={`${floatingLabelBaseClasses} ${ (isFocused || value) ? floatingLabelActiveClasses : '' }`}
           >
             {placeholder}
           </label> */}
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
