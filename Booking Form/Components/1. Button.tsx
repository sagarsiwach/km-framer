// Button.tsx (enhanced version)

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

  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Determine the button style based on the variant and interaction state
  const getButtonStyle = () => {
    const baseStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
      borderRadius: tokens.borderRadius.DEFAULT,
      fontWeight: tokens.fontWeight.medium,
      fontSize: tokens.fontSize.base,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      width,
      height,
      opacity: disabled ? 0.7 : 1,
      outline: isFocused
        ? `2px solid ${tokens.colors.blue[300]}`
        : "none",
      outlineOffset: isFocused ? "2px" : "0",
    }

    const getInteractionColors = (baseColor, hoverColor, pressedColor) => {
      if (disabled) return baseColor
      if (isPressed) return pressedColor
      if (isHovered) return hoverColor
      return baseColor
    }

    // Get colors for the current variant
    switch (variant) {
      case "primary":
        const primaryBase = primaryColor
        const primaryHover = tokens.colors.blue[700]
        const primaryPressed = tokens.colors.blue[800]

        return {
          ...baseStyle,
          backgroundColor: getInteractionColors(
            primaryBase,
            primaryHover,
            primaryPressed
          ),
          color: textColor,
          border: "none",
        }

      case "secondary":
        const secondaryBase = tokens.colors.neutral[100]
        const secondaryHover = tokens.colors.neutral[200]
        const secondaryPressed = tokens.colors.neutral[300]

        return {
          ...baseStyle,
          backgroundColor: getInteractionColors(
            secondaryBase,
            secondaryHover,
            secondaryPressed
          ),
          color: tokens.colors.neutral[900],
          border: "none",
        }

      case "outline":
        const outlineBase = "transparent"
        const outlineHover = tokens.colors.neutral[50]
        const outlinePressed = tokens.colors.neutral[100]

        return {
          ...baseStyle,
          backgroundColor: getInteractionColors(
            outlineBase,
            outlineHover,
            outlinePressed
          ),
          color: primaryColor,
          border: `1px solid ${primaryColor}`,
        }

      default:
        return baseStyle
    }
  }

  // Arrow icon for right icon
  const ArrowIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      style={{ marginLeft: 8 }}
    >
      <path
        d="M10 3.33337L8.83334 4.50004L13.6667 9.33337H3.33334V11H13.6667L8.83334 15.8334L10 17L17 10L10 3.33337Z"
        fill="currentColor"
      />
    </svg>
  )

  return (
    <button
      style={{ ...getButtonStyle(), ...style }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-disabled={disabled}
      {...rest}
    >
      {leftIcon && <span style={{ marginRight: 8 }}>{leftIcon}</span>}
      {text}
      {rightIcon && <ArrowIcon />}
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
