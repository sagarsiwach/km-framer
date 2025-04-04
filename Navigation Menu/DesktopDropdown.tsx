// DesktopDropdown.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/designTokens-42aq.js";

export function DesktopDropdown({
  isOpen,
  type, // "motorbikes", "scooters", "more"
  items = [], // Default empty array
  onItemClick,
  onMouseEnter, // Added for hover handling
  onMouseLeave, // Added for hover handling
  ...props
}) {
  // Animation variants for the dropdown container (height/opacity)
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        // Ensure children finish animating *before* container closes height
        when: "afterChildren",
        staggerChildren: 0.03, // Stagger children fade out
        staggerDirection: -1, // Reverse stagger on exit
      },
    },
    visible: {
      opacity: 1,
      height: 392, // Fixed height for all dropdowns
      transition: {
        duration: 0.4,
        ease: "easeOut",
        // Ensure container animates *before* children appear
        when: "beforeChildren",
        staggerChildren: 0.05, // Stagger children fade in
      },
    },
  };

  // Animation variants for individual items (fade/slide up) - Used by container stagger
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    // Exit animation is handled by the container's staggerDirection: -1
  };

  const getDropdownContent = () => {
    switch (type) {
      case "motorbikes":
      case "scooters":
        const models = items.filter((item) => item.type === "model");
        const links = items.filter((item) => item.type === "link");

        return (
          <motion.div
            // No variants needed here directly, container handles stagger
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "stretch", // Stretch columns vertically
              gap: 10,
              maxWidth: 1600,
              margin: "0 auto",
              width: "100%",
              padding: "0 0 40px 0", // Padding at bottom only
              height: "100%", // Ensure it fills the animated height
            }}
          >
            {/* Vehicle Models Section */}
            <div // No motion needed if container staggers items directly
              style={{
                display: "flex",
                flex: "1 1 auto", // Allow shrinking/growing, base auto
                justifyContent: "flex-start",
                alignItems: "stretch", // Items fill height
                gap: 10,
                height: "100%",
              }}
            >
              {models.map((item, index) => (
                <motion.div
                  key={`${type}-model-${index}`}
                  variants={itemVariants} // Animate individual item based on container stagger
                  style={{
                    flex: "1 1 0", // Equal flexible width
                    minWidth: 280, // Minimum width
                    display: "flex", // Use flex for column layout
                    flexDirection: "column",
                    justifyContent: "flex-end", // Align content to bottom
                    height: "100%",
                  }}
                >
                  {/* Image Container */}
                  <div
                    style={{
                      width: "100%",
                      height: 240, // Fixed height for image area
                      position: "relative",
                      overflow: "hidden",
                      marginBottom: 0,
                    }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.label}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                      />
                    )}
                  </div>
                  {/* Text/Link Container */}
                  <motion.div
                    whileHover={{
                      backgroundColor: tokens.colors.neutral[100],
                    }}
                    style={{
                      width: "100%",
                      padding: "20px 10px",
                      background: tokens.colors.white,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                    onClick={() => onItemClick(item)}
                  >
                    <div
                      style={{
                        color: tokens.colors.neutral[700],
                        fontSize: 30,
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "-0.04em",
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
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="24"
                        height="20"
                        viewBox="0 0 24 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          position: "absolute",
                          left: 4,
                          top: 6,
                        }}
                      >
                        <path
                          d="M13.5 1.5L12.4125 2.54375L18.1125 8.25H3V9.75H18.1125L12.4125 15.4313L13.5 16.5L21 9L13.5 1.5Z"
                          fill={tokens.colors.neutral[700]}
                        />
                      </svg>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Links Section */}
            <div // No motion needed if container staggers items directly
              style={{
                width: 320,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                height: "100%",
                paddingBottom: 0,
              }}
            >
              {links.map((item, index) => (
                <motion.div
                  key={`${type}-link-${index}`}
                  variants={itemVariants} // Animate individual item based on container stagger
                  whileHover={{
                    backgroundColor: tokens.colors.neutral[100],
                  }}
                  onClick={() => onItemClick(item)}
                  style={{
                    alignSelf: "stretch",
                    padding: "15px 10px",
                    display: "flex",
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
                      letterSpacing: "-0.04em",
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
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        position: "absolute",
                        left: 6,
                        top: 6,
                      }}
                    >
                      <path
                        d="M6.25 3.75V5H14.1188L3.75 15.3688L4.63125 16.25L15 5.88125V13.75H16.25V3.75H6.25Z"
                        fill={tokens.colors.neutral[700]}
                      />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case "more":
        const groups = [0, 1]; // Assuming max 2 groups
        return (
          <motion.div
            // No variants needed here directly, container handles stagger
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "stretch",
              gap: 40,
              maxWidth: 1600,
              margin: "0 auto",
              width: "100%",
              padding: "0 0 40px 0",
              height: "100%",
            }}
          >
            {groups.map((groupIndex) => (
              <div // No motion needed if container staggers items directly
                key={`more-group-${groupIndex}`}
                style={{
                  flex: "1 1 0",
                  maxWidth: 360,
                  minWidth: 280,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                  height: "100%",
                }}
              >
                {items
                  .filter((item) => item.group === groupIndex)
                  .map((item, index) => (
                    <motion.div
                      key={`more-item-${groupIndex}-${index}`}
                      variants={itemVariants} // Animate individual item based on container stagger
                      whileHover={{
                        backgroundColor: tokens.colors.neutral[100],
                      }}
                      onClick={() => onItemClick(item)}
                      style={{
                        alignSelf: "stretch",
                        padding: "15px 10px",
                        display: "flex",
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
                          letterSpacing: "-0.04em",
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
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            position: "absolute",
                            left: 6,
                            top: 6,
                          }}
                        >
                          <path
                            d="M6.25 3.75V5H14.1188L3.75 15.3688L4.63125 16.25L15 5.88125V13.75H16.25V3.75H6.25Z"
                            fill={tokens.colors.neutral[700]}
                          />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ))}
            {/* Add placeholder divs if needed */}
            {items.filter((item) => item.type === "link" && item.group === 1)
              .length === 0 && ( // If group 1 is empty
              <div
                style={{
                  flex: "1 1 0",
                  maxWidth: 360,
                  minWidth: 280,
                }}
              ></div>
            )}
            {items.filter((item) => item.type === "link").length === 0 && ( // If all empty
              <>
                <div
                  style={{
                    flex: "1 1 0",
                    maxWidth: 360,
                    minWidth: 280,
                  }}
                ></div>
                <div
                  style={{
                    flex: "1 1 0",
                    maxWidth: 360,
                    minWidth: 280,
                  }}
                ></div>
              </>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={dropdownVariants} // Apply variants here
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            top: 80,
            background: tokens.colors.white,
            overflow: "hidden",
            paddingLeft: 64,
            paddingRight: 64,
            zIndex: 90,
            boxShadow: "none",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
          defaultValue: "Item Label",
        },
        type: {
          type: ControlType.Enum,
          title: "Type",
          options: ["model", "link"],
          defaultValue: "model",
        },
        image: {
          type: ControlType.Image,
          title: "Image (Model Only)",
          hidden: (props) => props.type !== "model",
        },
        group: {
          type: ControlType.Number,
          title: "Group (More Only)",
          defaultValue: 0,
          min: 0,
          max: 1,
          step: 1,
          hidden: (props, parent) =>
            parent.type !== "more" || props.type !== "link",
        }, // Show only for 'more' links
        url: {
          type: ControlType.Link,
          title: "URL",
          defaultValue: "#",
        },
      },
    },
    defaultValue: [],
  },
});

export default DesktopDropdown;
