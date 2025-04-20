// LoadingIndicator.tsx
import React from "react";
import { motion } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function LoadingIndicator(props) {
  const {
    text = "Loading...",
    showText = true,
    color = "#0284C7", // Default blue color
    size = "medium", // small, medium, large
    fullScreen = true,
    backgroundColor = "rgba(255, 255, 255, 0.9)",
    style,
    ...rest
  } = props;

  // Get spinner size based on size prop
  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return 24;
      case "medium":
        return 40;
      case "large":
        return 64;
      default:
        return 40;
    }
  };

  const spinnerSize = getSpinnerSize();

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    ...(fullScreen
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor,
          zIndex: 9999,
        }
      : {}),
    ...style,
  };

  const textStyle = {
    marginTop: "12px",
    color: "#4B5563", // Gray 600
    fontSize: "16px",
    fontWeight: 500,
    fontFamily: "Geist, system-ui, sans-serif",
  };

  return (
    <div style={containerStyle} {...rest}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: "50%",
          border: `3px solid #E5E7EB`,
          borderTopColor: color,
        }}
      />
      {showText && <div style={textStyle}>{text}</div>}
    </div>
  );
}

addPropertyControls(LoadingIndicator, {
  text: {
    type: ControlType.String,
    title: "Loading Text",
    defaultValue: "Loading...",
  },
  showText: {
    type: ControlType.Boolean,
    title: "Show Text",
    defaultValue: true,
  },
  color: {
    type: ControlType.Color,
    title: "Spinner Color",
    defaultValue: "#0284C7",
  },
  size: {
    type: ControlType.Enum,
    title: "Size",
    options: ["small", "medium", "large"],
    defaultValue: "medium",
  },
  fullScreen: {
    type: ControlType.Boolean,
    title: "Full Screen",
    defaultValue: true,
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "rgba(255, 255, 255, 0.9)",
  },
});
