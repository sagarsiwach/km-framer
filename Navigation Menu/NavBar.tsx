// NavBar.tsx
import React from "react";
import { motion } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";
import { KMFullLogo } from "https://framer.com/m/Logo-exuM.js";
import { MenuIcon } from "https://framer.com/m/Icons-8dPD.js";
import { NavItem } from "https://framer.com/m/NavItem-eXXk.js";

export function NavBar({
  logoColor = "#404040",
  isMobile = false,
  navItems = [],
  activeItem = "",
  onMenuToggle,
  onItemHover,
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
        WebkitFontSmoothing: "antialiased", // Added antialiasing
        MozOsxFontSmoothing: "grayscale", // Added antialiasing for Firefox
      }}
      {...props}
    >
      {/* Logo */}
      <div style={{ width: 177, height: 40 }}>
        <KMFullLogo color={logoColor} />
      </div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 15,
          }}
        >
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              label={item.label}
              isActive={activeItem === item.label}
              hasDropdown={item.hasDropdown}
              onClick={() => onItemClick(item)}
              onMouseEnter={() => onItemHover(item.label)}
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
    defaultValue: "#404040",
  },
  isMobile: {
    type: ControlType.Boolean,
    title: "Mobile View",
    defaultValue: false,
  },
  navItems: {
    type: ControlType.Array,
    title: "Navigation Items",
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
      },
    },
    defaultValue: [
      { label: "Motorbikes", hasDropdown: true },
      { label: "Scooters", hasDropdown: true },
      { label: "Micromobility", hasDropdown: false },
      { label: "Fleet", hasDropdown: false },
      { label: "Dealers", hasDropdown: false },
      { label: "Contact", hasDropdown: false },
      { label: "More", hasDropdown: true },
    ],
  },
  activeItem: {
    type: ControlType.String,
    title: "Active Item",
    defaultValue: "",
  },
});

export default NavBar;
