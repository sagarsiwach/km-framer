// Components.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import types and utility functions from Lib.tsx
// NOTE: Ensure this import path is correct in your Framer project
import {
  DEFAULT_CENTER_GOOGLE,
  DEFAULT_CENTER_MAPBOX,
  DEFAULT_SEARCH_RADIUS,
  DEFAULT_ZOOM,
  GOOGLE_MAP_STYLES,
  ICONS,
  Icon,
  MAP_MARKER_SVG,
  MAX_ZOOM,
  MIN_ZOOM,
  SAMPLE_DEALERS,
  calculateDistance,
  createEnhancedPopupContent,
  formatAddress,
  formatPhone,
  formatUrl,
  getDirectionsUrl,
  getInitialCenter,
  hexToRgba,
} from "https://framer.com/m/Lib-8AS5.js@vS7d5YP2fjGyqMnH5L1D"; // Adjust path if necessary

// Animation variants for dealer cards (placed outside component)
const cardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  selected: { opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0.05)" },
  hover: { scale: 1.01 },
  tap: { scale: 0.98 },
};

// --- DealerCard (Enhanced with better styling and animations) ---
export const DealerCard = ({
  dealer,
  isSelected,
  onSelect,
  distanceUnit,
  theme,
  styles,
}) => {
  const baseStyle = styles.dealerCardStyleBase(isSelected);

  // Determine service types for color coding
  const services = dealer.services?.map((s) => s.toLowerCase()) || [];
  const hasStore = services.includes("sales") || services.includes("store");
  const hasService =
    services.includes("service") || services.includes("repair");
  const hasCharging = services.includes("charging");

  // Get primary badge color based on service priority
  let primaryBadgeColor = theme.colors.skyBlue; // Default to sky blue (Sales)
  if (hasService && !hasStore) primaryBadgeColor = theme.colors.redColor;
  if (hasCharging && !hasStore && !hasService)
    primaryBadgeColor = theme.colors.greenColor;

  // Use the formatted address directly from the API if available, otherwise construct it
  const address =
    dealer.address?.formatted ||
    formatAddress(dealer.address) ||
    "Address not available";

  return (
    <motion.div
      initial="initial"
      animate={isSelected ? "selected" : "animate"}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        ...baseStyle,
        borderLeft: isSelected
          ? `3px solid ${primaryBadgeColor}`
          : `1px solid ${theme.colors.outline}`,
      }}
      onClick={() => onSelect(dealer)}
      data-dealer-id={dealer.id}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(dealer);
      }}
    >
      <div style={styles.dealerCardContentStyle}>
        <div style={styles.dealerCardTextWrapStyle}>
          <h3 style={styles.dealerCardTitleStyle}>{dealer.name}</h3>
          <p style={styles.dealerCardAddressStyle}>{address}</p>

          {/* Service indicators */}
          {dealer.services && dealer.services.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "6px",
                flexWrap: "wrap", // Allow wrapping on small cards
              }}
            >
              {hasStore && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "4px 6px",
                    backgroundColor: hexToRgba(theme.colors.skyBlue, 0.1),
                    color: theme.colors.skyBlue,
                    borderRadius: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.4px",
                    outline: `0.5px solid ${theme.colors.skyBlue}`,
                    outlineOffset: "-0.5px",
                  }}
                >
                  SALES
                </span>
              )}
              {hasService && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "4px 6px",
                    backgroundColor: hexToRgba(theme.colors.redColor, 0.1),
                    color: theme.colors.redColor,
                    borderRadius: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.4px",
                    outline: `0.5px solid ${theme.colors.redColor}`,
                    outlineOffset: "-0.5px",
                  }}
                >
                  SERVICE
                </span>
              )}
              {hasCharging && (
                <span
                  style={{
                    fontSize: "10px",
                    padding: "4px 6px",
                    backgroundColor: hexToRgba(theme.colors.greenColor, 0.1),
                    color: theme.colors.greenColor,
                    borderRadius: "2px",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.4px",
                    outline: `0.5px solid ${theme.colors.greenColor}`,
                    outlineOffset: "-0.5px",
                  }}
                >
                  CHARGING
                </span>
              )}
            </div>
          )}

          {dealer.distance !== undefined && dealer.distance >= 0 && (
            <p style={styles.dealerCardDistanceStyle}>
              {dealer.distance} {distanceUnit}
            </p>
          )}
        </div>
        <motion.div
          style={styles.dealerCardArrowStyle}
          animate={{ x: isSelected ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6"/></svg>`,
            }}
            style={{
              color: theme.colors.onSurfaceVariant,
              display: "block",
            }} // Ensure SVG displays correctly
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- DealerDetailPanel (Complete rewrite with overlay and responsive support) ---
export const DealerDetailPanel = ({
  dealer,
  isOpen,
  onClose,
  distanceUnit,
  isMobile,
  theme,
  styles,
  contactLabel,
  hoursLabel,
  servicesLabel,
  getDirectionsText,
  mapProvider,
  isExpanded,
  onToggleExpanded,
}) => {
  // Don't render anything if no dealer
  if (!dealer) return null;

  // Get today's hours for highlighting
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Create navigation URL for directions
  const directionsUrl = getDirectionsUrl(dealer, mapProvider);

  // Create phone call URL if phone is available
  const callUrl = dealer.contact?.phone
    ? `tel:${dealer.contact.phone}`
    : undefined;

  // Determine if an image is available
  const imageUrl = dealer.imageUrl || null;

  // Refs for drag functionality
  const drawerRef = useRef(null);
  const dragStartY = useRef(null);

  // Handlers for mobile drawer dragging
  const handleDragStart = (e) => {
    if (!isMobile) return;
    const touchY = e.touches ? e.touches[0].clientY : e.clientY;
    document.addEventListener("touchmove", handleDragMove, {
      passive: false,
    }); // passive: false for potential preventDefault
    document.addEventListener("touchend", handleDragEnd);
    dragStartY.current = touchY;
  };

  const handleDragMove = (e) => {
    if (!isMobile || dragStartY.current === null) return; // Check if dragging started
    // e.preventDefault(); // Prevent scrolling while dragging drawer - consider UX impact
    const touchY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = touchY - dragStartY.current;

    // More sensitive drag detection, adjust thresholds as needed
    if (deltaY < -30 && !isExpanded) {
      // Drag up - expand
      onToggleExpanded(true);
      handleDragEnd(); // Stop tracking once action is taken
    } else if (deltaY > 30 && isExpanded) {
      // Drag down - collapse
      onToggleExpanded(false);
      handleDragEnd(); // Stop tracking once action is taken
    } else if (deltaY > 50 && !isExpanded) {
      // Drag down far enough when collapsed - close
      onClose();
      handleDragEnd(); // Stop tracking once action is taken
    }
  };

  const handleDragEnd = () => {
    dragStartY.current = null;
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("touchend", handleDragEnd);
  };

  // Animation variants based on mobile or desktop
  const panelVariants = isMobile
    ? {
        hidden: { y: "100%" },
        // Adjust visible state based on expected collapsed height, e.g., 60% viewport
        visible: { y: "calc(100% - 300px)" }, // Example: Show bottom 300px when collapsed
        expanded: { y: "0%" },
        exit: { y: "100%" },
      }
    : {
        hidden: { x: "100%" },
        visible: { x: 0 },
        exit: { x: "100%" },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate={isMobile ? (isExpanded ? "expanded" : "visible") : "visible"}
          exit="exit"
          variants={panelVariants}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            mass: 0.8,
          }}
          style={{
            position: "fixed",
            background: theme.colors.surface,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            boxShadow: theme.shadows[3],
            ...(isMobile
              ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "100dvh", // Use dvh for better mobile viewport handling
                  maxHeight: "100dvh",
                  touchAction: "none", // Prevent browser pull-to-refresh etc.
                }
              : {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${styles.detailPanelWidth || 400}px`,
                  height: "100vh",
                  borderLeft: `1px solid ${theme.colors.outline}`,
                }),
            overflow: "hidden", // Outer container should not scroll
          }}
          ref={drawerRef}
        >
          {/* Drag handle for mobile */}
          {isMobile && (
            <div
              style={{
                width: "100%", // Make handle wider for easier touch
                padding: "8px 0", // Add padding vertically
                display: "flex",
                justifyContent: "center",
                touchAction: "pan-y", // Allow vertical panning on the handle
                cursor: "grab",
              }}
              onTouchStart={handleDragStart}
            >
              <div
                style={{
                  width: "36px",
                  height: "5px",
                  backgroundColor: theme.colors.neutral[300],
                  borderRadius: "2.5px",
                }}
              />
            </div>
          )}

          {/* Header with title and close button */}
          <div
            style={{
              padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
              borderBottom: `1px solid ${theme.colors.outline}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0, // Prevent header from shrinking
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 600,
                color: theme.colors.onSurface,
                fontFamily: theme.typography.fontFamily,
                // Prevent text selection during drag attempts
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
              }}
            >
              {dealer.name}
            </h2>

            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: theme.colors.neutral[100],
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0, // Prevent button from shrinking
              }}
              aria-label="Close details"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><polygon points="17.4141 16 26 7.4141 24.5859 6 16 14.5859 7.4143 6 6 7.4141 14.5859 16 6 24.5859 7.4143 26 16 17.4141 24.5859 26 26 24.5859 17.4141 16"/></svg>`,
                }}
                style={{
                  color: theme.colors.neutral[500],
                  display: "block",
                }} // Ensure SVG displays
              />
            </motion.button>
          </div>

          {/* Scrollable content area */}
          <div
            style={{
              overflowY: "auto", // Only vertical scroll
              flexGrow: 1,
              WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
              touchAction: "pan-y", // Allow vertical scroll within content
            }}
          >
            {/* Dealer image */}
            {imageUrl && (
              <div
                style={{
                  width: "100%",
                  height: isMobile ? "180px" : "240px",
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0, // Prevent image from shrinking
                }}
              >
                <img
                  src={imageUrl}
                  alt={`${dealer.name} location`} // More descriptive alt text
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block", // Remove potential bottom space
                  }}
                  // Basic error handling: hide if broken
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Content sections */}
            <div style={{ padding: theme.spacing(2.5) }}>
              {/* Address */}
              {dealer.address && (
                <section style={{ marginBottom: theme.spacing(3) }}>
                  <h3 style={styles.detailSectionTitleStyle}>ADDRESS</h3>
                  <p style={styles.detailParagraphStyle}>
                    {dealer.address.line1 && (
                      <>
                        {dealer.address.line1}
                        <br />
                      </>
                    )}
                    {dealer.address.line2 && (
                      <>
                        {dealer.address.line2}
                        <br />
                      </>
                    )}
                    {dealer.address.city}, {dealer.address.state}{" "}
                    {dealer.address.pincode}
                    {dealer.address.country && (
                      <>
                        <br />
                        {dealer.address.country}
                      </>
                    )}
                  </p>

                  {dealer.distance !== undefined && dealer.distance >= 0 && (
                    <p style={styles.detailDistanceStyle}>
                      {dealer.distance} {distanceUnit} away
                    </p>
                  )}
                </section>
              )}

              {/* Contact information */}
              {(dealer.contact?.phone ||
                dealer.contact?.email ||
                dealer.contact?.website) && (
                <section style={{ marginBottom: theme.spacing(3) }}>
                  <h3 style={styles.detailSectionTitleStyle}>{contactLabel}</h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px", // Increased gap for better spacing
                    }}
                  >
                    {dealer.contact.phone && (
                      <div style={styles.detailContactItemStyle}>
                        <Icon
                          name="call"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        <a
                          href={`tel:${dealer.contact.phone}`}
                          style={styles.detailLinkStyle}
                          onMouseEnter={styles.handleLinkEnter}
                          onMouseLeave={styles.handleLinkLeave}
                        >
                          {formatPhone(dealer.contact.phone)}
                        </a>
                      </div>
                    )}
                    {dealer.contact.email && (
                      <div style={styles.detailContactItemStyle}>
                        <Icon
                          name="mail"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        {/* Corrected the missing <a> tag */}
                        <a
                          href={`mailto:${dealer.contact.email}`}
                          style={styles.detailLinkStyle}
                          onMouseEnter={styles.handleLinkEnter}
                          onMouseLeave={styles.handleLinkLeave}
                        >
                          {dealer.contact.email}
                        </a>
                      </div>
                    )}
                    {dealer.contact.website && (
                      <div style={styles.detailContactItemStyle}>
                        <Icon
                          name="language"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        <a
                          href={formatUrl(dealer.contact.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.detailLinkStyle}
                          onMouseEnter={styles.handleLinkEnter}
                          onMouseLeave={styles.handleLinkLeave}
                        >
                          {dealer.contact.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Hours */}
              {dealer.hours && dealer.hours.length > 0 && (
                <section style={{ marginBottom: theme.spacing(3) }}>
                  <h3 style={styles.detailSectionTitleStyle}>{hoursLabel}</h3>
                  <div style={styles.detailHoursGridStyle}>
                    {dealer.hours.map((hour) => (
                      <React.Fragment key={hour.day}>
                        <div
                          style={{
                            ...styles.detailHoursDayStyle,
                            fontWeight: hour.day === today ? 600 : 400, // Bolder today
                            color:
                              hour.day === today
                                ? theme.colors.primary
                                : theme.colors.onSurfaceVariant,
                          }}
                        >
                          {hour.day}
                        </div>
                        <div
                          style={{
                            ...styles.detailHoursTimeStyle,
                            fontWeight: hour.day === today ? 600 : 400,
                            color:
                              hour.open === "Closed"
                                ? theme.colors.neutral[400]
                                : hour.day === today
                                ? theme.colors.primary
                                : theme.colors.onSurface,
                          }}
                        >
                          {hour.open === "Closed"
                            ? "Closed"
                            : `${hour.open} - ${hour.close}`}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </section>
              )}

              {/* Services */}
              {dealer.services && dealer.services.length > 0 && (
                <section style={{ marginBottom: theme.spacing(3) }}>
                  <h3 style={styles.detailSectionTitleStyle}>
                    {servicesLabel}
                  </h3>
                  <div style={styles.detailServicesListStyle}>
                    {["sales", "service", "charging"].map((service) => {
                      const available = dealer.services.some(
                        (s) => s.toLowerCase() === service
                      );

                      let serviceColor = theme.colors.neutral[400]; // Default color for unavailable
                      let iconColor = theme.colors.neutral[400];
                      if (available) {
                        if (service === "sales")
                          serviceColor = theme.colors.skyBlue;
                        else if (service === "service")
                          serviceColor = theme.colors.redColor;
                        else if (service === "charging")
                          serviceColor = theme.colors.greenColor;
                        iconColor = serviceColor; // Use same color for icon if available
                      }

                      return (
                        <div
                          key={service}
                          style={{
                            ...styles.detailServiceItemStyle,
                            color: available
                              ? theme.colors.onSurface
                              : theme.colors.neutral[400], // Text color more standard
                            fontWeight: available ? 500 : 400,
                          }}
                        >
                          {available ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{
                                flexShrink: 0,
                              }}
                            >
                              <path
                                d="M6.66667 10.1147L4.47133 7.91933L3.52867 8.86199L6.66667 12L13.1333 5.53333L12.1907 4.59067L6.66667 10.1147Z"
                                fill={iconColor}
                              />
                            </svg>
                          ) : (
                            // Placeholder or different icon for unavailable? Or just text color difference?
                            // Adding a simple X mark for unavailable for clarity
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              style={{
                                flexShrink: 0,
                              }}
                            >
                              <path
                                d="M4.64645 4.64645C4.84171 4.45118 5.15829 4.45118 5.35355 4.64645L8 7.29289L10.6464 4.64645C10.8417 4.45118 11.1583 4.45118 11.3536 4.64645C11.5488 4.84171 11.5488 5.15829 11.3536 5.35355L8.70711 8L11.3536 10.6464C11.5488 10.8417 11.5488 11.1583 11.3536 11.3536C11.1583 11.5488 10.8417 11.5488 10.6464 11.3536L8 8.70711L5.35355 11.3536C5.15829 11.5488 4.84171 11.5488 4.64645 11.3536C4.45118 11.1583 4.45118 10.8417 4.64645 10.6464L7.29289 8L4.64645 5.35355C4.45118 5.15829 4.45118 4.84171 4.64645 4.64645Z"
                                fill={iconColor}
                              />
                            </svg>
                          )}
                          <span
                            style={{
                              textTransform: "capitalize",
                            }}
                          >
                            {service}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Actions footer */}
          <div style={styles.detailActionsFooterStyle}>
            {dealer.contact?.phone && (
              <motion.a
                href={callUrl}
                whileHover={{ filter: "brightness(1.1)" }} // Subtle hover effect
                whileTap={{ scale: 0.98 }}
                style={styles.detailActionButtonStyle}
              >
                <span>Call</span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><path d="M20.3333,21.4823l2.24-2.24a2.1667,2.1667,0,0,1,2.3368-.48l2.7281,1.0913A2.1666,2.1666,0,0,1,29,21.8659v4.9613a2.1668,2.1668,0,0,1-2.2843,2.1686C7.5938,27.8054,3.7321,11.6114,3.0146,5.4079A2.162,2.162,0,0,1,5.1692,3H10.042a2.1666,2.1666,0,0,1,2.0117,1.362L13.145,7.09a2.1666,2.1666,0,0,1-.48,2.3367l-2.24,2.24S11.6667,20.399,20.3333,21.4823Z"/></svg>`,
                  }}
                  style={{
                    color: theme.colors.white,
                    display: "block",
                  }}
                />
              </motion.a>
            )}
            <motion.a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.98 }}
              style={styles.detailActionButtonStyle} // Use consistent style
            >
              <span>{getDirectionsText}</span>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><polygon points="10 6 10 8 22.59 8 6 24.59 7.41 26 24 9.41 24 22 26 22 26 6 10 6"/></svg>`,
                }}
                style={{
                  color: theme.colors.white,
                  display: "block",
                }}
              />
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- SearchBar (Enhanced version) ---
export const SearchBar = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  allowLocationAccess,
  onUseLocation,
  isLocating,
  locationError, // Prop to receive the error message
  searchPlaceholder,
  useMyLocationText,
  theme,
  styles,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onSearchChange(newValue); // Notify parent on every change
  };

  const handleSearchAction = () => {
    if (inputValue.trim()) {
      onSearchSubmit(inputValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchAction();
    }
  };

  const handleClear = () => {
    setInputValue("");
    onClearSearch();
    // Optionally focus the input after clearing
    // inputRef.current?.focus();
  };

  // const inputRef = useRef<HTMLInputElement>(null); // Ref for potential focus management

  const containerVariants = {
    rest: {
      borderColor: theme.colors.outline,
      boxShadow: `0 0 0 0px ${hexToRgba(theme.colors.primary, 0)}`,
    },
    focus: {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 2px ${hexToRgba(theme.colors.primary, 0.2)}`,
    },
    hover: {
      borderColor: theme.colors.neutral[400], // Subtle hover border
      boxShadow: `0 0 0 0px ${hexToRgba(theme.colors.primary, 0)}`,
    },
  };

  return (
    <motion.div
      initial="rest"
      animate={isFocused ? "focus" : "rest"}
      whileHover={!isFocused ? "hover" : "focus"} // Keep focus style on hover if focused
      variants={containerVariants}
      transition={{ duration: 0.2 }}
      style={styles.searchInputContainerStyle(isFocused)} // Pass focus state if needed by style func
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={styles.searchIconButtonStyle}
        onClick={handleSearchAction}
        aria-label="Search locations" // More specific label
      >
        <Icon name="search" size={18} color={theme.colors.onSurfaceVariant} />
      </motion.button>

      <input
        // ref={inputRef}
        type="search" // Use type="search" for potential browser features (like clear button)
        placeholder={searchPlaceholder}
        style={styles.searchInputStyle}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={searchPlaceholder}
        enterKeyHint="search" // Hint for mobile keyboard action
      />

      {/* Clear button */}
      <AnimatePresence>
        {inputValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              ...styles.searchIconButtonStyle,
              color: theme.colors.onSurfaceVariant,
            }}
            onClick={handleClear}
            aria-label="Clear search input"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><polygon points="17.4141 16 26 7.4141 24.5859 6 16 14.5859 7.4143 6 6 7.4141 14.5859 16 6 24.5859 7.4143 26 16 17.4141 24.5859 26 26 24.5859 17.4141 16"/></svg>`,
              }}
              style={{ display: "block" }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Use Location Button */}
      {allowLocationAccess && (
        <motion.button
          whileHover={
            !isLocating // Don't apply hover effect when locating
              ? {
                  scale: 1.05,
                  color: theme.colors.primary,
                }
              : {}
          }
          whileTap={!isLocating ? { scale: 0.95 } : {}} // Only tap effect if not locating
          style={{
            ...styles.textButtonStyle(isLocating), // Pass state if style depends on it
            color: isLocating
              ? theme.colors.primary // Keep primary color while locating
              : theme.colors.onSurfaceVariant, // Default color
            padding: `0 ${theme.spacing(1.5)}`,
            borderLeft: `1px solid ${theme.colors.outline}`,
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: "6px", // Slightly more gap
            flexShrink: 0, // Prevent shrinking
            cursor: isLocating ? "default" : "pointer", // Change cursor when loading
          }}
          onClick={!isLocating ? onUseLocation : undefined} // Only trigger if not already locating
          disabled={isLocating}
          aria-label={isLocating ? "Locating..." : useMyLocationText}
        >
          {isLocating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: `2px solid ${theme.colors.outline}`,
                borderTopColor: theme.colors.primary,
                flexShrink: 0,
              }}
              aria-hidden="true" // Decorative spinner
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32"><path d="M4,12.9835a1,1,0,0,0,.6289.9448l9.6015,3.8409,3.8407,9.6019A1,1,0,0,0,19,28h.0162a1.0009,1.0009,0,0,0,.9238-.6582l8-22.0007A1,1,0,0,0,26.658,4.0594l-22,8A1.0011,1.0011,0,0,0,4,12.9835Z"/></svg>`,
              }}
              style={{ display: "block", flexShrink: 0 }}
              aria-hidden="true" // Icon is decorative, text provides label
            />
          )}
          {/* Responsive text - consider media query in styles or JS */}
          <span
            style={{
              whiteSpace: "nowrap", // Prevent text wrapping
            }}
          >
            {isLocating ? "Locating..." : useMyLocationText}
          </span>
        </motion.button>
      )}
      {/* Display Geolocation Error Inline */}
      {locationError && !isLocating && (
        <div
          style={{
            fontSize: "12px",
            color: theme.colors.error || "#DC2626",
            padding: `0 ${theme.spacing(1.5)}`,
            marginLeft: theme.spacing(1.5), // Add some space
            borderLeft: `1px solid ${theme.colors.outline}`, // Separator
            display: "flex",
            alignItems: "center",
            height: "100%",
            flexShrink: 0, // Prevent shrinking
          }}
          role="alert"
        >
          {locationError}
        </div>
      )}
    </motion.div>
  );
};

