// Adapted from booking-form/1. components/1. ui/InputField.tsx
import React, { useState, useEffect } from "react";

/**
 * Basic InputField component ready for Tailwind styling.
 */
export default function InputField(props) {
  const {
    label = "Label",
    placeholder = "Placeholder",
    type = "text",
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
    maxLength,
    minLength,
    pattern,
    readOnly = false,
    autoComplete, // Renamed from autocomplete for consistency
    autoFocus = false,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  // Use controlled component pattern directly with value prop
  // const [inputValue, setInputValue] = useState(value);
  const uniqueId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  // No need for useEffect to sync state if parent controls value
  // useEffect(() => {
  //   setInputValue(value);
  // }, [value]);

  const handleChange = (e) => {
    // setInputValue(e.target.value); // No internal state needed
    if (onChange) {
      // Pass the value directly, assuming parent manages state
      onChange(e.target.value);
    }
  };

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col mb-4 w-full ${className}`;
  const labelContainerClasses = "mb-2";
  const labelClasses = "block text-xs font-semibold uppercase tracking-wider text-neutral-700"; // Adjusted label style
  const descriptionClasses = "text-xs text-neutral-500 mt-0.5";
  const inputContainerClasses = "relative w-full";
  const inputBaseClasses = "w-full h-16 px-5 text-lg rounded-lg border outline-none transition-all duration-200 ease-in-out bg-neutral-50 text-neutral-900 placeholder-transparent"; // Adjusted text size, added placeholder-transparent
  const inputStateClasses = error ? 'border-red-600' : isFocused ? 'border-blue-600 ring-3 ring-blue-400 ring-offset-1' : 'border-neutral-300';
  const inputDisabledClasses = disabled ? 'opacity-70 cursor-not-allowed' : '';
  // Floating label classes (example using peer-focus and placeholder-shown)
  const floatingLabelBaseClasses = "absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-lg text-neutral-400 transition-all duration-200 ease-in-out";
  const floatingLabelActiveClasses = "peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-blue-600"; // Adjust as needed
  const floatingLabelFilledClasses = "top-3 -translate-y-0 text-xs"; // When input has value
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
          <div id={`${uniqueId}-description`} className={descriptionClasses}>{description}</div>
        )}
      </div>

      <div className={inputContainerClasses}>
        <input
          id={uniqueId}
          type={type}
          name={name || uniqueId}
          value={value} // Use value prop directly
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${uniqueId}-error` : description ? `${uniqueId}-description` : undefined
          }
          // Add 'peer' class for floating label interaction
          className={`${inputBaseClasses} ${inputStateClasses} ${inputDisabledClasses} peer`}
          placeholder={placeholder} // Keep placeholder for accessibility, hide visually if needed
        />
         {/* Floating Label Implementation (Example) */}
         {/* Needs CSS/Tailwind to handle the floating effect based on input state */}
         {/* <label
           htmlFor={uniqueId}
           className={`${floatingLabelBaseClasses} ${value ? floatingLabelFilledClasses : ''} ${isFocused ? floatingLabelActiveClasses : ''}`}
         >
           {placeholder}
         </label> */}
         {/* Simple placeholder shown via input's placeholder attribute is often sufficient */}
      </div>

      {error && (
        <div id={`${uniqueId}-error`} className={errorClasses} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
