// NavBar.tsx
import React from "react";
// import { motion } from "framer-motion" // Removed as not directly used for animation here
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";
import { KMFullLogo } from "https://framer.com/m/Logo-exuM.js";
import { MenuIcon } from "https://framer.com/m/Icons-8dPD.js";
import { NavItem } from "https://framer.com/m/NavItem-eXXk.js"; // Corrected import path if needed

export function NavBar({
  logoColor = tokens.colors.neutral[700],
  isMobile = false,
  navItems = [],
  activeItem = "",
  onMenuToggle,
  onItemHover,
  onItemLeave, // This is for leaving the entire nav container
  onItemClick,
  ...props
}) {
  return (
    <div
      style={{
        width: "100%",
        background: tokens.colors.white,
        borderBottom: `1px ${tokens.colors.neutral[300]} solid`,
        padding: isMobile ? "20px" : "20px 64px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        zIndex: 100,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        boxSizing: "border-box",
      }}
      // Add onMouseLeave to the main container
      onMouseLeave={onItemLeave}
      {...props}
    >
      {/* Logo */}
      <div style={{ width: 177, height: 40, flexShrink: 0 }}>
        <KMFullLogo color={logoColor} />
      </div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
          }}
          // No onMouseLeave here; handled by parent div
        >
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              label={item.label}
              isActive={activeItem === item.label}
              onClick={() => onItemClick(item)}
              onMouseEnter={() => onItemHover(item.label)}
              // onMouseLeave on individual items is less reliable for dropdowns
              variant="desktop"
            />
          ))}
        </div>
      )}

      {/* Mobile Menu Toggle */}
      {isMobile && (
        <div
          onClick={onMenuToggle}
          style={{
            width: 32,
            height: 32,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MenuIcon size={32} color={tokens.colors.neutral[700]} />
        </div>
      )}
    </div>
  );
}

// Property Controls
addPropertyControls(NavBar, {
  logoColor: {
    type: ControlType.Color,
    title: "Logo Color",
    defaultValue: tokens.colors.neutral[700],
  },
  isMobile: {
    type: ControlType.Boolean,
    title: "Mobile View",
    defaultValue: false,
  },
  navItems: {
    type: ControlType.Array,
    title: "Navigation Items (Desktop)",
    control: {
      type: ControlType.Object,
      controls: {
        label: {
          type: ControlType.String,
          title: "Label",
          defaultValue: "Menu Item",
        },
        hasDropdown: {
          type: ControlType.Boolean,
          title: "Has Dropdown",
          defaultValue: false,
        },
        url: {
          type: ControlType.Link,
          title: "URL",
          defaultValue: "#",
        },
      },
    },
    defaultValue: [],
  },
  activeItem: {
    type: ControlType.String,
    title: "Active Item Label",
    defaultValue: "",
  },
});

export default NavBar;
