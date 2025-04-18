// Button component from original Button.tsx file
import { addPropertyControls, ControlType } from "framer"
import { useState } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function Button(props) {
  const {
    text = "Button",
    rightIcon = false,
    leftIcon = false,
    primaryColor = tokens.colors.blue[600],
    textColor = "#FFFFFF",
    width = "100%",
    height = "auto",
    disabled = false,
    variant = "primary", // primary, secondary, outline
    onClick,
    style,
    ...rest
  } = props

  // Determine the button style based on the variant
  const getButtonStyle = () => {
    const baseStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
      borderRadius: tokens.borderRadius.DEFAULT,
      fontFamily: "Geist, sans-serif",
      fontWeight: tokens.fontWeight.medium,
      fontSize: tokens.fontSize.base,
      letterSpacing: "-0.03em",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      width,
      height,
      opacity: disabled ? 0.7 : 1,
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: primaryColor,
          color: textColor,
          border: "none",
        }
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: tokens.colors.neutral[100],
          color: tokens.colors.neutral[900],
          border: "none",
        }
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          color: primaryColor,
          border: `1px solid ${primaryColor}`,
        }
      default:
        return baseStyle
    }
  }

  return (
    <button
      style={{ ...getButtonStyle(), ...style }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      {...rest}
    >
      {leftIcon && <span style={{ marginRight: 8 }}>{leftIcon}</span>}
      {text}
      {rightIcon && (
        <span style={{ marginLeft: 8 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.16669 10H15.8334"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 4.16669L15.8333 10L10 15.8334"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  )
}

addPropertyControls(Button, {
  text: {
    type: ControlType.String,
    title: "Text",
    defaultValue: "Button",
  },
  rightIcon: {
    type: ControlType.Boolean,
    title: "Right Icon",
    defaultValue: false,
  },
  leftIcon: {
    type: ControlType.Boolean,
    title: "Left Icon",
    defaultValue: false,
  },
  primaryColor: {
    type: ControlType.Color,
    title: "Primary Color",
    defaultValue: tokens.colors.blue[600],
  },
  textColor: {
    type: ControlType.Color,
    title: "Text Color",
    defaultValue: "#FFFFFF",
  },
  width: {
    type: ControlType.String,
    title: "Width",
    defaultValue: "100%",
  },
  height: {
    type: ControlType.String,
    title: "Height",
    defaultValue: "auto",
  },
  disabled: {
    type: ControlType.Boolean,
    title: "Disabled",
    defaultValue: false,
  },
  variant: {
    type: ControlType.Enum,
    title: "Variant",
    options: ["primary", "secondary", "outline"],
    defaultValue: "primary",
  },
})
