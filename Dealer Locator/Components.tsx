// Components.tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
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

// Animation variants for dealer cards
const cardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  selected: { opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0.05)" },
  hover: { scale: 1.01 },
  tap: { scale: 0.98 },
};

// Inject global styles to fix iOS height issues and hide map controls
const injectGlobalStyles = () => {
  if (typeof document === "undefined") return;
  
  const styleId = "dealer-locator-global-styles";
  
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      /* iOS height fix */
      .dealer-locator-container {
        height: 100vh; /* Fallback */
        height: calc(100dvh - var(--navbar-height, 81px)); /* Dynamic viewport height */
        max-height: -webkit-fill-available; /* iOS Safari */
        overflow: hidden;
        overscroll-behavior: none; /* Prevent pull-to-refresh */
      }
      
      /* Fix bottom white space in iOS Safari */
      @supports (-webkit-touch-callout: none) {
        .dealer-locator-container {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      }
      
      /* Enhanced mobile detail panel */
      .dealer-detail-panel-mobile {
        height: 100% !important;
        max-height: -webkit-fill-available !important;
        transform: translateZ(0); /* Force hardware acceleration */
        overscroll-behavior: contain;
      }
      
      /* Prevent bounce effect on iOS */
      body.dealer-locator-active {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      /* Hide map controls */
      .mapboxgl-ctrl-attrib, 
      .mapboxgl-ctrl-logo, 
      .mapboxgl-ctrl-bottom-right, 
      .mapboxgl-ctrl-bottom-left {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Add class to body when component mounts
    document.body.classList.add("dealer-locator-active");
  }
  
  // Return cleanup function
  return () => {
    document.body.classList.remove("dealer-locator-active");
    // Optional: remove the style if no other instances need it
    // if (document.getElementById(styleId)) {
    //   document.getElementById(styleId).remove();
    // }
  };
};

// --- DealerCard Component ---
export const DealerCard = ({
  dealer,
  isSelected,
  onSelect,
  distanceUnit,
  theme,
  styles,
}) => {
  // Get base style function or provide fallback
  const baseStyle = styles?.dealerCardStyleBase ? 
    styles.dealerCardStyleBase(isSelected) : 
    {
      background: isSelected ? "rgba(0,0,0,0.05)" : "#ffffff",
      padding: "16px",
      margin: "0 0 12px 0",
      borderRadius: "6px",
      cursor: "pointer",
    };

  // Determine service types for color coding
  const services = dealer.services?.map((s) => s.toLowerCase()) || [];
  const hasStore = services.includes("sales") || services.includes("store");
  const hasService = services.includes("service") || services.includes("repair");
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
      <div style={styles?.dealerCardContentStyle || { display: "flex", justifyContent: "space-between" }}>
        <div style={styles?.dealerCardTextWrapStyle || { flex: 1, minWidth: 0 }}>
          <h3 style={styles?.dealerCardTitleStyle || { margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}>
            {dealer.name}
          </h3>
          <p style={styles?.dealerCardAddressStyle || { margin: "0 0 8px 0", fontSize: "14px" }}>
            {address}
          </p>

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
            <p style={styles?.dealerCardDistanceStyle || { marginTop: "8px", fontSize: "13px", fontWeight: 500 }}>
              {dealer.distance} {distanceUnit}
            </p>
          )}
        </div>
        <motion.div
          style={styles?.dealerCardArrowStyle || { color: "#6B7280", display: "flex", alignItems: "center" }}
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
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- SearchBar Component (Icon-only Location button) ---
export const SearchBar = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  allowLocationAccess,
  onUseLocation,
  isLocating,
  locationError,
  userLocation,
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
    onSearchChange(newValue);
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
  };

  // Get the appropriate location icon based on state
  const getLocationIcon = () => {
    if (isLocating) {
      // Spinner for loading state
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: `2px solid ${theme.colors.outline}`,
            borderTopColor: theme.colors.primary,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      );
    } else if (locationError) {
      // Error/disabled location icon
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          height="24px" 
          viewBox="0 -960 960 960" 
          width="24px" 
          fill={theme.colors.error || "#DC2626"}
        >
          <path d="m767.84-297.54-43.38-43.38q17-30 26.27-65.73Q760-442.38 760-478q0-116-82-198t-198-82q-36 0-71.15 9.27-35.16 9.27-65.16 26.27l-43.38-43.38q35-21 71.34-33.47Q408-811.77 450-816.77V-886h60v69.23q125 12.85 210.46 98.31Q805.92-633 818.77-508H888v60h-69.23q-5 42-17.46 78.73-12.47 36.73-33.47 71.73ZM450-70v-69.23q-125-12.85-210.46-98.31Q154.08-323 141.23-448H72v-60h69.23q5-46.61 20.54-87.96 15.54-41.35 39.62-76.35L86.77-786.92l42.15-42.16 702.16 702.16-44.16 42.15-112.61-114.62q-35 24.08-76.35 39.62-41.35 15.54-87.96 20.54V-70h-60Zm30-128q40.62 0 80.77-12.54t70.15-32.23L244.77-628.92q-19.69 30-32.23 69.57Q200-519.77 200-478q0 116 82 198t198 82Z"/>
        </svg>
      );
    } else if (userLocation) {
      // Success location icon
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          height="24px" 
          viewBox="0 -960 960 960" 
          width="24px" 
          fill={theme.colors.greenColor || "#22C55E"}
        >
          <path d="M450-72v-69.23q-125-12.85-210.46-98.31Q154.08-325 141.23-450H72v-60h69.23q12.85-125 98.31-210.46Q325-805.92 450-818.77V-888h60v69.23q125 12.85 210.46 98.31Q805.92-635 818.77-510H888v60h-69.23q-12.85 125-98.31 210.46Q635-154.08 510-141.23V-72h-60Zm30-128q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-140q-57.75 0-98.87-41.13Q340-422.25 340-480q0-57.75 41.13-98.87Q422.25-620 480-620q57.75 0 98.87 41.13Q620-537.75 620-480q0 57.75-41.13 98.87Q537.75-340 480-340Z"/>
        </svg>
      );
    } else {
      // Default location icon
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          height="24px" 
          viewBox="0 -960 960 960" 
          width="24px" 
          fill={theme.colors.onSurfaceVariant}
        >
          <path d="M450-70v-69.23q-125-12.85-210.46-98.31Q154.08-323 141.23-448H72v-60h69.23q12.85-125 98.31-210.46Q325-803.92 450-816.77V-886h60v69.23q125 12.85 210.46 98.31Q805.92-633 818.77-508H888v60h-69.23q-12.85 125-98.31 210.46Q635-152.08 510-139.23V-70h-60Zm30-128q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Z"/>
        </svg>
      );
    }
  };

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
      borderColor: theme.colors.neutral[400],
      boxShadow: `0 0 0 0px ${hexToRgba(theme.colors.primary, 0)}`,
    },
  };

  // Calculate location button styles
  const locationButtonStyles = {
    backgroundColor: "transparent",
    color: isLocating
      ? theme.colors.primary
      : locationError
      ? theme.colors.error
      : theme.colors.onSurfaceVariant,
    border: "none",
    borderLeft: `1px solid ${theme.colors.outline}`,
    borderRadius: 0,
    padding: "0 12px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: isLocating ? "default" : "pointer",
    flexShrink: 0,
    width: "48px", // Fixed width for icon-only button
    transition: "background-color 0.2s, color 0.2s",
  };

  return (
    <motion.div
      initial="rest"
      animate={isFocused ? "focus" : "rest"}
      whileHover={!isFocused ? "hover" : "focus"}
      variants={containerVariants}
      transition={{ duration: 0.2 }}
      style={styles?.searchInputContainerStyle?.(isFocused) || {
        display: "flex",
        alignItems: "center",
        height: "44px",
        border: `1px solid ${isFocused ? theme.colors.primary : theme.colors.outline}`,
        borderRadius: theme.shape?.medium || "6px",
        backgroundColor: theme.colors.surface,
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={styles?.searchIconButtonStyle || {
          border: "none",
          background: "transparent",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: theme.colors.onSurfaceVariant,
        }}
        onClick={handleSearchAction}
        aria-label="Search locations"
      >
        <Icon name="search" size={18} color={theme.colors.onSurfaceVariant} />
      </motion.button>

      <input
        type="search"
        placeholder={searchPlaceholder}
        style={styles?.searchInputStyle || {
          flex: 1,
          border: "none",
          outline: "none",
          padding: "0 12px",
          background: "transparent",
          color: theme.colors.onSurface,
          fontSize: "14px",
        }}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={searchPlaceholder}
        enterKeyHint="search"
      />

      {/* Clear button - only visible when there's input */}
      <AnimatePresence>
        {inputValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={styles?.searchIconButtonStyle || {
              border: "none",
              background: "transparent",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
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

      {/* Use Location Button - ICON ONLY */}
      {allowLocationAccess && (
        <motion.button
          whileHover={
            !isLocating ? { scale: 1.05, backgroundColor: theme.colors.neutral[100] } : {}
          }
          whileTap={!isLocating ? { scale: 0.95 } : {}}
          style={styles?.locationButtonStyle || locationButtonStyles}
          onClick={!isLocating ? onUseLocation : undefined}
          disabled={isLocating}
          aria-label={isLocating ? "Locating..." : useMyLocationText}
          title={locationError || useMyLocationText} // Show error as tooltip
        >
          {getLocationIcon()}
        </motion.button>
      )}
    </motion.div>
  );
};

// --- DealerDetailPanel Component (Fullscreen on mobile) ---
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
}) => {
  // Don't render anything if no dealer
  if (!dealer) return null;

  // Initialize global styles
  useEffect(() => {
    return injectGlobalStyles();
  }, []);

  // Get today's hours for highlighting
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Create navigation URL for directions
  const directionsUrl = getDirectionsUrl(dealer, mapProvider);

  // Create phone call URL if phone is available
  const callUrl = dealer.contact?.phone
    ? `tel:${dealer.contact.phone}`
    : undefined;

  // Determine if an image is available (only show on desktop or large screens)
  const imageUrl = dealer.imageUrl || null;
  const shouldShowImage = imageUrl && (!isMobile || (typeof window !== "undefined" && window.innerWidth >= 900));

  // Animation variants - full screen for mobile
  const panelVariants = isMobile
    ? {
        hidden: { y: "100%" },
        visible: { y: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
        exit: { y: "100%", transition: { duration: 0.3 } },
      }
    : {
        hidden: { x: "100%" },
        visible: { x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
        exit: { x: "100%", transition: { duration: 0.3 } },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          className={isMobile ? "dealer-detail-panel-mobile" : ""}
          style={{
            position: "fixed",
            background: theme.colors.surface,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            boxShadow: theme.shadows?.[3] || "0 4px 12px rgba(0,0,0,0.1)",
            ...(isMobile
              ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "100%", // Full height for mobile
                  maxHeight: "100%",
                  borderTopLeftRadius: theme.shape?.large || "10px", // Optional: rounded corners
                  borderTopRightRadius: theme.shape?.large || "10px",
                }
              : {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${styles?.detailPanelWidth || 400}px`,
                  height: "100%",
                  borderLeft: `1px solid ${theme.colors.outline}`,
                }),
            overflow: "hidden", // Outer container should not scroll
          }}
        >
          {/* Header with title and close button */}
          <div
            style={{
              padding: `${theme.spacing?.(2) || "16px"} ${theme.spacing?.(2.5) || "20px"}`,
              borderBottom: `1px solid ${theme.colors.outline}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0, // Prevent header from shrinking
              zIndex: 5, // Keep above content when scrolling
              backgroundColor: theme.colors.surface,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 600,
                color: theme.colors.onSurface,
                fontFamily: theme.typography?.fontFamily || "inherit",
                userSelect: "none",
              }}
            >
              {dealer.name}
            </h2>

            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: theme.colors.neutral?.[100] || "rgba(0,0,0,0.05)",
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
                flexShrink: 0,
              }}
              aria-label="Close details"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><polygon points="17.4141 16 26 7.4141 24.5859 6 16 14.5859 7.4143 6 6 7.4141 14.5859 16 6 24.5859 7.4143 26 16 17.4141 24.5859 26 26 24.5859 17.4141 16"/></svg>`,
                }}
                style={{
                  color: theme.colors.neutral?.[500] || "#6B7280",
                  display: "block",
                }}
              />
            </motion.button>
          </div>

          {/* Scrollable content area */}
          <div
            style={{
              overflowY: "auto",
              flexGrow: 1,
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              paddingBottom: "env(safe-area-inset-bottom, 0)",
            }}
          >
            {/* Dealer image - only show on desktop or large screens */}
            {shouldShowImage && (
              <div
                style={{
                  width: "100%",
                  height: isMobile ? "180px" : "240px",
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={imageUrl}
                  alt={`${dealer.name} location`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Content sections */}
            <div style={{ padding: theme.spacing?.(2.5) || "20px" }}>
              {/* Address */}
              {dealer.address && (
                <section style={{ marginBottom: theme.spacing?.(3) || "24px" }}>
                  <h3 style={styles?.detailSectionTitleStyle || {
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.72px",
                    color: theme.colors.neutral?.[700] || "#4B5563",
                    margin: "0 0 10px 0",
                  }}>ADDRESS</h3>
                  <p style={styles?.detailParagraphStyle || {
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: theme.colors.neutral?.[700] || "#4B5563",
                    margin: "0 0 8px 0",
                  }}>
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
                    <p style={styles?.detailDistanceStyle || {
                      fontSize: "14px",
                      color: theme.colors.neutral?.[500] || "#6B7280",
                      margin: "8px 0 0 0",
                    }}>
                      {dealer.distance} {distanceUnit} away
                    </p>
                  )}
                </section>
                )}

              {/* Contact information */}
              {(dealer.contact?.phone ||
                dealer.contact?.email ||
                dealer.contact?.website) && (
                <section style={{ marginBottom: theme.spacing?.(3) || "24px" }}>
                  <h3 style={styles?.detailSectionTitleStyle || {
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.72px",
                    color: theme.colors.neutral?.[700] || "#4B5563",
                    margin: "0 0 10px 0",
                  }}>{contactLabel}</h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {dealer.contact.phone && (
                      <div style={styles?.detailContactItemStyle || {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                        <Icon
                          name="call"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        
                          href={`tel:${dealer.contact.phone}`}
                          style={styles?.detailLinkStyle || {
                            color: theme.colors.primary,
                            textDecoration: "none",
                            fontSize: "16px",
                            wordBreak: "break-word",
                          }}
                          onMouseEnter={styles?.handleLinkEnter}
                          onMouseLeave={styles?.handleLinkLeave}
                        >
                          {formatPhone(dealer.contact.phone)}
                        </a>
                      </div>
                    )}
                    {dealer.contact.email && (
                      <div style={styles?.detailContactItemStyle || {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                        <Icon
                          name="mail"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        
                          href={`mailto:${dealer.contact.email}`}
                          style={styles?.detailLinkStyle || {
                            color: theme.colors.primary,
                            textDecoration: "none",
                            fontSize: "16px",
                            wordBreak: "break-word",
                          }}
                          onMouseEnter={styles?.handleLinkEnter}
                          onMouseLeave={styles?.handleLinkLeave}
                        >
                          {dealer.contact.email}
                        </a>
                      </div>
                    )}
                    {dealer.contact.website && (
                      <div style={styles?.detailContactItemStyle || {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}>
                        <Icon
                          name="language"
                          size={18}
                          color={theme.colors.onSurfaceVariant}
                        />
                        
                          href={formatUrl(dealer.contact.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles?.detailLinkStyle || {
                            color: theme.colors.primary,
                            textDecoration: "none",
                            fontSize: "16px",
                            wordBreak: "break-word",
                          }}
                          onMouseEnter={styles?.handleLinkEnter}
                          onMouseLeave={styles?.handleLinkLeave}
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
                <section style={{ marginBottom: theme.spacing?.(3) || "24px" }}>
                  <h3 style={styles?.detailSectionTitleStyle || {
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.72px",
                    color: theme.colors.neutral?.[700] || "#4B5563",
                    margin: "0 0 10px 0",
                  }}>{hoursLabel}</h3>
                  <div style={styles?.detailHoursGridStyle || {
                    display: "grid",
                    gridTemplateColumns: "100px 1fr",
                    gap: "8px",
                    fontSize: "14px",
                  }}>
                    {dealer.hours.map((hour) => (
                      <React.Fragment key={hour.day}>
                        <div
                          style={{
                            ...(styles?.detailHoursDayStyle || {
                              color: theme.colors.neutral?.[600] || "#6B7280",
                            }),
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
                            ...(styles?.detailHoursTimeStyle || {
                              color: theme.colors.neutral?.[800] || "#1F2937",
                            }),
                            fontWeight: hour.day === today ? 600 : 400,
                            color:
                              hour.open === "Closed"
                                ? theme.colors.neutral?.[400] || "#9CA3AF"
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
                <section style={{ marginBottom: theme.spacing?.(3) || "24px" }}>
                  <h3 style={styles?.detailSectionTitleStyle || {
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.72px",
                    color: theme.colors.neutral?.[700] || "#4B5563",
                    margin: "0 0 10px 0",
                  }}>
                    {servicesLabel}
                  </h3>
                  <div style={styles?.detailServicesListStyle || {
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}>
                    {["sales", "service", "charging"].map((service) => {
                      const available = dealer.services.some(
                        (s) => s.toLowerCase() === service
                      );

                      let serviceColor = theme.colors.neutral?.[400] || "#9CA3AF"; // Default color for unavailable
                      let iconColor = theme.colors.neutral?.[400] || "#9CA3AF";
                      if (available) {
                        if (service === "sales")
                          serviceColor = theme.colors.skyBlue || "#0284C7";
                        else if (service === "service")
                          serviceColor = theme.colors.redColor || "#DC2626";
                        else if (service === "charging")
                          serviceColor = theme.colors.greenColor || "#22C55E";
                        iconColor = serviceColor; // Use same color for icon if available
                      }

                      return (
                        <div
                          key={service}
                          style={{
                            ...(styles?.detailServiceItemStyle || {
                              fontSize: "16px",
                              lineHeight: 1.4,
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }),
                            color: available
                              ? theme.colors.onSurface
                              : theme.colors.neutral?.[400] || "#9CA3AF",
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
          <div style={{
            ...(styles?.detailActionsFooterStyle || {
              display: "flex",
              padding: "16px",
              borderTop: `1px solid ${theme.colors.outline}`,
              gap: "12px",
              backgroundColor: theme.colors.surface,
              flexShrink: 0,
            }),
            paddingBottom: isMobile ? "env(safe-area-inset-bottom, 16px)" : "16px" // Add safe area for iOS
          }}>
            {dealer.contact?.phone && (
              <motion.a
                href={callUrl}
                whileHover={{ filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.98 }}
                style={styles?.detailActionButtonStyle || {
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: theme.colors.neutral?.[800] || "#1F2937",
                  color: theme.colors.white || "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: theme.shape?.medium || "6px",
                  transition: "filter 0.2s ease-out",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>Call</span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><path d="M20.3333,21.4823l2.24-2.24a2.1667,2.1667,0,0,1,2.3368-.48l2.7281,1.0913A2.1666,2.1666,0,0,1,29,21.8659v4.9613a2.1668,2.1668,0,0,1-2.2843,2.1686C7.5938,27.8054,3.7321,11.6114,3.0146,5.4079A2.162,2.162,0,0,1,5.1692,3H10.042a2.1666,2.1666,0,0,1,2.0117,1.362L13.145,7.09a2.1666,2.1666,0,0,1-.48,2.3367l-2.24,2.24S11.6667,20.399,20.3333,21.4823Z"/></svg>`,
                  }}
                  style={{
                    color: theme.colors.white || "#FFFFFF",
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
              style={styles?.detailActionButtonStyle || {
                flex: 1,
                padding: "12px 16px",
                backgroundColor: theme.colors.neutral?.[800] || "#1F2937",
                color: theme.colors.white || "#FFFFFF",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                borderRadius: theme.shape?.medium || "6px",
                transition: "filter 0.2s ease-out",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span>{getDirectionsText}</span>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32"><polygon points="10 6 10 8 22.59 8 6 24.59 7.41 26 24 9.41 24 22 26 22 26 6 10 6"/></svg>`,
                }}
                style={{
                  color: theme.colors.white || "#FFFFFF",
                  display: "block",
                }}
              ></div>
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- PaginationControls ---
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

  return (
    <div style={styles?.paginationContainerStyle || {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px",
      borderTop: `1px solid ${theme.colors.outline}`,
      backgroundColor: theme.colors.surface,
      flexShrink: 0,
    }}>
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
          ...(styles?.paginationButtonStyleBase ? styles.paginationButtonStyleBase(prevDisabled) : {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "50%",
            color: prevDisabled
              ? theme.colors.neutral?.[400] || "#9CA3AF"
              : theme.colors.onSurfaceVariant,
            cursor: prevDisabled ? "not-allowed" : "pointer",
            opacity: prevDisabled ? 0.6 : 1,
          }),
          transition: "all 0.2s ease-in-out",
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
          style={{ display: "block" }}
        />
      </motion.button>

      {/* Page Info */}
      <span
        style={styles?.paginationInfoStyle || {
          margin: "0 16px",
          fontSize: "14px",
          color: theme.colors.onSurfaceVariant,
        }}
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
          ...(styles?.paginationButtonStyleBase ? styles.paginationButtonStyleBase(nextDisabled) : {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "50%",
            color: nextDisabled
              ? theme.colors.neutral?.[400] || "#9CA3AF"
              : theme.colors.onSurfaceVariant,
            cursor: nextDisabled ? "not-allowed" : "pointer",
            opacity: nextDisabled ? 0.6 : 1,
          }),
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

// --- LoadingOverlay ---
export const LoadingOverlay = ({
  theme,
  styles,
  loadingText = "Loading...",
  spinnerRotation,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={styles?.loadingOverlayStyle || {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      aria-live="assertive"
      aria-busy="true"
      role="status"
    >
      {/* Spinner */}
      <motion.div
        style={styles?.spinnerStyle || {
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: `3px solid ${theme.colors.neutral?.[200] || "#E5E7EB"}`,
          borderTopColor: theme.colors.primary,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          rotate: { duration: 1, repeat: Infinity, ease: "linear" },
        }}
        aria-hidden="true"
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={styles?.loadingTextStyle || {
          marginTop: "16px",
          color: theme.colors.neutral?.[700] || "#4B5563",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        {loadingText}
      </motion.p>
    </motion.div>
  );
};

// --- ErrorDisplay ---
export const ErrorDisplay = ({
  message = "An error occurred",
  onRetry,
  theme,
  styles,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
      style={styles?.errorOverlayStyle || {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.surface,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1000,
      }}
      role="alert"
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
        style={styles?.errorIconContainerStyle || {
          marginBottom: "16px",
          color: theme.colors.error || "#DC2626",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill={theme.colors.error || "#DC2626"}
        >
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
      </motion.div>

      {/* Error Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={styles?.errorTextStyle || {
          color: theme.colors.neutral?.[800] || "#1F2937",
          fontSize: "16px",
          fontWeight: 500,
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        {message}
      </motion.div>

      {/* Retry Button */}
      {onRetry && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.95 }}
          style={styles?.errorButtonStyle || {
            backgroundColor: theme.colors.primary,
            color: theme.colors.white || "#FFFFFF",
            border: "none",
            borderRadius: theme.shape?.medium || "6px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onClick={onRetry}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          <span>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  );
};

// --- MapPlaceholder ---
export const MapPlaceholder = ({
  message = "Map could not be loaded",
  subtext,
  theme,
  styles,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    style={styles?.mapPlaceholderStyle || {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.surfaceVariant,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}
    aria-label={message}
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
      style={styles?.mapPlaceholderTextStyle || {
        color: theme.colors.neutral?.[700] || "#4B5563",
        fontSize: "18px",
        fontWeight: 600,
        marginTop: "16px",
      }}
    >
      {message}
    </motion.div>

    {/* Subtext (Optional) */}
    {subtext && (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        style={styles?.mapPlaceholderSubTextStyle || {
          color: theme.colors.neutral?.[500] || "#6B7280",
          fontSize: "14px",
          marginTop: "8px",
          textAlign: "center",
        }}
      >
        {subtext}
      </motion.div>
    )}
  </motion.div>
);

// --- FilterButton ---
export const FilterButton = ({
  label,
  isActive,
  onClick,
  icon,
  theme,
  styles,
}) => {
  const baseStyle = styles?.filterButtonStyleBase
    ? styles.filterButtonStyleBase(isActive)
    : {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        backgroundColor: isActive ? theme.colors.surfaceVariant : "transparent",
        border: `1px solid ${
          isActive ? theme.colors.outlineVariant : theme.colors.outline
        }`,
        borderRadius: theme.shape?.medium || "6px",
        color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
        fontSize: "14px",
        fontWeight: isActive ? 600 : 400,
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s, color 0.2s",
        whiteSpace: "nowrap",
      };

  return (
    <motion.button
      whileHover={{
        scale: 1.02,
        backgroundColor: isActive
          ? theme.colors.neutral?.[100] || "rgba(0,0,0,0.05)"
          : theme.colors.neutral?.[50] || "rgba(0,0,0,0.02)",
          backgroundColor: isActive
          ? theme.colors.neutral?.[100] || "rgba(0,0,0,0.05)"
          : theme.colors.neutral?.[50] || "rgba(0,0,0,0.02)",
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