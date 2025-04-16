// VehicleCards.tsx (Updated)
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VehicleCard(props) {
  const {
    vehicleName = "KM3000",
    vehicleImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
    vehicleCode = "B10-0001",
    price = "₹1.9 Lakhs",
    isSelected = false,
    onClick,
    borderColor = tokens.colors.neutral[300],
    selectedBorderColor = tokens.colors.blue[600],
    backgroundColor = "#FFFFFF",
    style,
    ...rest
  } = props

  const containerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${isSelected ? selectedBorderColor : borderColor}`,
    backgroundColor,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "5px",
    boxShadow: isSelected ? `0 0 0 3px ${tokens.colors.blue[400]}` : "none",
    overflow: "hidden",
    ...style,
  }

  const imageContainerStyle = {
    width: "160px",
    height: "120px",
    position: "relative",
    overflow: "hidden",
  }

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    aspectRatio: "4/3",
  }

  const contentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    padding: tokens.spacing[5],
  }

  const nameStyle = {
    fontSize: "30px",
    fontFamily: "Geist, sans-serif",
    fontWeight: isSelected
      ? tokens.fontWeight.bold
      : tokens.fontWeight.semibold,
    letterSpacing: "-0.03em",
    color: isSelected
      ? tokens.colors.blue[700]
      : tokens.colors.neutral[900],
    marginBottom: tokens.spacing[1],
  }

  const codeStyle = {
    fontSize: "14px",
    fontFamily: "JetBrains Mono, monospace",
    color: tokens.colors.neutral[500],
  }

  return (
    <div style={containerStyle} onClick={onClick} {...rest}>
      <div style={imageContainerStyle}>
        <img src={vehicleImage} alt={vehicleName} style={imageStyle} />
      </div>
      <div style={contentStyle}>
        <div style={nameStyle}>{vehicleName}</div>
        <div style={codeStyle}>{vehicleCode}</div>
      </div>
    </div>
  )
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
  vehicleCode: {
    type: ControlType.String,
    title: "Vehicle Code",
    defaultValue: "B10-0001",
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
})
