// NavItem.tsx
import React from "react";
import { motion } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";

export function NavItem({
  label,
  isActive = false,
  onClick,
  onMouseEnter,
  // Removed onMouseLeave as it's handled by NavBar container
  variant = "desktop", // Only desktop variant is relevant here now
  ...props
}) {
  // Base styles
  const baseStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    letterSpacing: "-0.02em",
    fontFamily: "'Geist', sans-serif",
    padding: "4px 8px",
    borderRadius: 4,
    // Use CSS transitions for hover color/weight
    transition: "color 0.15s ease-out, font-weight 0.15s ease-out",
  };

  // Desktop styles
  const desktopStyles = {
    ...baseStyles,
    color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[700],
    fontSize: "16px",
    fontWeight: isActive ? 600 : 400, // Semibold if active
  };

  // Hover style using motion's whileHover prop
  const hoverStyle = {
    color: tokens.colors.neutral[900], // Target color on hover
    fontWeight: 600, // Target weight on hover
    // backgroundColor: tokens.colors.neutral[100] // Optional hover bg
    // Note: CSS transition handles the animation
  };

  return (
    <motion.div
      style={desktopStyles} // Apply base + active styles directly
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      // onMouseLeave is handled by parent NavBar container
      whileHover={hoverStyle} // Define target hover state
      {...props}
    >
      <span>{label}</span>
      {/* No arrow for desktop */}
    </motion.div>
  );
}

// Property Controls
addPropertyControls(NavItem, {
  label: {
    type: ControlType.String,
    title: "Label",
    defaultValue: "Menu Item",
  },
  isActive: {
    type: ControlType.Boolean,
    title: "Active",
    defaultValue: false,
  },
  // variant removed as it's fixed to desktop
});

export default NavItem;
