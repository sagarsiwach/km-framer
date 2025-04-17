// Price display component for showing prices
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function PriceDisplay(props) {
  const {
    price = 0,
    prefix = "₹",
    showPrefix = true,
    size = "medium", // small, medium, large
    fontWeight = "semibold", // normal, medium, semibold, bold
    showDecimal = false,
    style,
    ...rest
  } = props;

  // Format price
  const formatPrice = (value) => {
    if (showDecimal) {
      return value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return value.toLocaleString("en-IN");
  };

  // Get font size based on size prop
  const getFontSize = () => {
    switch (size) {
      case "small":
        return tokens.fontSize.base;
      case "medium":
        return tokens.fontSize.xl;
      case "large":
        return tokens.fontSize["2xl"];
      default:
        return tokens.fontSize.xl;
    }
  };

  // Get font weight based on fontWeight prop
  const getFontWeight = () => {
    switch (fontWeight) {
      case "normal":
        return tokens.fontWeight.normal;
      case "medium":
        return tokens.fontWeight.medium;
      case "semibold":
        return tokens.fontWeight.semibold;
      case "bold":
        return tokens.fontWeight.bold;
      default:
        return tokens.fontWeight.semibold;
    }
  };

  const priceStyle = {
    fontSize: getFontSize(),
    fontWeight: getFontWeight(),
    fontFamily: "Geist, sans-serif",
    letterSpacing: "-0.03em",
    color: tokens.colors.neutral[900],
    ...style,
  };

  return (
    <div style={priceStyle} {...rest}>
      {showPrefix && prefix}
      {formatPrice(price)}
    </div>
  );
}

addPropertyControls(PriceDisplay, {
  price: {
    type: ControlType.Number,
    title: "Price",
    defaultValue: 0,
  },
  prefix: {
    type: ControlType.String,
    title: "Prefix",
    defaultValue: "₹",
  },
  showPrefix: {
    type: ControlType.Boolean,
    title: "Show Prefix",
    defaultValue: true,
  },
  size: {
    type: ControlType.Enum,
    title: "Size",
    options: ["small", "medium", "large"],
    defaultValue: "medium",
  },
  fontWeight: {
    type: ControlType.Enum,
    title: "Font Weight",
    options: ["normal", "medium", "semibold", "bold"],
    defaultValue: "semibold",
  },
  showDecimal: {
    type: ControlType.Boolean,
    title: "Show Decimal",
    defaultValue: false,
  },
});
