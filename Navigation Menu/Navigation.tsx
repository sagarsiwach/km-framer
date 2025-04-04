// Navigation.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";
import NavBar from "https://framer.com/m/NavBar-dCvV.js"; // Adjust path if needed
import MobileMenu from "https://framer.com/m/MobileMenu-whVk.js"; // Adjust path if needed
import DesktopDropdown from "https://framer.com/m/DesktopDropdown-B7VD.js"; // Adjust path if needed

// --- Default Data ---
const defaultDesktopItems = [
  { label: "Motorbikes", hasDropdown: true, url: "#" },
  { label: "Scooters", hasDropdown: true, url: "#" },
  { label: "Micromobility", hasDropdown: false, url: "#" },
  { label: "Fleet", hasDropdown: false, url: "#" },
  { label: "Dealers", hasDropdown: false, url: "#" },
  { label: "Contact", hasDropdown: false, url: "#" },
  { label: "More", hasDropdown: true, url: "#" },
];
const defaultMobileItems = [
  {
    label: "Motorbikes",
    hasChildren: true,
    icon: "right",
    variant: "mobile",
    url: "#",
  },
  {
    label: "Scooters",
    hasChildren: true,
    icon: "right",
    variant: "mobile",
    url: "#",
  },
  {
    label: "Micromobility",
    hasChildren: false,
    icon: "right",
    variant: "mobile",
    url: "#",
  },
  {
    label: "Fleet",
    hasChildren: false,
    icon: "right",
    variant: "mobile",
    url: "#",
  },
  {
    label: "Find a Dealer",
    hasChildren: false,
    icon: "right",
    variant: "mobile",
    url: "#",
  },
  {
    label: "Contact Us",
    hasChildren: false,
    icon: "right",
    variant: "mobile",
    url: "#",
  },
  {
    label: "More",
    hasChildren: true,
    icon: "more",
    variant: "mobile",
    url: "#",
  },
];
const defaultMotorbikesDropdown = [
  {
    label: "KM5000",
    type: "model",
    image: "https://via.placeholder.com/370x208/E0E0E0/BDBDBD?text=KM5000",
    url: "#",
  },
  {
    label: "KM4000",
    type: "model",
    image: "https://via.placeholder.com/370x208/E0E0E0/BDBDBD?text=KM4000",
    url: "#",
  },
  {
    label: "KM3000",
    type: "model",
    image: "https://via.placeholder.com/370x208/E0E0E0/BDBDBD?text=KM3000",
    url: "#",
  },
  { label: "Test Rides", type: "link", url: "#" },
  { label: "Book Now", type: "link", url: "#" },
  { label: "Locate a Store", type: "link", url: "#" },
  { label: "Compare Models", type: "link", url: "#" },
];
const defaultScootersDropdown = [
  {
    label: "KS3000",
    type: "model",
    image: "https://via.placeholder.com/370x208/EEEEEE/BDBDBD?text=KS3000",
    url: "#",
  },
  {
    label: "KS2000",
    type: "model",
    image: "https://via.placeholder.com/370x208/EEEEEE/BDBDBD?text=KS2000",
    url: "#",
  },
  {
    label: "KS1000",
    type: "model",
    image: "https://via.placeholder.com/370x208/EEEEEE/BDBDBD?text=KS1000",
    url: "#",
  },
  { label: "Test Rides", type: "link", url: "#" },
  { label: "Book Now", type: "link", url: "#" },
  { label: "Locate a Store", type: "link", url: "#" },
  { label: "Compare Models", type: "link", url: "#" },
];
const defaultMoreDropdown = [
  { label: "About Us", type: "link", group: 0, url: "#" },
  { label: "Press", type: "link", group: 0, url: "#" },
  { label: "Blog", type: "link", group: 0, url: "#" },
  { label: "Become a Dealer", type: "link", group: 0, url: "#" },
  { label: "Support", type: "link", group: 1, url: "#" },
  { label: "Contact Us", type: "link", group: 1, url: "#" },
  { label: "FAQ", type: "link", group: 1, url: "#" },
  { label: "Compare Models", type: "link", group: 1, url: "#" },
];

