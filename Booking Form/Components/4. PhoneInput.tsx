import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
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
    required = false,
    disabled = false,
    borderColor = tokens.colors.neutral[300],
    focusBorderColor = tokens.colors.blue[600],
    errorBorderColor = tokens.colors.red[600],
    labelColor = tokens.colors.neutral[900],
    placeholderColor = tokens.colors.neutral[400],
    backgroundColor = "#FFFFFF",
    style,
    ...rest
  } = props

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState(value)

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

  const labelStyle = {
    marginBottom: tokens.spacing[2],
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: labelColor,
  }

  const inputContainerStyle = {
    display: "flex",
    width: "100%",
    borderRadius: tokens.borderRadius.DEFAULT,
    border: `1px solid ${error
        ? errorBorderColor
        : isFocused
          ? focusBorderColor
          : borderColor
      }`,
    overflow: "hidden",
  }

  const countryCodeStyle = {
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.neutral[100],
    color: tokens.colors.neutral[900],
    fontWeight: tokens.fontWeight.medium,
    borderRight: `1px solid ${borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const inputStyle = {
    padding: tokens.spacing[4],
    fontSize: tokens.fontSize.base,
    border: "none",
    outline: "none",
    backgroundColor,
    color: tokens.colors.neutral[900],
    width: "100%",
    boxSizing: "border-box",
    opacity: disabled ? 0.7 : 1,
  }

  const errorStyle = {
    color: errorBorderColor,
    fontSize: tokens.fontSize.xs,
    marginTop: tokens.spacing[1],
  }

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle}>
          {label}{" "}
          {required && (
            <span style={{ color: errorBorderColor }}>*</span>
          )}
        </label>
      )}
      <div style={inputContainerStyle}>
        <div style={countryCodeStyle}>{countryCode}</div>
        <input
          type="tel"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          style={inputStyle}
          maxLength={10}
          {...rest}
        />
      </div>
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  )
}

addPropertyControls(PhoneInput, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "Mobile Number",
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
    defaultValue: "#FFFFFF",
  },
})
