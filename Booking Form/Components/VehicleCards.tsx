import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VehicleCard(props) {
  const {
    vehicleName = "KM3000",
    vehicleImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
    price = "₹1.9 Lakhs",
    isSelected = false,
    onClick,
    borderColor = tokens.colors.neutral[300],
    selectedBorderColor = tokens.colors.blue[600],
    backgroundColor = "#FFFFFF",
    style,
    ...rest
  } = props;

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: tokens.spacing[5],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${isSelected ? selectedBorderColor : borderColor}`,
    backgroundColor,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: tokens.spacing[4],
    boxShadow: isSelected ? `0 0 0 1px ${selectedBorderColor}` : "none",
    ...style,
  };

  const imageStyle = {
    width: 80,
    height: 50,
    objectFit: "contain",
  };

  const contentStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  };

  const nameStyle = {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[1],
  };

  const priceStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[500],
  };

  return (
    <div style={containerStyle} onClick={onClick} {...rest}>
      <img src={vehicleImage} alt={vehicleName} style={imageStyle} />
      <div style={contentStyle}>
        <div style={nameStyle}>{vehicleName}</div>
        <div style={priceStyle}>{price}</div>
      </div>
    </div>
  );
}

addPropertyControls(VehicleCard, {
  vehicleName: {
    type: ControlType.String,
    title: "Vehicle Name",
    defaultValue: "KM3000",
  },
  vehicleImage: {
    type: ControlType.Image,
    title: "Vehicle Image",
  },
  price: {
    type: ControlType.String,
    title: "Price",
    defaultValue: "₹1.9 Lakhs",
  },
  isSelected: {
    type: ControlType.Boolean,
    title: "Selected",
    defaultValue: false,
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: tokens.colors.neutral[300],
  },
  selectedBorderColor: {
    type: ControlType.Color,
    title: "Selected Border Color",
    defaultValue: tokens.colors.blue[600],
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background Color",
    defaultValue: "#FFFFFF",
  },
});
