// Components.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import types and utility functions from Lib.tsx
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
} from "https://framer.com/m/Lib-8AS5.js@vS7d5YP2fjGyqMnH5L1D";

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
  const services = dealer.services?.map(s => s.toLowerCase()) || [];
  const hasStore = services.includes("sales") || services.includes("store");
  const hasService = services.includes("service") || services.includes("repair");
  const hasCharging = services.includes("charging");
  
  // Get primary badge color based on service priority
  let primaryBadgeColor = theme.colors.skyBlue; // Default to sky blue (Sales)
  if (hasService && !hasStore) primaryBadgeColor = theme.colors.redColor;
  if (hasCharging && !hasStore && !hasService) primaryBadgeColor = theme.colors.greenColor;

  // Use the formatted address directly from the API
  const address = dealer.address?.formatted || "";

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
        borderLeft: isSelected ? `3px solid ${primaryBadgeColor}` : `1px solid ${theme.colors.outline}`,
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
          <p style={styles.dealerCardAddressStyle}>
            {address}
          </p>

          {/* Service indicators */}
          {dealer.services && dealer.services.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "6px",
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
            style={{ color: theme.colors.onSurfaceVariant }}
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
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
    dragStartY.current = touchY;
  };
  
  const handleDragMove = (e) => {
    if (!isMobile || !dragStartY.current) return;
    const touchY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = touchY - dragStartY.current;
    
    if (deltaY < -50 && !isExpanded) {
      // Drag up - expand
      onToggleExpanded(true);
    } else if (deltaY > 50 && isExpanded) {
      // Drag down - collapse
      onToggleExpanded(false);
    }
  };
  
  const handleDragEnd = () => {
    dragStartY.current = null;
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  // Animation variants based on mobile or desktop
  const panelVariants = isMobile
    ? {
        hidden: { y: "100%" },
        visible: { y: isExpanded ? "0%" : "60%" },
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
                  height: "100vh",
                }
              : {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${styles.detailPanelWidth || 400}px`,
                  height: "100vh",
                  borderLeft: `1px solid ${theme.colors.outline}`,
                }),
            overflow: "hidden",
          }}
          ref={drawerRef}
        >
          {/* Drag handle for mobile */}
          {isMobile && (
            <div 
              style={{
                width: "36px",
                height: "5px",
                backgroundColor: theme.colors.neutral[300],
                borderRadius: "2.5px",
                margin: "8px auto",
                cursor: "grab",
              }}
              onTouchStart={handleDragStart}
            />
          )}

          {/* Header with title and close button */}
          <div
            style={{
              padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
              borderBottom: `1px solid ${theme.colors.outline}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 600,
                color: theme.colors.onSurface,
                fontFamily: theme.typography.fontFamily,
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
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><polygon points="17.4141 16 26 7.4141 24.5859 6 16 14.5859 7.4143 6 6 7.4141 14.5859 16 6 24.5859 7.4143 26 16 17.4141 24.5859 26 26 24.5859 17.4141 16"/></svg>`,
                }}
                style={{ color: theme.colors.neutral[500] }}
              />
            </motion.button>
          </div>

          {/* Scrollable content area */}
          <div
            style={{
              overflow: "auto",
              flexGrow: 1,
              WebkitOverflowScrolling: "touch",
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
                }}
              >
                <img
                  src={imageUrl}
                  alt={dealer.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Content sections */}
            <div style={{ padding: theme.spacing(2.5) }}>
              {/* Address */}
              <section style={{ marginBottom: theme.spacing(3) }}>
                <h3
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.72px",
                    color: theme.colors.neutral[700],
                    margin: "0 0 10px 0",
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  ADDRESS
                </h3>

                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: 1.5,
                    color: theme.colors.neutral[600],
                    margin: 0,
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
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
                  <br />
                  {dealer.address.country}
                </p>

                {dealer.distance !== undefined && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: theme.colors.neutral[500],
                      margin: "8px 0 0 0",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {dealer.distance} {distanceUnit} away
                  </p>
                )}
              </section>

              {/* Contact information */}
              {(dealer.contact?.phone ||
                dealer.contact?.email ||
                dealer.contact?.website) && (
                <section style={{ marginBottom: theme.spacing(3) }}>
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.72px",
                      color: theme.colors.neutral[700],
                      margin: "0 0 10px 0",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {contactLabel}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {dealer.contact.phone && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Icon
                          name="call"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        
                          href={`tel:${dealer.contact.phone}`}
                          style={{
                            color: theme.colors.neutral[600],
                            textDecoration: "none",
                            fontSize: "16px",
                            fontFamily: theme.typography.fontFamily,
                          }}
                        >
                          {formatPhone(dealer.contact.phone)}
                        </a>
                      </div>
                    )}

                    {dealer.contact.email && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Icon
                          name="language"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        
                          href={`mailto:${dealer.contact.email}`}
                          style={{
                            color: theme.colors.neutral[600],
                            textDecoration: "none",
                            fontSize: "16px",
                            fontFamily: theme.typography.fontFamily,
                          }}
                          onMouseEnter={styles.handleLinkEnter}
                          onMouseLeave={styles.handleLinkLeave}
                        >
                          {dealer.contact.email}
                        </a>
                      </div>
                    )}

                    {dealer.contact.website && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Icon
                          name="language"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        
                          href={formatUrl(dealer.contact.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: theme.colors.neutral[600],
                            textDecoration: "none",
                            fontSize: "16px",
                            fontFamily: theme.typography.fontFamily,
                          }}
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
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.72px",
                      color: theme.colors.neutral[700],
                      margin: "0 0 10px 0",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {hoursLabel}
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                      gap: "8px",
                      fontSize: "14px",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {dealer.hours.map((hour) => (
                      <React.Fragment key={hour.day}>
                        <div
                          style={{
                            fontWeight: hour.day === today ? 500 : 400,
                            color:
                              hour.day === today
                                ? theme.colors.primary
                                : theme.colors.neutral[700],
                          }}
                        >
                          {hour.day}
                        </div>
                        <div
                          style={{
                            fontWeight: hour.day === today ? 500 : 400,
                            color:
                              hour.open === "Closed"
                                ? theme.colors.neutral[400]
                                : hour.day === today
                                ? theme.colors.primary
                                : theme.colors.neutral[700],
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
                  <h3
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.72px",
                      color: theme.colors.neutral[700],
                      margin: "0 0 10px 0",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {servicesLabel}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {["sales", "service", "charging"].map((service) => {
                      const available = dealer.services.some(s => 
                        s.toLowerCase() === service
                      );
                      
                      // Get color based on service type
                      let serviceColor;
                      if (service === 'sales') serviceColor = theme.colors.skyBlue;
                      else if (service === 'service') serviceColor = theme.colors.redColor;
                      else if (service === 'charging') serviceColor = theme.colors.greenColor;
                      
                      return (
                        <div
                          key={service}
                          style={{
                            color: available
                              ? serviceColor
                              : theme.colors.neutral[400],
                            fontSize: "16px",
                            fontWeight: available ? 500 : 400,
                            fontFamily: theme.typography.fontFamily,
                            lineHeight: 1.2,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {available && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6.66667 10.1147L4.47133 7.91933L3.52867 8.86199L6.66667 12L13.1333 5.53333L12.1907 4.59067L6.66667 10.1147Z"
                                fill={serviceColor}
                              />
                            </svg>
                          )}
                          {service.charAt(0).toUpperCase() + service.slice(1)}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Actions footer */}
          <div
            style={{
              display: "flex",
              padding: theme.spacing(2),
              borderTop: `1px solid ${theme.colors.outline}`,
              gap: theme.spacing(1.5),
              backgroundColor: theme.colors.surface,
            }}
          >
            {dealer.contact?.phone && (
              <motion.a
                href={`tel:${dealer.contact.phone}`}
                whileHover={{
                  backgroundColor: theme.colors.neutral[800],
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
                  backgroundColor: theme.colors.neutral[700],
                  color: theme.colors.white,
                  fontSize: "16px",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                  fontFamily: theme.typography.fontFamily,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: theme.shape.medium,
                }}
              >
                <span>Call</span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><path d="M20.3333,21.4823l2.24-2.24a2.1667,2.1667,0,0,1,2.3368-.48l2.7281,1.0913A2.1666,2.1666,0,0,1,29,21.8659v4.9613a2.1668,2.1668,0,0,1-2.2843,2.1686C7.5938,27.8054,3.7321,11.6114,3.0146,5.4079A2.162,2.162,0,0,1,5.1692,3H10.042a2.1666,2.1666,0,0,1,2.0117,1.362L13.145,7.09a2.1666,2.1666,0,0,1-.48,2.3367l-2.24,2.24S11.6667,20.399,20.3333,21.4823Z"/></svg>`,
                  }}
                  style={{ color: theme.colors.white }}
                />
              </motion.a>
            )}

            <motion.a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{
                backgroundColor: theme.colors.neutral[800],
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                flex: 1,
                padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
                backgroundColor: theme.colors.neutral[700],
                color: theme.colors.white,
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                fontFamily: theme.typography.fontFamily,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: theme.shape.medium,
              }}
            >
              <span>{getDirectionsText}</span>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><polygon points="10 6 10 8 22.59 8 6 24.59 7.41 26 24 9.41 24 22 26 22 26 6 10 6"/></svg>`,
                }}
                style={{ color: theme.colors.white }}
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
  locationError,
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
    setInputValue(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onSearchSubmit(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue("");
    onClearSearch();
  };

  // Adding animation to the search input
  const containerVariants = {
    rest: {
      borderColor: theme.colors.outline,
    },
    focus: {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 2px ${hexToRgba(theme.colors.primary, 0.2)}`,
    },
    hover: {
      borderColor: theme.colors.neutral[400],
    },
  };

  return (
    <motion.div
      initial="rest"
      animate={isFocused ? "focus" : "rest"}
      whileHover={!isFocused ? "hover" : "focus"}
      variants={containerVariants}
      transition={{ duration: 0.2 }}
      style={styles.searchInputContainerStyle(isFocused)}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={styles.searchIconButtonStyle}
        onClick={() => {
          if (inputValue.trim()) onSearchSubmit(inputValue.trim());
        }}
        aria-label="Search"
      >
        <Icon name="search" size={18} color={theme.colors.onSurfaceVariant} />
      </motion.button>

      <input
        type="search"
        placeholder={searchPlaceholder}
        style={styles.searchInputStyle}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={searchPlaceholder}
      />

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
          aria-label="Clear search"
        >
          <div
            <div
            dangerouslySetInnerHTML={{
              __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><polygon points="17.4141 16 26 7.4141 24.5859 6 16 14.5859 7.4143 6 6 7.4141 14.5859 16 6 24.5859 7.4143 26 16 17.4141 24.5859 26 26 24.5859 17.4141 16"/></svg>`,
            }}
          />
        </motion.button>
      )}

      {allowLocationAccess && (
        <motion.button
          whileHover={{
            scale: isLocating ? 1 : 1.05,
            color: isLocating ? undefined : theme.colors.primary,
          }}
          whileTap={{ scale: isLocating ? 1 : 0.95 }}
          style={{
            ...styles.textButtonStyle(isLocating),
            color: isLocating
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant,
            padding: `0 ${theme.spacing(1.5)}`,
            borderLeft: `1px solid ${theme.colors.outline}`,
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          onClick={onUseLocation}
          disabled={isLocating}
          aria-label={useMyLocationText}
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
              }}
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32"><path d="M4,12.9835a1,1,0,0,0,.6289.9448l9.6015,3.8409,3.8407,9.6019A1,1,0,0,0,19,28h.0162a1.0009,1.0009,0,0,0,.9238-.6582l8-22.0007A1,1,0,0,0,26.658,4.0594l-22,8A1.0011,1.0011,0,0,0,4,12.9835Z"/></svg>`,
              }}
            />
          )}
          <span
            style={{
              display: "none",
              "@media (min-width: 480px)": {
                display: "inline",
              },
            }}
          >
            {useMyLocationText}
          </span>
        </motion.button>
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

  const handlePrev = () => onPageChange(currentPage - 1);
  const handleNext = () => onPageChange(currentPage + 1);

  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  // Enhanced styling and animations
  return (
    <div style={styles.paginationContainerStyle}>
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
          ...styles.paginationButtonStyleBase(prevDisabled),
          transition: "all 0.2s ease-in-out",
        }}
        onClick={handlePrev}
        disabled={prevDisabled}
        aria-label="Previous page"
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" transform="rotate(180)" viewBox="0 0 32 32"><polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6"/></svg>`,
          }}
        />
      </motion.button>

      <span style={styles.paginationInfoStyle}>
        Page {currentPage} of {totalPages}
      </span>

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
          ...styles.paginationButtonStyleBase(nextDisabled),
          transition: "all 0.2s ease-in-out",
        }}
        onClick={handleNext}
        disabled={nextDisabled}
        aria-label="Next page"
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32"><polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6"/></svg>`,
          }}
        />
      </motion.button>
    </div>
  );
};