// --- PaginationControls (Enhanced version) ---
export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  theme,
  styles,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  const buttonBaseStyle = styles.paginationButtonStyleBase; // Get base style function

  return (
    <div style={styles.paginationContainerStyle}>
      {/* Previous Button */}
      <motion.button
        whileHover={
          !prevDisabled
            ? {
                scale: 1.05,
                backgroundColor: theme.colors.surfaceVariant,
              }
            : {}
        }
        whileTap={!prevDisabled ? { scale: 0.95 } : {}}
        style={{
          ...buttonBaseStyle(prevDisabled), // Apply base style with disabled state
          transition: "all 0.2s ease-in-out", // Keep transition if needed
        }}
        onClick={handlePrev}
        disabled={prevDisabled}
        aria-label="Go to previous page"
        aria-disabled={prevDisabled}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" transform="rotate(180)" viewBox="0 0 32 32"><polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6"/></svg>`,
          }}
          style={{ display: "block" }} // Ensure SVG aligns correctly
        />
      </motion.button>

      {/* Page Info */}
      <span
        style={styles.paginationInfoStyle}
        aria-live="polite"
        aria-atomic="true"
      >
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <motion.button
        whileHover={
          !nextDisabled
            ? {
                scale: 1.05,
                backgroundColor: theme.colors.surfaceVariant,
              }
            : {}
        }
        whileTap={!nextDisabled ? { scale: 0.95 } : {}}
        style={{
          ...buttonBaseStyle(nextDisabled),
          transition: "all 0.2s ease-in-out",
        }}
        onClick={handleNext}
        disabled={nextDisabled}
        aria-label="Go to next page"
        aria-disabled={nextDisabled}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32"><polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6"/></svg>`,
          }}
          style={{ display: "block" }}
        />
      </motion.button>
    </div>
  );
};

