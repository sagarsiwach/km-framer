// DesktopDropdown.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";
import { NavItem } from "https://framer.com/m/NavItem-eXXk.js";

export function DesktopDropdown({
  isOpen,
  type, // "motorbikes", "scooters", "more"
  items,
  onItemClick,
  ...props
}) {
  // Different layouts based on dropdown type
  const getDropdownContent = () => {
    switch (type) {
      case "motorbikes":
      case "scooters":
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              gap: 10,
              maxWidth: 1600,
              margin: "0 auto",
              width: "100%",
              padding: "40px 0",
            }}
          >
            {/* Vehicle Models Section */}
            <div
              style={{
                display: "flex",
                flex: "1 1 0",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 10,
              }}
            >
              {items
                .filter((item) => item.type === "model")
                .map((item, index) => (
                  <div
                    key={index}
                    style={{
                      flex: "1 1 0",
                      display: "inline-flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        alignSelf: "stretch",
                        height: 240,
                        position: "relative",
                        background: tokens.colors.white,
                        overflow: "hidden",
                        outline: `1px ${tokens.colors.neutral[200]} solid`,
                        outlineOffset: "-1px",
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.label}
                          style={{
                            width: 370,
                            height: 208,
                            left: 30,
                            top: 0,
                            position: "absolute",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        alignSelf: "stretch",
                        paddingLeft: 10,
                        paddingRight: 10,
                        paddingTop: 20,
                        paddingBottom: 20,
                        background: tokens.colors.white,
                        display: "inline-flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onClick={() => onItemClick(item)}
                    >
                      <div
                        style={{
                          color: tokens.colors.neutral[700],
                          fontSize: 30,
                          fontFamily: "'Geist', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {item.label}
                      </div>
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
                            background: tokens.colors.neutral[700],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Links Section */}
            <div
              style={{
                width: 320,
                display: "inline-flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              {items
                .filter((item) => item.type === "link")
                .map((item, index) => (
                  <div
                    key={index}
                    onClick={() => onItemClick(item)}
                    style={{
                      alignSelf: "stretch",
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingTop: 15,
                      paddingBottom: 15,
                      display: "inline-flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: tokens.colors.neutral[500],
                        fontSize: 24,
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {item.label}
                    </div>
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
                          background: tokens.colors.neutral[700],
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      case "more":
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              gap: 40,
              maxWidth: 1600,
              margin: "0 auto",
              width: "100%",
              padding: "40px 0",
            }}
          >
            {/* Grouped links */}
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                style={{
                  flex: "1 1 0",
                  maxWidth: 360,
                  minWidth: 280,
                  display: "inline-flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {items
                  .filter((item) => item.group === groupIndex)
                  .map((item, index) => (
                    <div
                      key={index}
                      onClick={() => onItemClick(item)}
                      style={{
                        alignSelf: "stretch",
                        padding: 10,
                        borderBottom:
                          index ===
                          items.filter((i) => i.group === groupIndex).length - 1
                            ? `1px ${tokens.colors.neutral[500]} solid`
                            : "none",
                        display: "inline-flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          color: tokens.colors.neutral[700],
                          fontSize: 30,
                          fontFamily: "'Geist', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {item.label}
                      </div>
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
                            background: tokens.colors.neutral[700],
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: type === "more" ? 420 : 392,
          }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            top: 80, // Height of the navbar
            background: tokens.colors.white,
            overflow: "hidden",
            paddingLeft: 64,
            paddingRight: 64,
            zIndex: 90,
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          {...props}
        >
          {getDropdownContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Property Controls
addPropertyControls(DesktopDropdown, {
  isOpen: {
    type: ControlType.Boolean,
    title: "Is Open",
    defaultValue: false,
  },
  type: {
    type: ControlType.Enum,
    title: "Dropdown Type",
    options: ["motorbikes", "scooters", "more"],
    defaultValue: "motorbikes",
  },
  items: {
    type: ControlType.Array,
    title: "Dropdown Items",
    control: {
      type: ControlType.Object,
      controls: {
        label: {
          type: ControlType.String,
          title: "Label",
          defaultValue: "Item",
        },
        type: {
          type: ControlType.Enum,
          title: "Type",
          options: ["model", "link"],
          defaultValue: "model",
        },
        image: {
          type: ControlType.Image,
          title: "Image",
          hidden: (props) => props.type !== "model",
        },
        group: {
          type: ControlType.Number,
          title: "Group (for More)",
          defaultValue: 0,
          min: 0,
          max: 1,
          step: 1,
          hidden: (props) => props.type !== "link",
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
        label: "KM5000",
        type: "model",
        image: "https://placehold.co/370x208",
        url: "#",
      },
      {
        label: "KM4000",
        type: "model",
        image: "https://placehold.co/370x208",
        url: "#",
      },
      {
        label: "KM3000",
        type: "model",
        image: "https://placehold.co/370x208",
        url: "#",
      },
      { label: "Test Rides", type: "link", url: "#" },
      { label: "Book Now", type: "link", url: "#" },
      { label: "Locate a Store", type: "link", url: "#" },
      { label: "Compare Models", type: "link", url: "#" },
    ],
  },
});

export default DesktopDropdown;
