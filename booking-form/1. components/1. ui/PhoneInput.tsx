// PhoneInput component with ShadCN styling and improved accessibility
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
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
    borderColor = tokens.colors.neutral[300],
    focusBorderColor = tokens.colors.blue[600],
    errorBorderColor = tokens.colors.red[600],
    labelColor = tokens.colors.neutral[900],
    placeholderColor = tokens.colors.neutral[400],
    backgroundColor = "#FAFAFA",
    id,
    name,
    style,
    ...rest
  } = props

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const uniqueId =
    id || `phone-input-${Math.random().toString(36).substring(2, 9)}`

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e) => {
    // Only allow numbers
    const newValue = e.target.value.replace(/[^0-9]/g, "")
    setInputValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    marginBottom: tokens.spacing[4],
    width: "100%",
    ...style,
  }

  const labelContainerStyle = {
    marginBottom: tokens.spacing[2],
  }

  const labelStyle = {
    fontSize: "12px",
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: "0.72px",
    textTransform: "uppercase",
    color: labelColor,
    display: "block",
  }

  const descriptionStyle = {
    fontSize: tokens.fontSize.xs,
    fontFamily: "Geist, sans-serif",
    color: tokens.colors.neutral[500],
    marginTop: "2px",
  }

  const inputContainerStyle = {
    display: "flex",
    height: "64px",
    borderRadius: tokens.borderRadius.lg,
    overflow: "hidden",
    border: `0.5px solid ${error ? errorBorderColor : isFocused ? focusBorderColor : borderColor}`,
    boxShadow: isFocused
      ? `0px 0px 0px 3px ${tokens.colors.blue[400]}`
      : "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    opacity: disabled ? 0.7 : 1,
    backgroundColor,
  }

  const countryCodeStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `0 ${tokens.spacing[4]}`,
    backgroundColor: tokens.colors.neutral[100],
    color: tokens.colors.neutral[900],
    fontWeight: tokens.fontWeight.medium,
    fontSize: "18px",
    fontFamily: "Geist, sans-serif",
    borderRight: `1px solid ${borderColor}`,
  }

  const inputStyle = {
    flex: 1,
    padding: `0 ${tokens.spacing[5]}`,
    fontSize: "18px",
    fontFamily: "Geist, sans-serif",
    letterSpacing: "-0.03em",
    border: "none",
    outline: "none",
    backgroundColor,
    color: tokens.colors.neutral[900],
  }

  const floatingLabelStyle = {
    position: "absolute",
    left: tokens.spacing[5],
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: placeholderColor,
    fontSize: "18px",
    fontFamily: "Geist, sans-serif",
    transition: "all 0.2s ease",
    opacity: inputValue || isFocused ? 0 : 1,
  }

  const errorStyle = {
    color: errorBorderColor,
    fontSize: tokens.fontSize.xs,
    fontFamily: "Geist, sans-serif",
    marginTop: tokens.spacing[1],
  }

  return (
    <div style={containerStyle} {...rest}>
      <div style={labelContainerStyle}>
        {label && (
          <label htmlFor={uniqueId} style={labelStyle}>
            {label}{" "}
            {required && (
              <span style={{ color: errorBorderColor }}>*</span>
            )}
          </label>
        )}
        {description && (
          <div
            id={`${uniqueId}-description`}
            style={descriptionStyle}
          >
            {description}
          </div>
        )}
      </div>

      <div style={inputContainerStyle}>
        <div style={countryCodeStyle} aria-hidden="true">
          {countryCode}
        </div>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            id={uniqueId}
            type="tel"
            name={name || uniqueId}
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${uniqueId}-error`
                : description
                  ? `${uniqueId}-description`
                  : undefined
            }
            style={inputStyle}
            maxLength={10}
            autoComplete="tel"
            placeholder=""
          />
          <div style={floatingLabelStyle}>{placeholder}</div>
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

addPropertyControls(PhoneInput, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "Mobile Number",
  },
  description: {
    type: ControlType.String,
    title: "Description",
    defaultValue: "",
  },
  placeholder: {
    type: ControlType.String,
    title: "Placeholder",
    defaultValue: "Phone number",
  },
  countryCode: {
    type: ControlType.String,
    title: "Country Code",
    defaultValue: "+91",
  },
  value: {
    type: ControlType.String,
    title: "Value",
    defaultValue: "",
  },
  error: {
    type: ControlType.String,
    title: "Error",
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
  backgroundColor: {
    type: ControlType.Color,
    title: "Background Color",
    defaultValue: "#FAFAFA",
  },
  id: {
    type: ControlType.String,
    title: "ID",
    defaultValue: "",
  },
  name: {
    type: ControlType.String,
    title: "Name",
    defaultValue: "",
  },
})
