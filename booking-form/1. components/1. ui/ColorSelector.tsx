// ColorSelector component with ShadCN styling and improved accessibility
import { useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function ColorSelector(props) {
  const {
    label = "Color",
    colors = [
      {
        id: "red",
        name: "Glossy Red",
        value: "#9B1C1C",
        endValue: "#7B1818",
      },
      {
        id: "black",
        name: "Matte Black",
        value: "#1F2937",
        endValue: "#111827",
      },
    ],
    selectedColorId = "",
    onChange,
    id,
    style,
    ...rest
  } = props

  const [focusedIndex, setFocusedIndex] = useState(-1)
  const uniqueId =
    id || `color-selector-${Math.random().toString(36).substring(2, 9)}`

  const containerStyle = {
    marginBottom: tokens.spacing[6],
    ...style,
  }

  const labelStyle = {
    fontSize: tokens.fontSize.sm,
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[3],
  }

  const titleStyle = {
    fontFamily: "Geist, sans-serif",
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[4],
  }

  const colorsContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacing[4],
  }

  const colorRowStyle = {
    display: "flex",
    gap: tokens.spacing[3],
  }

  const getColorStyle = (color, endValue, isSelected, isFocused) => {
    // Use the specific conic gradient from your provided code
    const colorGradient = `conic-gradient(from 174.33deg at 46.25% 0%, ${endValue || "#0A0A0A"} -179.01deg, ${color || "#737373"} 180deg, ${endValue || "#0A0A0A"} 180.99deg, ${color || "#737373"} 540deg)`

    return {
      width: 100,
      height: 100,
      borderRadius: 10, // Using 10px as specified in your CSS
      background: colorGradient,
      cursor: "pointer",
      boxShadow: isFocused
        ? `0 0 0 3px ${tokens.colors.blue[400]}`
        : isSelected
          ? `0 0 0 3px ${tokens.colors.blue[600]}`
          : "none",
      transition: "all 0.2s ease",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "20px",
      gap: "20px",
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault()
        if (onChange) {
          onChange(colors[index].id)
        }
        break
      case "ArrowRight":
        e.preventDefault()
        if (index < colors.length - 1) {
          setFocusedIndex(index + 1)
          document
            .getElementById(`${uniqueId}-color-${index + 1}`)
            .focus()
        }
        break
      case "ArrowLeft":
        e.preventDefault()
        if (index > 0) {
          setFocusedIndex(index - 1)
          document
            .getElementById(`${uniqueId}-color-${index - 1}`)
            .focus()
        }
        break
      default:
        break
    }
  }

  // Find selected color name for display
  const selectedColor = colors.find((color) => color.id === selectedColorId)
  const selectedColorName = selectedColor ? selectedColor.name : ""

  return (
    <div
      style={containerStyle}
      role="region"
      aria-labelledby={`${uniqueId}-label`}
      {...rest}
    >
      {label && (
        <div id={`${uniqueId}-label`} style={labelStyle}>
          {label}
        </div>
      )}

      {selectedColorId && (
        <div style={titleStyle}>{selectedColorName}</div>
      )}

      <div style={colorsContainerStyle}>
        <div
          style={colorRowStyle}
          role="radiogroup"
          aria-labelledby={`${uniqueId}-label`}
        >
          {colors.map((color, index) => (
            <div
              key={color.id}
              id={`${uniqueId}-color-${index}`}
              style={getColorStyle(
                color.value,
                color.endValue,
                color.id === selectedColorId,
                index === focusedIndex
              )}
              onClick={() => onChange && onChange(color.id)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="radio"
              aria-checked={color.id === selectedColorId}
              aria-label={color.name}
              tabIndex={0}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

addPropertyControls(ColorSelector, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "Color",
  },
  colors: {
    type: ControlType.Array,
    title: "Colors",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        name: { type: ControlType.String },
        value: { type: ControlType.Color },
        endValue: { type: ControlType.Color },
      },
    },
    defaultValue: [
      {
        id: "red",
        name: "Glossy Red",
        value: "#9B1C1C",
        endValue: "#7B1818",
      },
      {
        id: "black",
        name: "Matte Black",
        value: "#1F2937",
        endValue: "#111827",
      },
    ],
  },
  selectedColorId: {
    type: ControlType.String,
    title: "Selected Color ID",
    defaultValue: "",
  },
  id: {
    type: ControlType.String,
    title: "ID",
    defaultValue: "",
  },
})
