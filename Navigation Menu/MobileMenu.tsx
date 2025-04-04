// MobileMenu.tsx
import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";
import { CloseIcon } from "https://framer.com/m/Icons-8dPD.js";

export function MobileMenu({
  isOpen,
  onClose,
  navItems,
  activeItem,
  onItemClick,
  activeSubmenu,
  showBackButton = true,
  ...props
}) {
  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  // Animation variants
  const drawerVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  // Staggered animation for menu items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Function to render the appropriate icon based on item type
  const renderIcon = (item) => {
    if (item.icon === "more") {
      return (
        <div
          style={{
            width: 32,
            height: 32,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 16,
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: tokens.colors.neutral[700],
              }}
            />
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: tokens.colors.neutral[700],
              }}
            />
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: tokens.colors.neutral[700],
              }}
            />
          </div>
        </div>
      );
    } else if (item.icon === "topRight") {
      return (
        <div
          style={{
            width: 32,
            height: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              left: 6,
              top: 6,
              position: "absolute",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.25 3.75V5H14.1188L3.75 15.3688L4.63125 16.25L15 5.88125V13.75H16.25V3.75H6.25Z"
                fill={tokens.colors.neutral[700]}
              />
            </svg>
          </div>
        </div>
      );
    } else {
      // Default right arrow
      return (
        <div
          style={{
            width: 32,
            height: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 24,
              height: 20,
              left: 4,
              top: 6,
              position: "absolute",
            }}
          >
            <svg
              width="24"
              height="20"
              viewBox="0 0 24 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 1.5L12.4125 2.54375L18.1125 8.25H3V9.75H18.1125L12.4125 15.4313L13.5 16.5L21 9L13.5 1.5Z"
                fill={tokens.colors.neutral[700]}
              />
            </svg>
          </div>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={drawerVariants}
          style={{
            position: "fixed",
            width: "100%",
            height: "100vh",
            right: 0,
            top: 0,
            background: tokens.colors.neutral[200],
            zIndex: 100,
            overflowY: "auto",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
          {...props}
        >
          {/* Close Icon at the top */}
          <div
            style={{
              width: 32,
              height: 32,
              position: "absolute",
              top: 24,
              right: 20,
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={handleCloseClick}
          >
            <CloseIcon size={32} color={tokens.colors.neutral[900]} />
          </div>

          {/* Menu Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              width: "calc(100% - 40px)", // 20px left and right from screen
              margin: "0 auto",
              paddingTop: activeSubmenu ? 80 : "calc(100vh - 700px)", // Positioned lower on main menu
              paddingBottom: 100, // 100px bottom distance
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {/* Title for submenu */}
            {activeSubmenu && (
              <div
                style={{
                  width: "100%",
                  padding: "10px",
                  borderBottom: `1px ${tokens.colors.neutral[400]} solid`,
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    color: tokens.colors.neutral[900],
                    fontSize: "36px",
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: "-0.04em", // -4% spacing
                  }}
                >
                  {activeSubmenu}
                </h2>
              </div>
            )}

            {/* Menu Items */}
            {navItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileTap={{
                  backgroundColor: tokens.colors.neutral[300],
                }}
                style={{
                  alignSelf: "stretch",
                  padding: "15px 10px",
                  borderBottom: `1px ${tokens.colors.neutral[400]} solid`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={() => onItemClick(item)}
              >
                <div
                  style={{
                    color:
                      item.variant === "mobileSubItem"
                        ? tokens.colors.neutral[500]
                        : activeSubmenu && item.variant === "mobileChild"
                          ? tokens.colors.neutral[700]
                          : tokens.colors.neutral[900],
                    fontSize:
                      item.variant === "mobileSubItem" ? "24px" : "30px",
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: item.variant === "mobileSubItem" ? 400 : 600,
                    letterSpacing: "-0.04em", // -4% spacing
                  }}
                >
                  {item.label}
                </div>
                {renderIcon(item)}
              </motion.div>
            ))}
          </motion.div>

          {/* Back/Close Button at the bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 20, // 20px from bottom
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              padding: 10,
              background: tokens.colors.white,
              borderRadius: 40,
              outline: `1px ${tokens.colors.neutral[200]} solid`,
              outlineOffset: "-1px",
              gap: 10,
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            {activeSubmenu ? (
              // Back button for submenu
              <>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    position: "relative",
                    transform: "rotate(180deg)",
                    overflow: "hidden",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 1.5L12.4125 2.54375L18.1125 8.25H3V9.75H18.1125L12.4125 15.4313L13.5 16.5L21 9L13.5 1.5Z"
                      fill={tokens.colors.neutral[700]}
                    />
                  </svg>
                </div>
                <div
                  style={{
                    color: tokens.colors.neutral[700],
                    fontSize: 20,
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: 400,
                    letterSpacing: "-0.04em", // -4% spacing
                  }}
                >
                  Back
                </div>
              </>
            ) : (
              // Close button for main menu
              <>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <CloseIcon size={20} color={tokens.colors.neutral[700]} />
                </div>
                <div
                  style={{
                    color: tokens.colors.neutral[700],
                    fontSize: 20,
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: 400,
                    letterSpacing: "-0.04em", // -4% spacing
                  }}
                >
                  Close
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Property Controls
addPropertyControls(MobileMenu, {
  isOpen: {
    type: ControlType.Boolean,
    title: "Is Open",
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
        hasChildren: {
          type: ControlType.Boolean,
          title: "Has Children",
          defaultValue: false,
        },
        icon: {
          type: ControlType.Enum,
          title: "Icon Type",
          options: ["right", "topRight", "more"],
          defaultValue: "right",
        },
        variant: {
          type: ControlType.Enum,
          title: "Variant",
          options: ["mobile", "mobileChild", "mobileSubItem"],
          defaultValue: "mobile",
        },
        url: {
          type: ControlType.String,
          title: "URL",
          defaultValue: "#",
        },
      },
    },
    defaultValue: [
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
    ],
  },
  activeItem: {
    type: ControlType.String,
    title: "Active Item",
    defaultValue: "",
  },
  activeSubmenu: {
    type: ControlType.String,
    title: "Active Submenu",
    defaultValue: "",
  },
  showBackButton: {
    type: ControlType.Boolean,
    title: "Show Back Button",
    defaultValue: true,
  },
});

export default MobileMenu;
