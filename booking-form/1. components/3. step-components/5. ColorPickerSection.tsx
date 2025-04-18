// Color picker section component
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import ColorSelector from "https://framer.com/m/ColorSelector-P1Up.js"
import SectionTitle from "https://framer.com/m/SectionTitle-OVrp.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function ColorPickerSection(props) {
  const {
    title = "FINISH",
    colors = [],
    selectedColorId = "",
    onSelect,
    style,
    ...rest
  } = props

  // Transform colors data for ColorSelector component
  const transformedColors = colors.map((color) => {
    let colorValue = "#f00027" // Default fallback
    let endValue = "#d00020" // Default fallback end

    try {
      if (color.color_value) {
        const parsed = JSON.parse(color.color_value)
        colorValue = parsed.colorStart || colorValue
        endValue = parsed.colorEnd || endValue
      }
    } catch (e) {
      console.error("Error parsing color value:", e)
    }

    return {
      id: color.id,
      name: color.name,
      value: colorValue,
      endValue: endValue,
    }
  })

  // Get selected color name for display
  const selectedColor = colors.find((c) => c.id === selectedColorId)
  const selectedColorName = selectedColor ? selectedColor.name : ""

  return (
    <div style={style} {...rest}>
      <SectionTitle title={title} />

      {selectedColorId && (
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: tokens.spacing[3],
            color: tokens.colors.neutral[900],
          }}
        >
          {selectedColorName}
        </div>
      )}

      <ColorSelector
        colors={transformedColors}
        selectedColorId={selectedColorId}
        onChange={onSelect}
      />

      {colors.length === 0 && (
        <div
          style={{
            padding: tokens.spacing[4],
            textAlign: "center",
            color: tokens.colors.neutral[500],
            fontSize: tokens.fontSize.sm,
          }}
        >
          No colors available. Please select a vehicle first.
        </div>
      )}
    </div>
  )
}

addPropertyControls(ColorPickerSection, {
  title: {
    type: ControlType.String,
    title: "Section Title",
    defaultValue: "FINISH",
  },
  colors: {
    type: ControlType.Array,
    title: "Colors",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        name: { type: ControlType.String },
        color_value: { type: ControlType.String },
      },
    },
    defaultValue: [],
  },
  selectedColorId: {
    type: ControlType.String,
    title: "Selected Color ID",
    defaultValue: "",
  },
})