export function Navigation({
  logoColor = tokens.colors.neutral[700],
  activeItem: initialActiveItem = "",
  showDropdowns = true,
  desktopMenuItems = defaultDesktopItems,
  mobileMenuItems = defaultMobileItems,
  motorbikesDropdownItems = defaultMotorbikesDropdown,
  scootersDropdownItems = defaultScootersDropdown,
  moreDropdownItems = defaultMoreDropdown,
  ...props
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState("");
  const [submenuItems, setSubmenuItems] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(""); // Stores LOWERCASE label
  const [isHoveringNav, setIsHoveringNav] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);

  const navigationRef = useRef(null);
  const mouseLeaveTimeoutRef = useRef(null);

  // Use provided items or defaults
  const desktopItems =
    desktopMenuItems.length > 0 ? desktopMenuItems : defaultDesktopItems;
  const mobileItems =
    mobileMenuItems.length > 0 ? mobileMenuItems : defaultMobileItems;
  const motorbikesItems =
    motorbikesDropdownItems.length > 0
      ? motorbikesDropdownItems
      : defaultMotorbikesDropdown;
  const scootersItems =
    scootersDropdownItems.length > 0
      ? scootersDropdownItems
      : defaultScootersDropdown;
  const moreItems =
    moreDropdownItems.length > 0 ? moreDropdownItems : defaultMoreDropdown;

  // Mobile Submenu Item Generation
  const getSubmenuItemsForCategory = useCallback(
    (categoryLabel) => {
      const categoryLower = categoryLabel.toLowerCase();
      let sourceItems = [];
      if (categoryLower === "motorbikes") sourceItems = motorbikesItems;
      else if (categoryLower === "scooters") sourceItems = scootersItems;
      else if (categoryLower === "more") {
        return moreItems.map((item) => ({
          label: item.label,
          hasChildren: false,
          icon: "right",
          variant: "mobileChild",
          url: item.url,
        }));
      } else return [];

      return sourceItems.map((item) => ({
        label: item.label,
        hasChildren: false,
        icon: item.type === "model" ? "right" : "topRight",
        variant: item.type === "model" ? "mobileChild" : "mobileSubItem",
        url: item.url,
      }));
    },
    [motorbikesItems, scootersItems, moreItems],
  );

  // Responsive Check
  useEffect(() => {
    const isFramerCanvas = RenderTarget.current() === RenderTarget.canvas;
    if (isFramerCanvas) {
      setIsMobile(false);
      return;
    }
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
        setActiveSubmenu("");
        setSubmenuItems([]);
      } else {
        setActiveDropdown("");
      }
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Hover Timeout Logic
  useEffect(() => {
    return () => {
      if (mouseLeaveTimeoutRef.current)
        clearTimeout(mouseLeaveTimeoutRef.current);
    };
  }, []);

  const startCloseTimer = useCallback(() => {
    if (mouseLeaveTimeoutRef.current)
      clearTimeout(mouseLeaveTimeoutRef.current);
    mouseLeaveTimeoutRef.current = setTimeout(() => {
      if (!isHoveringNav && !isHoveringDropdown) setActiveDropdown("");
    }, 200);
  }, [isHoveringNav, isHoveringDropdown]);

  const clearCloseTimer = useCallback(() => {
    if (mouseLeaveTimeoutRef.current)
      clearTimeout(mouseLeaveTimeoutRef.current);
    mouseLeaveTimeoutRef.current = null;
  }, []);

  // --- Event Handlers ---
  const handleItemHover = useCallback(
    (itemLabel) => {
      if (isMobile || !showDropdowns) return;
      setIsHoveringNav(true);
      clearCloseTimer();
      const itemConfig = desktopItems.find((item) => item.label === itemLabel);
      if (itemConfig?.hasDropdown) setActiveDropdown(itemLabel.toLowerCase());
      else setActiveDropdown("");
    },
    [isMobile, showDropdowns, clearCloseTimer, desktopItems],
  );

  const handleNavLeave = useCallback(() => {
    if (!isMobile) {
      setIsHoveringNav(false);
      startCloseTimer();
    }
  }, [isMobile, startCloseTimer]);
  const handleDropdownEnter = useCallback(() => {
    if (!isMobile) {
      setIsHoveringDropdown(true);
      clearCloseTimer();
    }
  }, [isMobile, clearCloseTimer]);
  const handleDropdownLeave = useCallback(() => {
    if (!isMobile) {
      setIsHoveringDropdown(false);
      startCloseTimer();
    }
  }, [isMobile, startCloseTimer]);

  const handleItemClick = useCallback(
    (item) => {
      // Desktop nav item click
      if (isMobile) return;
      if (!item.hasDropdown || !showDropdowns) {
        setActiveDropdown("");
        console.log(`Navigate to ${item.url || "#"}`); /* Add navigation */
      } else {
        const lowerLabel = item.label.toLowerCase();
        setActiveDropdown((prev) => (prev === lowerLabel ? "" : lowerLabel));
        clearCloseTimer();
      }
    },
    [isMobile, showDropdowns, clearCloseTimer],
  );

  const handleDropdownItemClick = useCallback((item) => {
    // Desktop dropdown item click
    setActiveDropdown("");
    console.log(`Navigate to ${item.url || "#"}`); /* Add navigation */
  }, []);

  const handleMenuToggle = useCallback(() => {
    // Mobile menu button toggle
    setMobileMenuOpen((prev) => !prev);
    if (mobileMenuOpen) {
      setActiveSubmenu("");
      setSubmenuItems([]);
    } // Reset on close
  }, [mobileMenuOpen]);

  const handleMobileItemClick = useCallback(
    (item) => {
      // Mobile menu item click
      if (item.back) {
        setActiveSubmenu("");
        setSubmenuItems([]);
        return;
      }
      if (item.hasChildren) {
        const newSubmenuItems = getSubmenuItemsForCategory(item.label);
        setActiveSubmenu(item.label);
        setSubmenuItems(newSubmenuItems);
      } else {
        setMobileMenuOpen(false);
        setActiveSubmenu("");
        setSubmenuItems([]);
        console.log(`Navigate to ${item.url || "#"}`); /* Add navigation */
      }
    },
    [getSubmenuItemsForCategory],
  );

  // Current items for mobile menu
  const currentMobileNavItems = activeSubmenu ? submenuItems : mobileItems;

  return (
    <div
      ref={navigationRef}
      style={{
        width: "100%",
        position: "relative",
        zIndex: 100,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
      {...props}
    >
      <NavBar
        logoColor={logoColor}
        isMobile={isMobile}
        navItems={desktopItems}
        activeItem={initialActiveItem}
        onMenuToggle={handleMenuToggle}
        onItemHover={handleItemHover}
        onItemLeave={handleNavLeave} // Pass the nav leave handler
        onItemClick={handleItemClick}
      />

      {/* Desktop Dropdowns */}
      {!isMobile && showDropdowns && (
        <>
          <DesktopDropdown
            isOpen={activeDropdown === "motorbikes"}
            type="motorbikes"
            items={motorbikesItems}
            onItemClick={handleDropdownItemClick}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          />
          <DesktopDropdown
            isOpen={activeDropdown === "scooters"}
            type="scooters"
            items={scootersItems}
            onItemClick={handleDropdownItemClick}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          />
          <DesktopDropdown
            isOpen={activeDropdown === "more"}
            type="more"
            items={moreItems}
            onItemClick={handleDropdownItemClick}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          />
        </>
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={handleMenuToggle}
        navItems={currentMobileNavItems}
        activeSubmenu={activeSubmenu}
        onItemClick={handleMobileItemClick}
      />
    </div>
  );
}

// Property Controls
addPropertyControls(Navigation, {
  logoColor: {
    type: ControlType.Color,
    title: "Logo Color",
    defaultValue: tokens.colors.neutral[700],
  },
  activeItem: {
    type: ControlType.String,
    title: "Active Item Label",
    defaultValue: "",
  },
  showDropdowns: {
    type: ControlType.Boolean,
    title: "Show Desktop Dropdowns",
    defaultValue: true,
  },
  desktopMenuItems: {
    type: ControlType.Array,
    title: "Desktop Menu Items",
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String },
        hasDropdown: { type: ControlType.Boolean },
        url: { type: ControlType.Link },
      },
    },
    defaultValue: defaultDesktopItems,
  },
  mobileMenuItems: {
    type: ControlType.Array,
    title: "Mobile Menu Items (Root)",
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String },
        hasChildren: { type: ControlType.Boolean },
        icon: {
          type: ControlType.Enum,
          options: ["right", "topRight", "more"],
        },
        variant: {
          type: ControlType.Enum,
          options: ["mobile", "mobileChild", "mobileSubItem"],
        },
        url: { type: ControlType.Link },
      },
    },
    defaultValue: defaultMobileItems,
  },
  motorbikesDropdownItems: {
    type: ControlType.Array,
    title: "Motorbikes Dropdown",
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String },
        type: { type: ControlType.Enum, options: ["model", "link"] },
        image: {
          type: ControlType.Image,
          hidden: (props) => props.type !== "model",
        },
        url: { type: ControlType.Link },
      },
    },
    defaultValue: defaultMotorbikesDropdown,
  },
  scootersDropdownItems: {
    type: ControlType.Array,
    title: "Scooters Dropdown",
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String },
        type: { type: ControlType.Enum, options: ["model", "link"] },
        image: {
          type: ControlType.Image,
          hidden: (props) => props.type !== "model",
        },
        url: { type: ControlType.Link },
      },
    },
    defaultValue: defaultScootersDropdown,
  },
  moreDropdownItems: {
    type: ControlType.Array,
    title: "More Dropdown",
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String },
        type: {
          type: ControlType.Enum,
          options: ["link"],
          defaultValue: "link",
          hidden: true,
        },
        group: { type: ControlType.Number, min: 0, step: 1 },
        url: { type: ControlType.Link },
      },
    },
    defaultValue: defaultMoreDropdown,
  },
});

export default Navigation;
