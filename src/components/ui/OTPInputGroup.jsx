// Adapted from booking-form/1. components/3. step-components/7. OTPInputGroup.tsx
import React, { useState, useEffect, useRef } from "react";

/**
 * Basic OTPInputGroup component ready for Tailwind styling.
 */
export default function OTPInputGroup(props) {
  const {
    value = "",
    length = 6,
    onChange,
    autoFocus = true,
    error = "",
    // borderColor, // Removed for Tailwind
    // focusBorderColor, // Removed for Tailwind
    // errorBorderColor, // Removed for Tailwind
    id,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Ensure otpValues always has the correct length
  const getInitialOtpValues = () => {
    const initial = value.slice(0, length).split('');
    while (initial.length < length) {
      initial.push('');
    }
    return initial;
  };

  const [otpValues, setOtpValues] = useState(getInitialOtpValues);
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef([]);
  const uniqueId = id || `otp-${Math.random().toString(36).substring(2, 9)}`;

  // Sync with external value prop change
  useEffect(() => {
    setOtpValues(getInitialOtpValues());
    // Optionally reset focus if value clears, or focus first empty
    // if (value === '') setActiveInput(0);
  }, [value, length]);

  // Focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
      setActiveInput(0);
    }
  }, [autoFocus]);

  // Handle input change
  const handleChange = (index, newValue) => {
    if (!/^\d*$/.test(newValue)) return; // Only allow digits

    const newOtpValues = [...otpValues];
    newOtpValues[index] = newValue.slice(-1); // Take only the last digit entered
    setOtpValues(newOtpValues);

    // Notify parent
    const otpString = newOtpValues.join("");
    if (onChange) {
      onChange(otpString);
    }

    // Auto-move to next input if a digit was entered
    if (newValue && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
      // setActiveInput(index + 1); // Focus handler will set active input
    }
  };

  // Handle focus
  const handleFocus = (index) => {
    setActiveInput(index);
    // Select the content on focus for easier replacement
    inputRefs.current[index]?.select();
  };

  // Handle key down
  const handleKeyDown = (index, e) => {
    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        const newOtpValues = [...otpValues];
        if (otpValues[index]) {
          newOtpValues[index] = ""; // Clear current input
        } else if (index > 0) {
          // If current is empty, move to previous and clear it
          newOtpValues[index - 1] = "";
          inputRefs.current[index - 1]?.focus();
        }
        setOtpValues(newOtpValues);
        if (onChange) onChange(newOtpValues.join(""));
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (index > 0) inputRefs.current[index - 1]?.focus();
        break;

      case "ArrowRight":
        e.preventDefault();
        if (index < length - 1) inputRefs.current[index + 1]?.focus();
        break;

      case "Home":
        e.preventDefault();
        inputRefs.current[0]?.focus();
        break;

      case "End":
        e.preventDefault();
        inputRefs.current[length - 1]?.focus();
        break;

      // Allow digit entry (handled by onChange) and other standard keys
      default:
        // Prevent non-digit keys unless they are navigation/control keys
        if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
           // Allow pasting (handled separately)
           if (!( (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v')) {
               e.preventDefault();
           }
        }
        break;
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim().replace(/\D/g, ''); // Get only digits

    if (pastedData) {
      const newOtpValues = [...otpValues];
      let nextFocusIndex = activeInput; // Start pasting from current focus

      for (let i = 0; i < pastedData.length; i++) {
        const pasteIndex = nextFocusIndex + i;
        if (pasteIndex < length) {
          newOtpValues[pasteIndex] = pastedData[i];
          nextFocusIndex = pasteIndex; // Update last filled index
        } else {
          break; // Stop if paste data exceeds OTP length
        }
      }

      setOtpValues(newOtpValues);

      // Focus the next empty input or the last filled one
      let focusTargetIndex = newOtpValues.findIndex(val => val === '');
      if (focusTargetIndex === -1) { // All filled
          focusTargetIndex = length - 1;
      } else if (focusTargetIndex <= nextFocusIndex) { // If paste filled up to or beyond first empty
          focusTargetIndex = Math.min(nextFocusIndex + 1, length - 1);
      }


      inputRefs.current[focusTargetIndex]?.focus();

      if (onChange) onChange(newOtpValues.join(""));
    }
  };


  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex gap-2 justify-center ${className}`;
  const inputBaseClasses = "w-10 h-12 text-xl text-center border rounded outline-none transition-all duration-200 ease-in-out"; // Adjusted size
  const inputStateClasses = (index) => error ? 'border-red-600' : activeInput === index ? 'border-blue-600 ring-2 ring-blue-300' : 'border-neutral-300'; // Adjusted focus ring
  const errorClasses = "text-xs text-red-600 mt-2 text-center";

  return (
    <div {...rest}>
      <div
        className={containerClasses}
        // Paste handled on individual inputs might be more reliable across browsers
        // onPaste={handlePaste}
        role="group"
        aria-labelledby={`${uniqueId}-label`} // Assuming a label exists elsewhere
        aria-describedby={error ? `${uniqueId}-error` : undefined}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text" // Use text for better control, pattern restricts
            inputMode="numeric"
            pattern="[0-9]*" // Helps mobile keyboards
            maxLength={1}
            value={otpValues[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onFocus={() => handleFocus(index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste} // Handle paste on each input
            className={`${inputBaseClasses} ${inputStateClasses(index)}`}
            aria-label={`Digit ${index + 1} of ${length}`}
            id={`${uniqueId}-input-${index}`}
            autoComplete={index === 0 ? "one-time-code" : "off"} // Hint for browsers
          />
        ))}
      </div>

      {error && (
        <div id={`${uniqueId}-error`} className={errorClasses} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
