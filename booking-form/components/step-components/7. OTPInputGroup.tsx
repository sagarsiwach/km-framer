// OTP input group component
import { useState, useEffect, useRef } from "react";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function OTPInputGroup(props) {
  const {
    value = "",
    length = 6,
    onChange,
    autoFocus = true,
    error = "",
    borderColor = tokens.colors.neutral[300],
    focusBorderColor = tokens.colors.blue[600],
    errorBorderColor = tokens.colors.red[600],
    style,
    ...rest
  } = props;

  // Convert string value to array of characters
  const [otpValues, setOtpValues] = useState(
    value.split("").length > 0
      ? value.split("").slice(0, length)
      : Array(length).fill(""),
  );

  // Refs for OTP inputs
  const inputRefs = useRef([]);

  // Update OTP values when value prop changes
  useEffect(() => {
    const newOtpValues = value.split("").slice(0, length);
    if (newOtpValues.length < length) {
      newOtpValues.push(...Array(length - newOtpValues.length).fill(""));
    }
    setOtpValues(newOtpValues);
  }, [value, length]);

  // Focus first input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Handle OTP input change
  const handleChange = (index, newValue) => {
    // Only allow digits
    if (!/^\d*$/.test(newValue)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = newValue.slice(0, 1);
    setOtpValues(newOtpValues);

    // Auto-move to next input
    if (newValue && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Notify parent of change
    if (onChange) {
      onChange(newOtpValues.join(""));
    }
  };

  // Handle key down events for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, length).split("");
      const newOtpValues = [...otpValues];

      digits.forEach((digit, index) => {
        if (index < length) {
          newOtpValues[index] = digit;
        }
      });

      setOtpValues(newOtpValues);

      // Focus last filled input or next empty one
      const lastIndex = Math.min(digits.length, length - 1);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }

      // Notify parent of change
      if (onChange) {
        onChange(newOtpValues.join(""));
      }
    }
  };

  const containerStyle = {
    display: "flex",
    gap: tokens.spacing[2],
    justifyContent: "center",
    ...style,
  };

  const inputStyle = {
    width: "40px",
    height: "48px",
    fontSize: tokens.fontSize.xl,
    textAlign: "center",
    border: `1px solid ${error ? errorBorderColor : borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    outline: "none",
  };

  const errorStyle = {
    color: errorBorderColor,
    fontSize: tokens.fontSize.sm,
    marginTop: tokens.spacing[2],
    textAlign: "center",
  };

  return (
    <div {...rest}>
      <div style={containerStyle} onPaste={handlePaste}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={otpValues[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            style={inputStyle}
          />
        ))}
      </div>

      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}

addPropertyControls(OTPInputGroup, {
  value: {
    type: ControlType.String,
    title: "Value",
    defaultValue: "",
  },
  length: {
    type: ControlType.Number,
    title: "Length",
    defaultValue: 6,
    min: 4,
    max: 10,
    step: 1,
  },
  autoFocus: {
    type: ControlType.Boolean,
    title: "Auto Focus",
    defaultValue: true,
  },
  error: {
    type: ControlType.String,
    title: "Error",
    defaultValue: "",
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: tokens.colors.neutral[300],
  },
  focusBorderColor: {
    type: ControlType.Color,
    title: "Focus Border Color",
    defaultValue: tokens.colors.blue[600],
  },
  errorBorderColor: {
    type: ControlType.Color,
    title: "Error Border Color",
    defaultValue: tokens.colors.red[600],
  },
});
