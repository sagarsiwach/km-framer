// ColorSelector component from original ColorSelector.tsx file
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";

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
    style,
    ...rest
  } = props;

  const containerStyle = {
    marginBottom: tokens.spacing[6],
    ...style,
  };

  const labelStyle = {
    fontSize: tokens.fontSize.sm,
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[3],
  };

  const titleStyle = {
    fontFamily: "Geist, sans-serif",
    fontSize: tokens.fontSize.xl,
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[4],
  };

  const colorsContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacing[4],
  };

  const colorRowStyle = {
    display: "flex",
    gap: tokens.spacing[3],
  };

  const getColorStyle = (color, endValue, isSelected) => {
    // Replace the existing gradient with your specific gradient
    const colorGradient = `conic-gradient(from 174.33deg at 46.25% 0%,
        ${endValue || "#0A0A0A"} -179.01deg,
        ${color || "#737373"} 180deg,
        ${endValue || "#0A0A0A"} 180.99deg,
        ${color || "#737373"} 540deg)`;

    return {
      width: 100,
      height: 100,
      borderRadius: tokens.borderRadius.lg,
      background: colorGradient,
      cursor: "pointer",
      boxShadow: isSelected ? `0 0 0 3px ${tokens.colors.blue[400]}` : "none",
      transition: "all 0.2s ease",
    };
  };

  // Find selected color name for display
  const selectedColor = colors.find((color) => color.id === selectedColorId);
  const selectedColorName = selectedColor ? selectedColor.name : "";

  return (
    <div style={containerStyle} {...rest}>
      {label && <div style={labelStyle}>{label}</div>}

      {selectedColorId && <div style={titleStyle}>{selectedColorName}</div>}

      <div style={colorsContainerStyle}>
        <div style={colorRowStyle}>
          {colors.map((color) => (
            <div
              key={color.id}
              style={getColorStyle(
                color.value,
                color.endValue,
                color.id === selectedColorId,
              )}
              onClick={() => onChange && onChange(color.id)}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
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
});
