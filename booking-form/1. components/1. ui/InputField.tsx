// InputField component with ShadCN styling and improved accessibility
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
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
    description = "",
    required = false,
    disabled = false,
    borderColor = tokens.colors.neutral[300],
    focusBorderColor = tokens.colors.blue[600],
    errorBorderColor = tokens.colors.red[600],
    labelColor = tokens.colors.neutral[700],
    placeholderColor = tokens.colors.neutral[400],
    backgroundColor = "#FAFAFA",
    id,
    name,
    maxLength,
    minLength,
    pattern,
    readOnly = false,
    autocomplete,
    autoFocus = false,
    style,
    ...rest
  } = props

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const uniqueId = id || `input-${Math.random().toString(36).substring(2, 9)}`

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
    position: "relative",
    width: "100%",
  }

  const inputStyle = {
    width: "100%",
    height: "64px",
    padding: `0 ${tokens.spacing[5]}`,
    fontSize: "18px",
    fontFamily: "Geist, sans-serif",
    letterSpacing: "-0.03em",
    borderRadius: tokens.borderRadius.lg,
    border: `0.5px solid ${error ? errorBorderColor : isFocused ? focusBorderColor : borderColor}`,
    outline: "none",
    backgroundColor,
    color: tokens.colors.neutral[900],
    boxShadow: isFocused
      ? `0px 0px 0px 3px ${tokens.colors.blue[400]}`
      : "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    opacity: disabled ? 0.7 : 1,
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
          <div style={descriptionStyle}>{description}</div>
        )}
      </div>

      <div style={inputContainerStyle}>
        <input
          id={uniqueId}
          type={type}
          name={name || uniqueId}
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autocomplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${uniqueId}-error`
              : description
                ? `${uniqueId}-description`
                : undefined
          }
          style={inputStyle}
        />
        <div style={floatingLabelStyle}>{placeholder}</div>
      </div>

      {error && (
        <div id={`${uniqueId}-error`} style={errorStyle} role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

addPropertyControls(InputField, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "Label",
  },
  description: {
    type: ControlType.String,
    title: "Description",
    defaultValue: "",
  },
  placeholder: {
    type: ControlType.String,
    title: "Placeholder",
    defaultValue: "Placeholder",
  },
  type: {
    type: ControlType.Enum,
    title: "Type",
    options: [
      "text",
      "email",
      "password",
      "number",
      "tel",
      "url",
      "date",
      "time",
      "search",
    ],
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
  readOnly: {
    type: ControlType.Boolean,
    title: "Read Only",
    defaultValue: false,
  },
  autoFocus: {
    type: ControlType.Boolean,
    title: "Auto Focus",
    defaultValue: false,
  },
  maxLength: {
    type: ControlType.Number,
    title: "Max Length",
    defaultValue: null,
  },
  minLength: {
    type: ControlType.Number,
    title: "Min Length",
    defaultValue: null,
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
  autocomplete: {
    type: ControlType.String,
    title: "Autocomplete",
    defaultValue: "",
  },
})
