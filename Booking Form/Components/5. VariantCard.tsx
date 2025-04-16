// VariantCard.tsx (enhanced version)

import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VariantCard(props) {
  const {
    title = "Standard Variant",
    subtitle = "5.15 kWh Battery Pack",
    description = "262km Range (IDC)",
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
    marginBottom: tokens.spacing[4],
    boxShadow: isSelected ? `0 0 0 1px ${selectedBorderColor}` : "none",
    ...style,
  }

  const contentStyle = {
    display: "flex",
    flexDirection: "column",
  }

  const titleStyle = {
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.semibold,
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[1],
  }

  const subtitleStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[500],
    marginBottom: tokens.spacing[1],
  }

  const descriptionStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[500],
  }

  const priceContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  }

  const priceStyle = {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.semibold,
    color: price ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
  }

  return (
    <div style={containerStyle} onClick={onClick} {...rest}>
      <div style={contentStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={subtitleStyle}>{subtitle}</div>
        <div style={descriptionStyle}>{description}</div>
      </div>
      <div style={priceContainerStyle}>
        <div style={priceStyle}>
          {price ? `${pricePrefix} ${price}` : includedText}
        </div>
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
    defaultValue: "5.15 kWh Battery Pack",
  },
  description: {
    type: ControlType.String,
    title: "Description",
    defaultValue: "262km Range (IDC)",
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
