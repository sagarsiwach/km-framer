// Checkbox component for terms/conditions acceptance
import { useState, useEffect } from "react";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function Checkbox(props) {
  const {
    label = "I agree to the terms and conditions",
    checked = false,
    onChange,
    error = "",
    required = false,
    disabled = false,
    checkboxColor = tokens.colors.blue[600],
    borderColor = tokens.colors.neutral[300],
    errorColor = tokens.colors.red[600],
    style,
    ...rest
  } = props;

  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;

    const newValue = !isChecked;
    setIsChecked(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  const containerStyle = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: tokens.spacing[4],
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    ...style,
  };

  const checkboxContainerStyle = {
    position: "relative",
    width: "20px",
    height: "20px",
    marginRight: tokens.spacing[3],
    marginTop: "2px", // Align with text
    flexShrink: 0,
  };

  const checkboxStyle = {
    width: "20px",
    height: "20px",
    border: `1.5px solid ${error ? errorColor : borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    backgroundColor: isChecked ? checkboxColor : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const labelStyle = {
    fontSize: tokens.fontSize.sm,
    fontFamily: "Geist, sans-serif",
    color: tokens.colors.neutral[900],
    lineHeight: "1.4",
  };

  const errorStyle = {
    color: errorColor,
    fontSize: tokens.fontSize.xs,
    fontFamily: "Geist, sans-serif",
    marginTop: tokens.spacing[1],
    marginLeft: "28px", // Align with label text
  };

  // Checkmark icon
  const checkmarkIcon = isChecked && (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div {...rest}>
      <div style={containerStyle} onClick={handleChange}>
        <div style={checkboxContainerStyle}>
          <div style={checkboxStyle}>{checkmarkIcon}</div>
        </div>
        <div style={labelStyle}>
          {label} {required && <span style={{ color: errorColor }}>*</span>}
        </div>
      </div>
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}

addPropertyControls(Checkbox, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "I agree to the terms and conditions",
  },
  checked: {
    type: ControlType.Boolean,
    title: "Checked",
    defaultValue: false,
  },
  error: {
    type: ControlType.String,
    title: "Error Message",
    defaultValue: "",
  },
  required: {
    type: ControlType.Boolean,
    title: "Required",
    defaultValue: false,
  },
  disabled: {
    type: ControlType.Boolean,
    title: "Disabled",
    defaultValue: false,
  },
  checkboxColor: {
    type: ControlType.Color,
    title: "Checkbox Color",
    defaultValue: tokens.colors.blue[600],
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: tokens.colors.neutral[300],
  },
  errorColor: {
    type: ControlType.Color,
    title: "Error Color",
    defaultValue: tokens.colors.red[600],
  },
});
