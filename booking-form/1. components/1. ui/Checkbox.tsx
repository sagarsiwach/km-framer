// Checkbox component with ShadCN styling and improved accessibility
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
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
    checkboxColor = tokens.colors.blue[600],
    borderColor = tokens.colors.neutral[300],
    errorColor = tokens.colors.red[600],
    id,
    name,
    style,
    ...rest
  } = props

  const [isChecked, setIsChecked] = useState(checked)
  const uniqueId =
    id || `checkbox-${Math.random().toString(36).substring(2, 9)}`

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleChange = (e) => {
    if (disabled) return

    const newValue = e.target.checked
    setIsChecked(newValue)

    if (onChange) {
      onChange(newValue)
    }
  }

  const containerStyle = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: tokens.spacing[4],
    ...style,
  }

  const checkboxContainerStyle = {
    position: "relative",
    width: "20px",
    height: "20px",
    marginRight: tokens.spacing[3],
    marginTop: "2px", // Align with text
    flexShrink: 0,
  }

  const innerCheckboxStyle = {
    position: "absolute",
    width: "20px",
    height: "20px",
    opacity: 0,
    cursor: disabled ? "not-allowed" : "pointer",
  }

  const customCheckboxStyle = {
    width: "20px",
    height: "20px",
    border: `1.5px solid ${error ? errorColor : borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    backgroundColor: isChecked ? checkboxColor : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    pointerEvents: "none", // Makes the custom checkbox non-interactive
  }

  const labelContainerStyle = {
    display: "flex",
    flexDirection: "column",
  }

  const labelStyle = {
    fontSize: tokens.fontSize.sm,
    fontFamily: "Geist, sans-serif",
    color: tokens.colors.neutral[900],
    lineHeight: "1.8",
    fontWeight: tokens.fontWeight.light,
  }

  const descriptionStyle = {
    fontSize: tokens.fontSize.xs,
    fontFamily: "Geist, sans-serif",
    color: tokens.colors.neutral[500],
    marginTop: tokens.spacing[1],
  }

  const errorStyle = {
    color: errorColor,
    fontSize: tokens.fontSize.xs,
    fontFamily: "Geist, sans-serif",
    marginTop: tokens.spacing[1],
  }

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
  )

  return (
    <div {...rest}>
      <div style={containerStyle}>
        <div style={checkboxContainerStyle}>
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
              error ? `${uniqueId}-error` : undefined
            }
            style={innerCheckboxStyle}
          />
          <div style={customCheckboxStyle} aria-hidden="true">
            {checkmarkIcon}
          </div>
        </div>
        <div style={labelContainerStyle}>
          <label htmlFor={uniqueId} style={labelStyle}>
            {label}{" "}
            {required && (
              <span style={{ color: errorColor }}>*</span>
            )}
          </label>
          {description && (
            <div style={descriptionStyle}>{description}</div>
          )}
        </div>
      </div>
      {error && (
        <div id={`${uniqueId}-error`} style={errorStyle} role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

addPropertyControls(Checkbox, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "I agree to the terms and conditions",
  },
  description: {
    type: ControlType.String,
    title: "Description",
    defaultValue: "",
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
  name: {
    type: ControlType.String,
    title: "Input Name",
    defaultValue: "",
  },
  id: {
    type: ControlType.String,
    title: "Input ID",
    defaultValue: "",
  },
})