// --- LoadingOverlay (Enhanced with better animation) ---
export const LoadingOverlay = ({
  theme,
  styles,
  loadingText = "Loading...", // Default text
  spinnerRotation, // Keep if used externally, otherwise internalize
}) => {
  const internalSpinnerRotation = spinnerRotation ?? { rotate: 360 }; // Default rotation if not provided

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={styles.loadingOverlayStyle}
      aria-live="assertive" // Announces changes assertively
      aria-busy="true"
      role="status" // Role for status updates
    >
      {/* Pulsing background effect (optional) */}
      <motion.div
        style={styles.spinnerStyle} // Base spinner style (e.g., border, border-radius)
        animate={{
          // Example: Rotating border segment
          rotate: 360,
          // Example: Pulsing box-shadow effect
          // boxShadow: [
          //    `0 0 0 2px ${hexToRgba(theme.colors.primary, 0)}`,
          //    `0 0 0 8px ${hexToRgba(theme.colors.primary, 0.2)}`,
          //    `0 0 0 2px ${hexToRgba(theme.colors.primary, 0)}`,
          // ],
        }}
        transition={{
          rotate: { duration: 1, repeat: Infinity, ease: "linear" },
          // boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeOut" }
        }}
        aria-hidden="true" // Spinner is decorative
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={styles.loadingTextStyle}
      >
        {loadingText}
      </motion.p>
    </motion.div>
  );
};

