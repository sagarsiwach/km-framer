// NavItem.tsx
import React from "react";
import { motion } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";

export function NavItem({
  label,
  isActive = false,
  hasDropdown = false,
  hasArrow = false,
  onClick,
  variant = "desktop", // "desktop" or "mobile" or "mobileChild"
  ...props
}) {
  // Styles based on variant and state
  const getStyles = () => {
    const baseStyles = {
      display: "flex",
      alignItems: "center",
      justifyContent: variant === "desktop" ? "center" : "space-between",
      cursor: "pointer",
      transition: "all 0.2s ease",
      WebkitFontSmoothing: "antialiased", // Added antialiasing
      MozOsxFontSmoothing: "grayscale", // Added antialiasing for Firefox
      letterSpacing: "-0.02em", // Added character spacing -2%
    };

    const desktopStyles = {
      ...baseStyles,
      color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[700],
      fontSize: "16px",
      fontFamily: "'Geist', sans-serif",
      fontWeight: isActive ? 600 : 400,
      padding: "4px 8px",
    };

    const mobileStyles = {
      ...baseStyles,
      color: tokens.colors.neutral[900],
      fontSize: "36px",
      fontFamily: "'Geist', sans-serif",
      fontWeight: 600,
      padding: "15px 10px",
      borderBottom: `1px ${tokens.colors.neutral[400]} solid`,
      width: "100%",
    };

    const mobileChildStyles = {
      ...baseStyles,
      color: tokens.colors.neutral[700],
      fontSize: "30px",
      fontFamily: "'Geist', sans-serif",
      fontWeight: 600,
      padding: "15px 10px",
      borderBottom: `1px ${tokens.colors.neutral[400]} solid`,
      width: "100%",
    };

    const mobileSubItemStyles = {
      ...baseStyles,
      color: tokens.colors.neutral[500],
      fontSize: "24px",
      fontFamily: "'Geist', sans-serif",
      fontWeight: 400,
      padding: "15px 10px",
      borderBottom: `1px ${tokens.colors.neutral[400]} solid`,
      width: "100%",
    };

    switch (variant) {
      case "desktop":
        return desktopStyles;
      case "mobile":
        return mobileStyles;
      case "mobileChild":
        return mobileChildStyles;
      case "mobileSubItem":
        return mobileSubItemStyles;
      default:
        return desktopStyles;
    }
  };

  const iconSize = variant.includes("mobile") ? 32 : 15;

  return (
    <motion.div
      style={getStyles()}
      onClick={onClick}
      whileHover={
        variant === "desktop"
          ? {
              color: tokens.colors.neutral[900],
              fontWeight: 600, // Set to semibold on hover
            }
          : {}
      }
      {...props}
    >
      <span>{label}</span>
      {hasDropdown && variant === "desktop" && (
        <motion.div
          style={{
            width: 10,
            height: 5,
            marginLeft: 4,
            borderBottom: `2px solid ${isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[700]}`,
            borderRight: `2px solid ${isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[700]}`,
            transform: "rotate(45deg)",
            display: "inline-block",
          }}
        />
      )}
      {hasArrow && (
        <div
          style={{
            width: iconSize,
            height: iconSize,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: iconSize * 0.75,
              height: iconSize * 0.6,
              left: iconSize * 0.125,
              top: iconSize * 0.2,
              position: "absolute",
              background: isActive
                ? tokens.colors.neutral[900]
                : tokens.colors.neutral[700],
            }}
          />
        </div>
      )}
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
  hasDropdown: {
    type: ControlType.Boolean,
    title: "Has Dropdown",
    defaultValue: false,
  },
  hasArrow: {
    type: ControlType.Boolean,
    title: "Has Arrow",
    defaultValue: false,
  },
  variant: {
    type: ControlType.Enum,
    title: "Variant",
    options: ["desktop", "mobile", "mobileChild", "mobileSubItem"],
    defaultValue: "desktop",
  },
});

export default NavItem;
