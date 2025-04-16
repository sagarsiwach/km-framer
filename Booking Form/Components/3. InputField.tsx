import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function InputField(props) {
  const {
    label = "Label",
    placeholder = "Placeholder",
    type = "text",
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
    setInputValue(e.target.value)
    if (onChange) {
      onChange(e.target.value)
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

  const inputStyle = {
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.DEFAULT,
    fontSize: tokens.fontSize.base,
    border: `1px solid ${error
        ? errorBorderColor
        : isFocused
          ? focusBorderColor
          : borderColor
      }`,
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
      <input
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        style={inputStyle}
        {...rest}
      />
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  )
}

addPropertyControls(InputField, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "Label",
  },
  placeholder: {
    type: ControlType.String,
    title: "Placeholder",
    defaultValue: "Placeholder",
  },
  type: {
    type: ControlType.Enum,
    title: "Type",
    options: ["text", "email", "password", "number", "tel", "url"],
    defaultValue: "text",
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