// --- ErrorDisplay (Enhanced with better visuals) ---
export const ErrorDisplay = ({
  message = "An error occurred", // Default message
  onRetry,
  theme,
  styles,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.3 }} // Add bounce
      style={styles.errorOverlayStyle}
      role="alert" // Use alert for important errors
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 150,
          delay: 0.1,
        }}
        style={{ ...styles.errorIconContainerStyle }} // Container for potential icon styling
      >
        {/* Using a simpler warning icon as an example */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill={theme.colors.error}
        >
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      </motion.div>

      {/* Error Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={styles.errorTextStyle}
      >
        {message}
      </motion.div>

      {/* Retry Button */}
      {onRetry && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ scale: 1.05, filter: "brightness(1.1)" }} // Adjust hover effect
          whileTap={{ scale: 0.95 }}
          style={styles.errorButtonStyle}
          onClick={onRetry}
        >
          {/* Refresh Icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          <span style={{ marginLeft: "8px" }}>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  );
};

// --- MapPlaceholder (Enhanced with animation) ---
export const MapPlaceholder = ({
  message = "Map could not be loaded", // Default message
  subtext,
  theme,
  styles,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={styles.mapPlaceholderStyle}
    aria-label={message} // Provide context for screen readers
  >
    {/* Icon */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.2,
        type: "spring",
        damping: 12,
        stiffness: 100,
      }}
    >
      {/* Example: Map Pin Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill={hexToRgba(theme.colors.outline, 0.5)}
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </motion.div>

    {/* Main Message */}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      style={styles.mapPlaceholderTextStyle}
    >
      {message}
    </motion.div>

    {/* Subtext (Optional) */}
    {subtext && (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        style={styles.mapPlaceholderSubTextStyle}
      >
        {subtext}
      </motion.div>
    )}
  </motion.div>
);

