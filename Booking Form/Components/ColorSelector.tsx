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
      { id: "red", name: "Glossy Red", value: "#9B1C1C" },
      { id: "black", name: "Matte Black", value: "#1F2937" },
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
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[3],
  };

  const colorsContainerStyle = {
    display: "flex",
    gap: tokens.spacing[4],
  };

  const colorItemStyle = (color, isSelected) => ({
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: color,
    cursor: "pointer",
    border: isSelected
      ? `2px solid ${tokens.colors.blue[600]}`
      : `1px solid ${tokens.colors.neutral[300]}`,
    boxShadow: isSelected ? `0 0 0 2px ${tokens.colors.blue[200]}` : "none",
    transition: "all 0.2s ease",
  });

  return (
    <div style={containerStyle} {...rest}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={colorsContainerStyle}>
        {colors.map((color) => (
          <div
            key={color.id}
            style={colorItemStyle(color.value, color.id === selectedColorId)}
            onClick={() => onChange && onChange(color.id)}
            title={color.name}
          />
        ))}
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
      },
    },
    defaultValue: [
      { id: "red", name: "Glossy Red", value: "#9B1C1C" },
      { id: "black", name: "Matte Black", value: "#1F2937" },
    ],
  },
  selectedColorId: {
    type: ControlType.String,
    title: "Selected Color ID",
    defaultValue: "",
  },
});