// --- LoadingOverlay (Enhanced with better animation) ---
export const LoadingOverlay = ({
  theme,
  styles,
  loadingText,
  spinnerRotation,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    style={styles.loadingOverlayStyle}
    aria-live="assertive"
    aria-busy="true"
  >
    <motion.div
      style={styles.spinnerStyle(spinnerRotation)}
      animate={{
        boxShadow: [
          `0 0 0 2px ${hexToRgba(theme.colors.primary, 0.1)}`,
          `0 0 0 8px ${hexToRgba(theme.colors.primary, 0)}`,
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
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

// --- ErrorDisplay (Enhanced with better visuals) ---
export const ErrorDisplay = ({ message, onRetry, theme, styles }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5 }}
      style={styles.errorOverlayStyle}
      role="alert"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, delay: 0.1 }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 32" fill="${theme.colors.error}"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.602 18.333 18.333 14.602 18.333 10C18.333 5.398 14.602 1.667 10 1.667C5.398 1.667 1.667 5.398 1.667 10C1.667 14.602 5.398 18.333 10 18.333ZM9.167 14.167V12.5H10.833V14.167H9.167ZM9.167 10.833V5.833H10.833V10.833H9.167Z"/></svg>`,
          }}
          style={{ ...styles.errorIconStyle }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={styles.errorTextStyle}
      >
        {message}
      </motion.div>

      {onRetry && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{
            scale: 1.05,
            backgroundColor: theme.colors.neutral[800],
          }}
          whileTap={{ scale: 0.95 }}
          style={styles.errorButtonStyle}
          onClick={onRetry}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
              fill={theme.colors.white}
            />
          </svg>
          <span style={{ marginLeft: "8px" }}>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  );
};

// --- MapPlaceholder (Enhanced with animation) ---
export const MapPlaceholder = ({ message, subtext, theme, styles }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={styles.mapPlaceholderStyle}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", damping: 12 }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="${hexToRgba(theme.colors.outline, 0.5)}"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 17.5C10 17.5 15 12.5 15 8.75C15 6.134 12.761 4.167 10 4.167C7.239 4.167 5 6.134 5 8.75C5 12.5 10 17.5 10 17.5ZM10 10.833C11.15 10.833 12.083 9.9 12.083 8.75C12.083 7.6 11.15 6.667 10 6.667C8.85 6.667 7.917 7.6 7.917 8.75C7.917 9.9 8.85 10.833 10 10.833Z"/></svg>`,
        }}
        style={{ opacity: 0.5 }}
      />
    </motion.div>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={styles.mapPlaceholderTextStyle}
    >
      {message}
    </motion.div>

    {subtext && (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={styles.mapPlaceholderSubTextStyle}
      >
        {subtext}
      </motion.div>
    )}
  </motion.div>
);

// --- Custom FilterButton Component ---
export const FilterButton = ({ label, isActive, onClick, icon, theme }) => {
  return (
    <motion.button
      whileHover={{
        scale: 1.02,
        backgroundColor: isActive
          ? theme.colors.surfaceVariant
          : theme.colors.neutral[100],
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        backgroundColor: isActive ? theme.colors.surfaceVariant : "transparent",
        border: `1px solid ${isActive ? theme.colors.outline : "transparent"}`,
        borderRadius: theme.shape.small,
        color: theme.colors.onSurface,
        fontSize: "14px",
        fontWeight: isActive ? 500 : 400,
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s",
      }}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {icon}
      {label}
    </motion.button>
  );
};