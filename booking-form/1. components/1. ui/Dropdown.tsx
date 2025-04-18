// Dropdown component for form selections
import { useState, useRef, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function Dropdown(props) {
  const {
    label = "Label",
    options = [],
    value = "",
    onChange,
    placeholder = "Select an option",
    error = "",
    required = false,
    disabled = false,
    borderColor = tokens.colors.neutral[300],
    focusBorderColor = tokens.colors.blue[600],
    errorBorderColor = tokens.colors.red[600],
    labelColor = tokens.colors.neutral[700],
    style,
    ...rest
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Find the selected option for display
  const selectedOption = options.find((option) => option.value === value)
  const displayText = selectedOption ? selectedOption.label : placeholder

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleOptionClick = (optionValue) => {
    if (onChange) {
      onChange(optionValue)
    }
    setIsOpen(false)
  }

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    marginBottom: tokens.spacing[4],
    width: "100%",
    position: "relative",
    ...style,
  }

  const labelStyle = {
    marginBottom: tokens.spacing[2],
    fontSize: "12px",
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: "0.72px",
    textTransform: "uppercase",
    color: labelColor,
  }

  const dropdownTriggerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "64px",
    padding: `0 ${tokens.spacing[5]}`,
    borderRadius: tokens.borderRadius.lg,
    border: `0.5px solid ${error ? errorBorderColor : isOpen ? focusBorderColor : borderColor}`,
    backgroundColor: "#FAFAFA",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    boxShadow: isOpen
      ? `0px 0px 0px 3px ${tokens.colors.blue[400]}`
      : "none",
  }

  const dropdownValueStyle = {
    fontSize: "18px",
    fontFamily: "Geist, sans-serif",
    letterSpacing: "-0.03em",
    color: selectedOption
      ? tokens.colors.neutral[900]
      : tokens.colors.neutral[400],
  }

  const dropdownMenuStyle = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    width: "100%",
    maxHeight: "200px",
    overflowY: "auto",
    backgroundColor: "white",
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${borderColor}`,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 10,
    display: isOpen ? "block" : "none",
  }

  const optionStyle = (isSelected) => ({
    padding: tokens.spacing[4],
    fontSize: tokens.fontSize.base,
    fontFamily: "Geist, sans-serif",
    cursor: "pointer",
    backgroundColor: isSelected
      ? tokens.colors.neutral[100]
      : "transparent",
    color: tokens.colors.neutral[900],
    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
    ":hover": {
      backgroundColor: tokens.colors.neutral[50],
    },
  })

  const errorStyle = {
    color: errorBorderColor,
    fontSize: tokens.fontSize.xs,
    fontFamily: "Geist, sans-serif",
    marginTop: tokens.spacing[1],
  }

  // Chevron icon
  const chevronIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke={tokens.colors.neutral[500]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <div style={containerStyle} ref={dropdownRef} {...rest}>
      {label && (
        <label style={labelStyle}>
          {label}{" "}
          {required && (
            <span style={{ color: errorBorderColor }}>*</span>
          )}
        </label>
      )}

      <div
        style={dropdownTriggerStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div style={dropdownValueStyle}>{displayText}</div>
        {chevronIcon}
      </div>

      <div style={dropdownMenuStyle}>
        {options.map((option) => (
          <div
            key={option.value}
            style={optionStyle(option.value === value)}
            onClick={() => handleOptionClick(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>

      {error && <div style={errorStyle}>{error}</div>}
    </div>
  )
}

addPropertyControls(Dropdown, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "Label",
  },
  options: {
    type: ControlType.Array,
    title: "Options",
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String },
        value: { type: ControlType.String },
      },
    },
    defaultValue: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
      { label: "Option 3", value: "option3" },
    ],
  },
  value: {
    type: ControlType.String,
    title: "Selected Value",
    defaultValue: "",
  },
  placeholder: {
    type: ControlType.String,
    title: "Placeholder",
    defaultValue: "Select an option",
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
})
