// MobileMenu.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";
import { CloseIcon } from "https://framer.com/m/Icons-8dPD.js"; // Adjust path if needed

export function MobileMenu({
  isOpen,
  onClose,
  navItems = [], // Current items (main or sub)
  onItemClick,
  activeSubmenu, // Label of the active submenu, or ""
  ...props
}) {
  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  // Drawer slide animation
  const drawerVariants = {
    hidden: {
      x: "100%",
      opacity: 0,
      transition: { type: "tween", duration: 0.3, ease: "easeIn" },
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "tween", duration: 0.4, ease: "easeOut" },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { type: "tween", duration: 0.3, ease: "easeIn" },
    },
  };

  // List container variants for staggering children
  const listVariants = {
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
    hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  };

  // Individual item variants
  const itemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "tween", ease: "easeOut", duration: 0.3 },
    },
    // Exit implicitly handled by parent list's 'hidden' state + staggerDirection
  };

  const renderIcon = (item) => {
    const iconColor = tokens.colors.neutral[700];
    const iconWrapperStyle = {
      width: 32,
      height: 32,
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    };
    if (item.icon === "more") {
      return (
        <div style={iconWrapperStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 16,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: iconColor,
                }}
              />
            ))}
          </div>
        </div>
      );
    } else if (item.icon === "topRight") {
      return (
        <div style={iconWrapperStyle}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.25 3.75V5H14.1188L3.75 15.3688L4.63125 16.25L15 5.88125V13.75H16.25V3.75H6.25Z"
              fill={iconColor}
            />
          </svg>
        </div>
      );
    } else {
      // Default right arrow
      return (
        <div style={iconWrapperStyle}>
          <svg
            width="24"
            height="20"
            viewBox="0 0 24 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5 1.5L12.4125 2.54375L18.1125 8.25H3V9.75H18.1125L12.4125 15.4313L13.5 16.5L21 9L13.5 1.5Z"
              fill={iconColor}
            />
          </svg>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu-drawer"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={drawerVariants}
          style={{
            position: "fixed",
            width: "100%",
            height: "100dvh",
            right: 0,
            top: 0,
            background: tokens.colors.neutral[200],
            zIndex: 110,
            overflow: "hidden",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            display: "flex",
            flexDirection: "column",
          }}
          {...props}
        >
          {/* Header Area */}
          <div
            style={{
              padding: "20px 20px 0 20px",
              boxSizing: "border-box",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                position: "absolute",
                top: 24,
                right: 20,
                cursor: "pointer",
                zIndex: 130,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handleCloseClick}
              aria-label="Close menu"
            >
              <CloseIcon size={32} color={tokens.colors.neutral[900]} />
            </div>
            <AnimatePresence>
              {activeSubmenu && (
                <motion.div
                  key="submenu-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.1 },
                  }}
                  exit={{ opacity: 0, y: -5 }}
                  style={{
                    paddingTop: 40,
                    paddingBottom: 10,
                    borderBottom: `1px ${tokens.colors.neutral[400]} solid`,
                    marginBottom: 20,
                  }}
                >
                  <h2
                    style={{
                      color: tokens.colors.neutral[900],
                      fontSize: "30px",
                      fontFamily: "'Geist', sans-serif",
                      fontWeight: 600,
                      margin: 0,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.2,
                    }}
                  >
                    {activeSubmenu}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
            {!activeSubmenu && <div style={{ paddingTop: 60 }} />}
          </div>

          {/* Scrollable Content Area */}
          <div
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "0 20px",
              marginBottom: 80,
            }}
          >
            <motion.div
              key={activeSubmenu || "main"} // Change key triggers animations
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ width: "100%" }}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label} // Item key
                  custom={index}
                  variants={itemVariants}
                  style={{
                    padding: "15px 10px",
                    borderBottom: `1px ${tokens.colors.neutral[400]} solid`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    width: "100%",
                    boxSizing: "border-box",
                    background: "transparent",
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
                      letterSpacing: "-0.04em",
                      lineHeight: 1.3,
                      paddingRight: 10,
                    }}
                  >
                    {item.label}
                  </div>
                  {renderIcon(item)}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Fixed Bottom Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 0.2, duration: 0.3 },
            }}
            exit={{
              opacity: 0,
              y: 10,
              transition: { duration: 0.15 },
            }}
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              background: tokens.colors.white,
              borderRadius: 40,
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
              border: `1px ${tokens.colors.neutral[300]} solid`,
              gap: 10,
              cursor: "pointer",
              zIndex: 120,
            }}
            onClick={
              activeSubmenu ? () => onItemClick({ back: true }) : onClose
            }
            aria-label={activeSubmenu ? "Go back" : "Close menu"}
          >
            <div
              style={{
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: activeSubmenu ? "rotate(180deg)" : "none",
              }}
            >
              {activeSubmenu ? (
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
              ) : (
                <CloseIcon size={20} color={tokens.colors.neutral[700]} />
              )}
            </div>
            <div
              style={{
                color: tokens.colors.neutral[700],
                fontSize: 18,
                fontFamily: "'Geist', sans-serif",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {activeSubmenu ? "Back" : "Close"}
            </div>
          </motion.div>
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
    title: "Navigation Items (Current View)",
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
          title: "Has Submenu",
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
          title: "Display Variant",
          options: ["mobile", "mobileChild", "mobileSubItem"],
          defaultValue: "mobile",
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
  activeSubmenu: {
    type: ControlType.String,
    title: "Active Submenu Title",
    defaultValue: "",
  },
});

export default MobileMenu;