// --- Custom FilterButton Component ---
export const FilterButton = ({
  label,
  isActive,
  onClick,
  icon, // Expecting a ReactNode (e.g., <Icon name="..."/> or an SVG)
  theme,
  styles, // Assuming styles object provides base styling
}) => {
  // Use base style function from styles prop if available, otherwise define inline
  const baseStyle = styles?.filterButtonStyleBase
    ? styles.filterButtonStyleBase(isActive)
    : {
        // Default inline styles if not provided via props
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        backgroundColor: isActive ? theme.colors.surfaceVariant : "transparent",
        border: `1px solid ${
          isActive ? theme.colors.outlineVariant : theme.colors.outline
        }`, // Use outlineVariant when active for subtle difference
        borderRadius: theme.shape.medium, // Consistent radius
        color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant, // Highlight active text
        fontSize: "14px",
        fontWeight: isActive ? 600 : 400, // Make active bolder
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s, color 0.2s",
        whiteSpace: "nowrap",
      };

  return (
    <motion.button
      whileHover={{
        // Define hover state, could adjust background/border/color
        scale: 1.02, // Subtle scale
        backgroundColor: isActive
          ? theme.colors.neutral[100] // Slightly different active hover
          : theme.colors.neutral[50], // Subtle hover for inactive
        // borderColor: theme.colors.primary, // Optional: Highlight border on hover
      }}
      whileTap={{ scale: 0.98 }} // Tap feedback
      style={baseStyle}
      onClick={onClick}
      aria-pressed={isActive} // Correct ARIA attribute for toggle buttons
      type="button" // Explicitly set type
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      )}
      {label}
    </motion.button>
  );
};

// --- Add default empty Style object if needed by components, or ensure it's passed ---
// This is just a placeholder if your components expect `styles` but it might not be passed.
// In Framer, you'd typically define these styles via the properties panel.
// const defaultStyles = {
//     // Define default style functions for each component if needed
//     dealerCardStyleBase: (isSelected) => ({ /* ... */ }),
//     // ... other style functions
// };
