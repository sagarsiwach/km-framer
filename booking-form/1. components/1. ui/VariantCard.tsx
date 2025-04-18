// VariantCard component from original VariantCard.tsx file
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VariantCard(props) {
  const {
    title = "Standard Variant",
    subtitle = "5.1h kWh Battery Pack",
    description = "250km Range (IDC)",
    price = "",
    includedText = "Included",
    pricePrefix = "+",
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
    padding: tokens.spacing[5],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${isSelected ? selectedBorderColor : borderColor}`,
    backgroundColor,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "5px",
    boxShadow: isSelected ? `0 0 0 3px ${tokens.colors.blue[400]}` : "none",
    ...style,
  }

  const contentStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }

  const titleContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  }

  const titleStyle = {
    fontSize: "24px",
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.semibold,
    letterSpacing: "-0.03em",
    color: isSelected
      ? tokens.colors.blue[700]
      : tokens.colors.neutral[900],
    marginBottom: tokens.spacing[1],
  }

  const subtitleContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  }

  const subtitleStyle = {
    fontSize: "16px",
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.medium,
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[500],
  }

  const descriptionStyle = {
    fontSize: "16px",
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[500],
  }

  const priceStyle = {
    display: "flex",
    gap: "5px",
    alignItems: "center",
    fontSize: "18px",
    fontFamily: "Geist, sans-serif",
    fontWeight: tokens.fontWeight.normal,
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[500],
  }

  return (
    <div style={containerStyle} onClick={onClick} {...rest}>
      <div style={contentStyle}>
        <div style={titleContainerStyle}>
          <div style={titleStyle}>{title}</div>
          {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        </div>
        {description && (
          <div style={subtitleContainerStyle}>
            <div style={descriptionStyle}>{description}</div>
          </div>
        )}
      </div>
      <div style={priceStyle}>
        {price ? (
          <>
            <div>{pricePrefix}</div>
            <div>{price}</div>
          </>
        ) : (
          <div>{includedText}</div>
        )}
      </div>
    </div>
  )
}

addPropertyControls(VariantCard, {
  title: {
    type: ControlType.String,
    title: "Title",
    defaultValue: "Standard Variant",
  },
  subtitle: {
    type: ControlType.String,
    title: "Subtitle",
    defaultValue: "5.1h kWh Battery Pack",
  },
  description: {
    type: ControlType.String,
    title: "Description",
    defaultValue: "250km Range (IDC)",
  },
  price: {
    type: ControlType.String,
    title: "Price",
    defaultValue: "",
  },
  includedText: {
    type: ControlType.String,
    title: "Included Text",
    defaultValue: "Included",
  },
  pricePrefix: {
    type: ControlType.String,
    title: "Price Prefix",
    defaultValue: "+",
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
