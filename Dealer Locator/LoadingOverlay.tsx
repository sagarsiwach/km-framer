// LoadingIndicator.tsx
import React from "react";
import { motion } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";

// Inject keyframes if needed, although Framer might handle simple spin
const injectSpinnerKeyframes = () => {
  const id = "spinner-keyframes";
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `@keyframes loading-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
};

/**
 * A loading indicator component.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function LoadingIndicator(props) {
  const {
    text = "Loading...",
    showText = true,
    color = "#0284C7", // Default blue color from original example
    size = "medium", // small, medium, large
    fullScreen = true, // Controls position: fixed vs relative
    backgroundColor = "rgba(255, 255, 255, 0.9)", // Background for fullscreen
    style, // Allow style overrides
    ...rest // Pass other props like data-* attributes
  } = props;

  injectSpinnerKeyframes(); // Ensure keyframes are present

  // Determine spinner dimensions based on size prop
  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return { dim: 24, border: 2 };
      case "large":
        return { dim: 64, border: 4 };
      case "medium":
      default:
        return { dim: 40, border: 3 };
    }
  };
  const { dim: spinnerDim, border: spinnerBorder } = getSpinnerSize();

  // Base styles for the container
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily:
      "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ...(fullScreen
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor,
          zIndex: 9999, // Ensure it's on top
          pointerEvents: "auto", // Block interaction below
        }
      : {
          position: "relative", // Can be placed inline
          width: "100%",
          height: "100%",
        }),
    ...style, // Apply overrides
  };

  const spinnerStyle: React.CSSProperties = {
    width: spinnerDim,
    height: spinnerDim,
    borderRadius: "50%",
    border: `${spinnerBorder}px solid rgba(0, 0, 0, 0.1)`, // Lighter border color
    borderTopColor: color, // Use the accent color for the spinning part
    animation: "loading-spin 1s linear infinite",
  };

  const textStyle: React.CSSProperties = {
    marginTop: "16px", // Increased spacing
    color: "#4B5563", // Neutral-600
    fontSize: size === "small" ? "14px" : "16px",
    fontWeight: 500,
    textAlign: "center",
  };

  return (
    <div
      style={containerStyle}
      {...rest}
      aria-live="assertive"
      aria-busy="true"
    >
      <motion.div // Keep motion.div for consistency / potential future animations
        style={spinnerStyle}
        // Removed Framer animation props, rely on CSS animation
      />
      {showText && text && <div style={textStyle}>{text}</div>}
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
    defaultValue: "#0284C7", // Default blue
  },
  size: {
    type: ControlType.Enum,
    title: "Size",
    options: ["small", "medium", "large"],
    optionTitles: ["Small", "Medium", "Large"],
    defaultValue: "medium",
    displaySegmentedControl: true,
  },
  fullScreen: {
    type: ControlType.Boolean,
    title: "Full Screen",
    defaultValue: true,
    description: "Covers entire viewport vs. filling its container.",
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "rgba(255, 255, 255, 0.9)",
    hidden: (props) => !props.fullScreen,
  },
});
