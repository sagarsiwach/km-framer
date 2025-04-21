// Components.tsx
// Updated DealerDetailPanel for Mobile Layout (Issue #3)
// Other components remain as provided in the original request.
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import types and utility functions from Lib.tsx (NO VERSION)
import {
  DEFAULT_CENTER_GOOGLE,
  DEFAULT_CENTER_MAPBOX,
  DEFAULT_SEARCH_RADIUS,
  DEFAULT_ZOOM,
  GOOGLE_MAP_STYLES,
  MAP_MARKER_SVG_BASE,
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
  isValidCoordinates,
  type Dealer, // Import Dealer type
  type MapProvider, // Import MapProvider type
} from "https://framer.com/m/Lib-8AS5.js";

// --- MaterialIcon Component ---
// (Keep as is from original)
export const MaterialIcon = ({
  iconName,
  color = "currentColor",
  size = 20,
  style = {},
  className = "",
  filled = false,
}) => {
  const iconStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size}px`,
    color: color,
    flexShrink: 0,
    verticalAlign: "middle",
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400`,
    userSelect: "none",
    ...style,
  };
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={iconStyle}
      aria-hidden="true"
    >
      {" "}
      {iconName}{" "}
    </span>
  );
};

// --- DealerCard Component ---
// (Keep as is from original)
export const DealerCard = ({
  dealer,
  isSelected,
  onSelect,
  distanceUnit,
  theme,
  styles,
}) => {
  const baseStyle = styles?.dealerCardStyleBase
    ? styles.dealerCardStyleBase(isSelected)
    : {
        background: isSelected
          ? theme.colors.surfaceVariant || "rgba(0,0,0,0.05)"
          : theme.colors.surface,
        padding: "16px",
        margin: "0 0 12px 0",
        borderRadius: theme.shape?.medium || "6px",
        cursor: "pointer",
        border: `1px solid ${
          isSelected ? theme.colors.primary : theme.colors.outline || "#e5e7eb"
        }`,
        borderLeft: `3px solid ${
          isSelected ? theme.colors.primary : "transparent"
        }`,
        boxShadow: isSelected ? theme.shadows?.[2] : theme.shadows?.[1],
        transition:
          "background-color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s",
        position: "relative",
      };
  const services = dealer.services?.map((s) => s.toLowerCase()) || [];
  const hasStore = services.includes("sales") || services.includes("store");
  const hasService =
    services.includes("service") || services.includes("repair");
  const hasCharging = services.includes("charging");
  let primaryBadgeColor = theme.colors.secondary;
  if (hasStore) primaryBadgeColor = theme.colors.sales;
  else if (hasService) primaryBadgeColor = theme.colors.service;
  else if (hasCharging) primaryBadgeColor = theme.colors.accent;
  const address = dealer.address?.formatted || formatAddress(dealer.address);
  const serviceBadgeStyle = (theme, type) => {
    let color = theme.colors.secondary || "#6B7280";
    let bgColor = hexToRgba(color, 0.1);
    if (type === "sales") {
      color = theme.colors.sales || "#0284C7";
      bgColor = hexToRgba(color, 0.1);
    } else if (type === "service") {
      color = theme.colors.service || "#DC2626";
      bgColor = hexToRgba(color, 0.1);
    } else if (type === "charging") {
      color = theme.colors.accent || "#22C55E";
      bgColor = hexToRgba(color, 0.1);
    }
    return {
      fontSize: "10px",
      padding: "3px 6px",
      backgroundColor: bgColor,
      color: color,
      borderRadius: theme.shape?.small || "2px",
      textTransform: "uppercase",
      fontWeight: 700,
      letterSpacing: "0.4px",
      display: "inline-flex",
      alignItems: "center",
      gap: "3px",
    };
  };
  const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    selected: { opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0.05)" },
    hover: { scale: 1.01, zIndex: 1 },
    tap: { scale: 0.98 },
  };
  return (
    <motion.div
      initial="initial"
      animate={isSelected ? "selected" : "animate"}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        ...baseStyle,
        borderLeft: `3px solid ${
          isSelected ? primaryBadgeColor : "transparent"
        }`,
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
      {" "}
      <div style={styles?.dealerCardTextWrapStyle || { flex: 1, minWidth: 0 }}>
        {" "}
        <h3
          style={
            styles?.dealerCardTitleStyle || {
              margin: "0 0 6px 0",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.3,
              color: theme.colors.onSurface,
            }
          }
        >
          {" "}
          {dealer.name}{" "}
        </h3>{" "}
        <p
          style={
            styles?.dealerCardAddressStyle || {
              margin: "0 0 8px 0",
              fontSize: "13px",
              color: theme.colors.neutral?.[600] || "#6B7280",
              lineHeight: 1.4,
            }
          }
        >
          {" "}
          {address}{" "}
        </p>{" "}
        {(hasStore || hasService || hasCharging) && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            {" "}
            {hasStore && (
              <span style={serviceBadgeStyle(theme, "sales")}>
                {" "}
                <MaterialIcon iconName="storefront" size={12} /> SALES{" "}
              </span>
            )}{" "}
            {hasService && (
              <span style={serviceBadgeStyle(theme, "service")}>
                {" "}
                <MaterialIcon iconName="settings" size={12} /> SERVICE{" "}
              </span>
            )}{" "}
            {hasCharging && (
              <span style={serviceBadgeStyle(theme, "charging")}>
                {" "}
                <MaterialIcon iconName="bolt" size={12} /> CHARGING{" "}
              </span>
            )}{" "}
          </div>
        )}{" "}
        {dealer.distance !== undefined && dealer.distance >= 0 && (
          <p
            style={
              styles?.dealerCardDistanceStyle || {
                marginTop: "10px",
                fontSize: "13px",
                fontWeight: 500,
                color: theme.colors.neutral?.[700] || "#4B5563",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }
            }
          >
            {" "}
            <MaterialIcon
              iconName="near_me"
              size={14}
              color={theme.colors.primary}
            />{" "}
            {dealer.distance} {distanceUnit}{" "}
          </p>
        )}{" "}
      </div>{" "}
    </motion.div>
  );
};

// --- SearchBar Component ---
// (Keep as is from original)
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
  const handleSearchAction = useCallback(() => {
    if (inputValue.trim()) {
      onSearchSubmit(inputValue.trim());
    }
  }, [inputValue, onSearchSubmit]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchAction();
    }
  };
  const handleClear = useCallback(() => {
    setInputValue("");
    onClearSearch();
  }, [onClearSearch]);
  const locationButtonState = useMemo(() => {
    if (isLocating) return "loading";
    if (locationError) return "error";
    if (userLocation) return "success";
    return "default";
  }, [isLocating, locationError, userLocation]);
  const getLocationIcon = () => {
    switch (locationButtonState) {
      case "loading":
        return (
          <MaterialIcon
            iconName="progress_activity"
            size={20}
            color={theme.colors.primary}
            style={{ animation: "spin 1.5s linear infinite" }}
          />
        );
      case "error":
        return (
          <MaterialIcon
            iconName="location_disabled"
            size={20}
            color={theme.colors.error || "#DC2626"}
          />
        );
      case "success":
        return (
          <MaterialIcon
            iconName="my_location"
            size={20}
            color={theme.colors.accent || "#22C55E"}
          />
        );
      default:
        return (
          <MaterialIcon
            iconName="my_location"
            size={20}
            color={theme.colors.neutral?.[400] || theme.colors.secondary}
          />
        );
    }
  };
  const containerVariants = {
    rest: {
      borderColor: theme.colors.outline || "#E5E7EB",
      boxShadow: `0 0 0 0px ${hexToRgba(theme.colors.primary, 0)}`,
    },
    focus: {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 0 2px ${hexToRgba(theme.colors.primary, 0.2)}`,
    },
    hover: {
      borderColor: theme.colors.neutral?.[400] || theme.colors.secondary,
      boxShadow: `0 0 0 0px ${hexToRgba(theme.colors.primary, 0)}`,
    },
  };
  const defaultLocationButtonStyles = {
    backgroundColor: "transparent",
    color: theme.colors.onSurfaceVariant,
    border: "none",
    borderLeft: `1px solid ${theme.colors.outline || "#e5e7eb"}`,
    borderRadius: 0,
    padding: "0 12px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: isLocating ? "default" : "pointer",
    flexShrink: 0,
    width: "48px",
    transition: "background-color 0.2s, color 0.2s, opacity 0.2s",
    opacity: locationButtonState === "error" ? 0.6 : 1,
    ...(locationButtonState === "error" && { cursor: "not-allowed" }),
  };
  return (
    <>
      {" "}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>{" "}
      <motion.div
        initial="rest"
        animate={isFocused ? "focus" : "rest"}
        whileHover={!isFocused ? "hover" : "focus"}
        variants={containerVariants}
        transition={{ duration: 0.2 }}
        style={
          styles?.searchInputContainerStyle?.(isFocused) || {
            display: "flex",
            alignItems: "center",
            height: "44px",
            border: `1px solid ${
              isFocused
                ? theme.colors.primary
                : theme.colors.outline || "#e5e7eb"
            }`,
            borderRadius: theme.shape?.medium || "6px",
            backgroundColor: theme.colors.surface,
            overflow: "hidden",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }
        }
      >
        {" "}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={
            styles?.searchIconButtonStyle || {
              border: "none",
              background: "transparent",
              padding: "0 10px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: theme.colors.onSurfaceVariant,
              flexShrink: 0,
            }
          }
          onClick={handleSearchAction}
          aria-label="Search locations"
          type="button"
        >
          {" "}
          <MaterialIcon iconName="search" size={20} />{" "}
        </motion.button>{" "}
        <input
          type="search"
          placeholder={searchPlaceholder}
          style={
            styles?.searchInputStyle || {
              flex: 1,
              border: "none",
              outline: "none",
              padding: "0 8px",
              background: "transparent",
              color: theme.colors.onSurface,
              fontSize: "14px",
              height: "100%",
            }
          }
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={searchPlaceholder}
          enterKeyHint="search"
        />{" "}
        <AnimatePresence>
          {" "}
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={
                styles?.searchIconButtonStyle || {
                  border: "none",
                  background: "transparent",
                  padding: "0 10px",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: theme.colors.onSurfaceVariant,
                  flexShrink: 0,
                }
              }
              onClick={handleClear}
              aria-label="Clear search input"
              type="button"
            >
              {" "}
              <MaterialIcon iconName="close" size={18} />{" "}
            </motion.button>
          )}{" "}
        </AnimatePresence>{" "}
        {allowLocationAccess && (
          <motion.button
            whileHover={
              !isLocating
                ? {
                    backgroundColor:
                      theme.colors.neutral?.[100] || "rgba(0,0,0,0.05)",
                  }
                : {}
            }
            whileTap={!isLocating ? { scale: 0.95 } : {}}
            style={styles?.locationButtonStyle || defaultLocationButtonStyles}
            onClick={
              !isLocating && locationButtonState !== "error"
                ? onUseLocation
                : undefined
            }
            disabled={isLocating || locationButtonState === "error"}
            aria-label={
              isLocating
                ? "Locating..."
                : locationError
                ? `Location Error: ${locationError}`
                : useMyLocationText
            }
            title={locationError || useMyLocationText}
            type="button"
          >
            {" "}
            {getLocationIcon()}{" "}
          </motion.button>
        )}{" "}
      </motion.div>{" "}
    </>
  );
};

// --- DealerDetailPanel Component (UPDATED Mobile Layout) ---
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
  if (!dealer) return null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const directionsUrl = getDirectionsUrl(dealer, mapProvider);
  const callUrl = dealer.contact?.phone
    ? `tel:${formatPhone(dealer.contact.phone)}`
    : undefined;
  const imageUrl = dealer.imageUrl || null;
  // Always hide image on mobile detail panel now
  const shouldShowImage =
    imageUrl &&
    !isMobile &&
    typeof window !== "undefined" &&
    window.innerWidth >= 900;

  // Panel animation variants remain the same
  const panelVariants = isMobile
    ? {
        hidden: { y: "100%" },
        visible: {
          y: 0,
          transition: { type: "spring", damping: 30, stiffness: 300 },
        },
        exit: {
          y: "100%",
          transition: { duration: 0.3, ease: "easeIn" },
        },
      }
    : {
        hidden: { x: "100%" },
        visible: {
          x: 0,
          transition: { type: "spring", damping: 30, stiffness: 300 },
        },
        exit: {
          x: "100%",
          transition: { duration: 0.3, ease: "easeIn" },
        },
      };

  // Shared styles (keep as is)
  const detailSectionTitleStyle = styles?.detailSectionTitleStyle || {
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.72px",
    color: theme.colors.neutral?.[700] || "#4B5563",
    margin: `0 0 ${theme.spacing?.(1.5) || "12px"} 0`,
  };
  const detailParagraphStyle = styles?.detailParagraphStyle || {
    fontSize: "16px",
    lineHeight: 1.6,
    color: theme.colors.neutral?.[700] || "#4B5563",
    margin: "0 0 8px 0",
  };
  const detailLinkStyle = styles?.detailLinkStyle || {
    color: theme.colors.primary,
    textDecoration: "none",
    fontSize: "16px",
    wordBreak: "break-word",
    transition: "opacity 0.2s",
    "&:hover": { opacity: 0.8 },
  };
  const handleLinkEnter = (e) => (e.target.style.opacity = 0.8);
  const handleLinkLeave = (e) => (e.target.style.opacity = 1);

  const renderAddressLines = () => {
    if (!dealer.address) return null;
    const { line1, line2, city, state, pincode, country } = dealer.address;
    return (
      <>
        {" "}
        {line1 && (
          <>
            {line1}
            <br />
          </>
        )}{" "}
        {line2 && (
          <>
            {line2}
            <br />
          </>
        )}{" "}
        {city && `${city}, `} {state && `${state} `} {pincode}{" "}
        {country && (
          <>
            <br />
            {country}
          </>
        )}{" "}
      </>
    );
  };

  // Button styles (keep as is, use for desktop/mobile actions)
  const actionButtonStyleBase: React.CSSProperties = {
    padding: "10px 16px",
    backgroundColor: theme.colors.neutral?.[800] || "#1F2937",
    color: theme.colors.white || "#FFFFFF",
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none",
    textAlign: "center",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    borderRadius: theme.shape?.medium || "6px",
    transition: "filter 0.2s ease-out, background-color 0.2s",
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
  };

  // Define Mobile Footer Height (adjust as needed)
  const mobileFooterHeight = 64; // pixels

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
            zIndex: 40, // Panel itself
            display: "flex",
            flexDirection: "column",
            boxShadow: theme.shadows?.[3] || "0 4px 12px rgba(0,0,0,0.1)",
            ...(isMobile
              ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "100%", // Take full height
                  maxHeight: "100%",
                  // No border radius for full screen panel
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }
              : {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${styles?.detailPanelWidth || 400}px`,
                  height: "100%",
                  borderLeft: `1px solid ${theme.colors.outline || "#e5e7eb"}`,
                }),
            overflow: "hidden", // Prevent outer scroll
          }}
        >
          {/* Header (Conditional Rendering: Mobile vs Desktop) */}
          <div
            style={{
              // Shared header styles
              padding: `${theme.spacing?.(1.5) || "12px"} ${
                theme.spacing?.(2) || "16px"
              }`,
              borderBottom: `1px solid ${theme.colors.outline || "#e5e7eb"}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0, // Header doesn't shrink
              zIndex: 5, // Above scroll content
              backgroundColor: theme.colors.surface,
              // Apply safe area padding only to top on mobile
              paddingTop: isMobile
                ? `max(${
                    theme.spacing?.(1.5) || "12px"
                  }, env(safe-area-inset-top))`
                : `${theme.spacing?.(1.5) || "12px"}`,
            }}
          >
            {isMobile ? ( // --- Mobile Header (NEW Layout: Title | Close Button) ---
              <>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 600,
                    color: theme.colors.onSurface,
                    fontFamily: theme.typography?.fontFamily || "inherit",
                    userSelect: "none",
                    flexGrow: 1, // Title takes available space
                    textAlign: "left", // Align title left
                    overflow: "hidden", // Handle long names
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: "10px", // Space before close button
                  }}
                >
                  {dealer.name}
                </h2>
                <motion.button // Close Button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor:
                      theme.colors.neutral?.[100] || "rgba(0,0,0,0.05)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0, // Button doesn't shrink
                    color: theme.colors.neutral?.[500] || "#6B7280",
                  }}
                  aria-label="Close details"
                  type="button"
                >
                  <MaterialIcon iconName="close" size={24} />
                </motion.button>
              </>
            ) : (
              // --- Desktop Header (Keep as is) ---
              <>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: 600,
                    color: theme.colors.onSurface,
                    fontFamily: theme.typography?.fontFamily || "inherit",
                    userSelect: "none",
                    flexGrow: 1,
                    paddingRight: "10px",
                  }}
                >
                  {" "}
                  {dealer.name}{" "}
                </h2>
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor:
                      theme.colors.neutral?.[100] || "rgba(0,0,0,0.05)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                    color: theme.colors.neutral?.[500] || "#6B7280",
                  }}
                  aria-label="Close details"
                  type="button"
                >
                  {" "}
                  <MaterialIcon iconName="close" size={24} />{" "}
                </motion.button>
              </>
            )}
          </div>

          {/* Scrollable Content Area */}
          <div
            style={{
              overflowY: "auto", // Enable vertical scroll
              flexGrow: 1, // Takes remaining space
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              // Adjust bottom padding based on mobile/desktop
              paddingBottom: isMobile
                ? `max(${
                    theme.spacing?.(2.5) || "20px"
                  }, calc(env(safe-area-inset-bottom, 0) + ${mobileFooterHeight}px))` // Account for footer height AND safe area
                : `max(${
                    theme.spacing?.(2.5) || "20px"
                  }, env(safe-area-inset-bottom, 0))`, // Desktop only needs safe area
            }}
          >
            {/* Conditional Image (Hidden on Mobile) */}
            {shouldShowImage && (
              <div
                style={{
                  width: "100%",
                  height: "240px", // Only desktop height matters now
                  position: "relative",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              >
                {" "}
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
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />{" "}
              </div>
            )}

            {/* Main Detail Content Sections */}
            <div
              style={{
                padding: `${theme.spacing?.(2.5) || "20px"}`, // Standard padding
              }}
            >
              {/* Address Section */}
              {dealer.address && (
                <section
                  style={{
                    marginBottom: theme.spacing?.(3) || "24px",
                  }}
                >
                  {" "}
                  <h3 style={detailSectionTitleStyle}>ADDRESS</h3>{" "}
                  <p style={detailParagraphStyle}>{renderAddressLines()}</p>{" "}
                  {dealer.distance !== undefined && dealer.distance >= 0 && (
                    <p
                      style={
                        styles?.detailDistanceStyle || {
                          fontSize: "14px",
                          color: theme.colors.neutral?.[600] || "#6B7280",
                          margin: "8px 0 0 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }
                      }
                    >
                      {" "}
                      <MaterialIcon
                        iconName="near_me"
                        size={16}
                        color={theme.colors.primary}
                      />{" "}
                      {dealer.distance} {distanceUnit} away{" "}
                    </p>
                  )}{" "}
                </section>
              )}

              {/* Contact Section */}
              {(dealer.contact?.phone ||
                dealer.contact?.email ||
                dealer.contact?.website) && (
                <section
                  style={{
                    marginBottom: theme.spacing?.(3) || "24px",
                  }}
                >
                  {" "}
                  <h3 style={detailSectionTitleStyle}>{contactLabel}</h3>{" "}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {" "}
                    {dealer.contact.phone && callUrl && (
                      <div
                        style={
                          styles?.detailContactItemStyle || {
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }
                        }
                      >
                        {" "}
                        <MaterialIcon
                          iconName="call"
                          size={20}
                          color={theme.colors.onSurfaceVariant}
                        />{" "}
                        <a
                          href={callUrl}
                          style={detailLinkStyle}
                          onMouseEnter={handleLinkEnter}
                          onMouseLeave={handleLinkLeave}
                        >
                          {" "}
                          {formatPhone(dealer.contact.phone)}{" "}
                        </a>{" "}
                      </div>
                    )}{" "}
                    {dealer.contact.email && (
                      <div
                        style={
                          styles?.detailContactItemStyle || {
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }
                        }
                      >
                        {" "}
                        <MaterialIcon
                          iconName="mail"
                          size={20}
                          color={theme.colors.onSurfaceVariant}
                        />{" "}
                        <a
                          href={`mailto:${dealer.contact.email}`}
                          style={detailLinkStyle}
                          onMouseEnter={handleLinkEnter}
                          onMouseLeave={handleLinkLeave}
                        >
                          {dealer.contact.email}
                        </a>{" "}
                      </div>
                    )}{" "}
                    {dealer.contact.website && (
                      <div
                        style={
                          styles?.detailContactItemStyle || {
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }
                        }
                      >
                        {" "}
                        <MaterialIcon
                          iconName="language"
                          size={20}
                          color={theme.colors.onSurfaceVariant}
                        />{" "}
                        <a
                          href={formatUrl(dealer.contact.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={detailLinkStyle}
                          onMouseEnter={handleLinkEnter}
                          onMouseLeave={handleLinkLeave}
                        >
                          {dealer.contact.website.replace(/^https?:\/\//, "")}
                        </a>{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </section>
              )}

              {/* Hours Section */}
              {dealer.hours && dealer.hours.length > 0 && (
                <section
                  style={{
                    marginBottom: theme.spacing?.(3) || "24px",
                  }}
                >
                  {" "}
                  <h3 style={detailSectionTitleStyle}>{hoursLabel}</h3>{" "}
                  <div
                    style={
                      styles?.detailHoursGridStyle || {
                        display: "grid",
                        gridTemplateColumns: "100px 1fr",
                        gap: "10px",
                        fontSize: "14px",
                      }
                    }
                  >
                    {" "}
                    {dealer.hours.map((hour) => (
                      <React.Fragment key={hour.day}>
                        {" "}
                        <div
                          style={{
                            ...(styles?.detailHoursDayStyle || {}),
                            fontWeight: hour.day === today ? 600 : 400,
                            color:
                              hour.day === today
                                ? theme.colors.primary
                                : theme.colors.neutral?.[600] || "#6B7280",
                          }}
                        >
                          {" "}
                          {hour.day}{" "}
                        </div>{" "}
                        <div
                          style={{
                            ...(styles?.detailHoursTimeStyle || {}),
                            fontWeight: hour.day === today ? 600 : 400,
                            color:
                              hour.open === "Closed"
                                ? theme.colors.neutral?.[400] || "#9CA3AF"
                                : hour.day === today
                                ? theme.colors.primary
                                : theme.colors.onSurface,
                          }}
                        >
                          {" "}
                          {hour.open === "Closed"
                            ? "Closed"
                            : `${hour.open} - ${hour.close}`}{" "}
                        </div>{" "}
                      </React.Fragment>
                    ))}{" "}
                  </div>{" "}
                </section>
              )}

              {/* Services Section */}
              {dealer.services && dealer.services.length > 0 && (
                <section
                  style={{
                    marginBottom: theme.spacing?.(3) || "24px",
                  }}
                >
                  {" "}
                  <h3 style={detailSectionTitleStyle}>{servicesLabel}</h3>{" "}
                  <div
                    style={
                      styles?.detailServicesListStyle || {
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }
                    }
                  >
                    {" "}
                    {[
                      {
                        key: "sales",
                        label: "Sales",
                        icon: "storefront",
                        color: theme.colors.sales,
                      },
                      {
                        key: "service",
                        label: "Service",
                        icon: "settings",
                        color: theme.colors.service,
                      },
                      {
                        key: "charging",
                        label: "Charging",
                        icon: "bolt",
                        color: theme.colors.accent,
                      },
                    ].map((serviceInfo) => {
                      const available = dealer.services?.some(
                        (s) =>
                          s.toLowerCase() === serviceInfo.key ||
                          (serviceInfo.key === "sales" &&
                            s.toLowerCase() === "store") ||
                          (serviceInfo.key === "service" &&
                            s.toLowerCase() === "repair")
                      );
                      return (
                        <div
                          key={serviceInfo.key}
                          style={{
                            ...(styles?.detailServiceItemStyle || {
                              fontSize: "16px",
                              lineHeight: 1.4,
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }),
                            color: available
                              ? theme.colors.onSurface
                              : theme.colors.neutral?.[400] || "#9CA3AF",
                            opacity: available ? 1 : 0.6,
                          }}
                        >
                          {" "}
                          <MaterialIcon
                            iconName={serviceInfo.icon}
                            size={20}
                            color={
                              available
                                ? serviceInfo.color
                                : theme.colors.neutral?.[400] || "#9CA3AF"
                            }
                            filled={available}
                          />{" "}
                          <span
                            style={{
                              fontWeight: available ? 500 : 400,
                            }}
                          >
                            {" "}
                            {serviceInfo.label}{" "}
                          </span>{" "}
                        </div>
                      );
                    })}{" "}
                  </div>{" "}
                </section>
              )}
            </div>
          </div>

          {/* Actions Footer (Conditional: Mobile vs Desktop) */}
          {isMobile ? ( // --- Mobile Footer (NEW Layout: Back | Call) ---
            <div
              style={{
                position: "absolute", // Fixed position at the bottom
                bottom: 0,
                left: 0,
                right: 0,
                height: `${mobileFooterHeight}px`,
                display: "flex",
                borderTop: `1px solid ${theme.colors.outline || "#e5e7eb"}`,
                backgroundColor: theme.colors.surface, // Use surface color
                zIndex: 5, // Above scroll content
                flexShrink: 0, // Footer doesn't shrink
                paddingBottom: `env(safe-area-inset-bottom)`, // Add safe area padding
              }}
            >
              {/* Back Button */}
              <motion.button
                onClick={onClose} // Back button simply closes the panel
                whileHover={{ filter: "brightness(0.95)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...actionButtonStyleBase,
                  flex: 1, // Take half the space
                  backgroundColor: theme.colors.surface, // Lighter background
                  color: theme.colors.neutral?.[700], // Darker text
                  borderRadius: 0, // No radius for split button
                  borderRight: `1px solid ${theme.colors.outline}`, // Separator
                }}
                aria-label="Go back"
              >
                <MaterialIcon iconName="arrow_back" size={20} color="inherit" />
                {/* Optionally add text: <span>Back</span> */}
              </motion.button>

              {/* Call Button */}
              {callUrl ? (
                <motion.a
                  href={callUrl}
                  whileHover={{ filter: "brightness(1.1)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...actionButtonStyleBase,
                    flex: 1, // Take half the space
                    borderRadius: 0, // No radius for split button
                    // Use primary color for call action
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.onPrimary,
                  }}
                  aria-label={`Call ${dealer.name}`}
                >
                  <MaterialIcon iconName="call" size={20} color="inherit" />
                  <span>Call</span>
                </motion.a>
              ) : (
                // Optional: Placeholder or disabled state if no call URL
                <div
                  style={{
                    ...actionButtonStyleBase,
                    flex: 1,
                    borderRadius: 0,
                    backgroundColor: theme.colors.neutral?.[200],
                    color: theme.colors.neutral?.[500],
                    cursor: "not-allowed",
                    opacity: 0.6,
                  }}
                >
                  <MaterialIcon iconName="call_end" size={20} color="inherit" />
                  <span>Call</span>
                </div>
              )}
            </div>
          ) : (
            // --- Desktop Footer (Keep as is) ---
            <div
              style={{
                ...(styles?.detailActionsFooterStyle || {
                  display: "flex",
                  padding: "16px",
                  borderTop: `1px solid ${theme.colors.outline || "#e5e7eb"}`,
                  gap: "12px",
                  backgroundColor: theme.colors.surface,
                  flexShrink: 0,
                }),
                paddingBottom: `max(16px, env(safe-area-inset-bottom, 0))`,
              }}
            >
              {" "}
              {callUrl && (
                <motion.a
                  href={callUrl}
                  whileHover={{ filter: "brightness(1.1)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...(styles?.detailActionButtonStyle ||
                      actionButtonStyleBase),
                    flex: 1,
                  }}
                >
                  {" "}
                  <MaterialIcon
                    iconName="call"
                    size={18}
                    color="inherit"
                  />{" "}
                  <span>Call</span>{" "}
                </motion.a>
              )}{" "}
              {directionsUrl !== "#" && (
                <motion.a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ filter: "brightness(1.1)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...(styles?.detailActionButtonStyle ||
                      actionButtonStyleBase),
                    flex: 1,
                  }}
                >
                  {" "}
                  <MaterialIcon
                    iconName="directions"
                    size={18}
                    color="inherit"
                  />{" "}
                  <span>{getDirectionsText}</span>{" "}
                </motion.a>
              )}{" "}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- PaginationControls Component ---
// (Keep as is from original)
export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  theme,
  styles,
}) => {
  if (totalPages <= 1) return null;
  const handlePrev = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);
  const handleNext = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  }, [currentPage, totalPages, onPageChange]);
  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;
  const buttonBaseStyle = (disabled) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "50%",
    color: disabled
      ? theme.colors.neutral?.[400] || "#9CA3AF"
      : theme.colors.onSurfaceVariant,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s ease-in-out",
    ...(styles?.paginationButtonStyleBase
      ? styles.paginationButtonStyleBase(disabled)
      : {}),
  });
  return (
    <div
      style={
        styles?.paginationContainerStyle || {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          borderTop: `1px solid ${theme.colors.outline || "#e5e7eb"}`,
          backgroundColor: theme.colors.surface,
          flexShrink: 0,
        }
      }
    >
      {" "}
      <motion.button
        whileHover={
          !prevDisabled
            ? {
                backgroundColor:
                  theme.colors.surfaceVariant || "rgba(0,0,0,0.05)",
              }
            : {}
        }
        whileTap={!prevDisabled ? { scale: 0.95 } : {}}
        style={buttonBaseStyle(prevDisabled)}
        onClick={handlePrev}
        disabled={prevDisabled}
        aria-label="Go to previous page"
        aria-disabled={prevDisabled}
        type="button"
      >
        {" "}
        <MaterialIcon iconName="arrow_back_ios" size={18} />{" "}
      </motion.button>{" "}
      <span
        style={
          styles?.paginationInfoStyle || {
            margin: "0 16px",
            fontSize: "14px",
            color: theme.colors.onSurfaceVariant,
            minWidth: "80px",
            textAlign: "center",
          }
        }
        aria-live="polite"
        aria-atomic="true"
      >
        {" "}
        Page {currentPage} of {totalPages}{" "}
      </span>{" "}
      <motion.button
        whileHover={
          !nextDisabled
            ? {
                backgroundColor:
                  theme.colors.surfaceVariant || "rgba(0,0,0,0.05)",
              }
            : {}
        }
        whileTap={!nextDisabled ? { scale: 0.95 } : {}}
        style={buttonBaseStyle(nextDisabled)}
        onClick={handleNext}
        disabled={nextDisabled}
        aria-label="Go to next page"
        aria-disabled={nextDisabled}
        type="button"
      >
        {" "}
        <MaterialIcon iconName="arrow_forward_ios" size={18} />{" "}
      </motion.button>{" "}
    </div>
  );
};

// --- ErrorDisplay Component ---
// (Keep as is from original)
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
      style={
        styles?.errorOverlayStyle || {
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
        }
      }
      role="alert"
    >
      {" "}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 150,
          delay: 0.1,
        }}
        style={
          styles?.errorIconContainerStyle || {
            marginBottom: "16px",
            color: theme.colors.error || "#DC2626",
          }
        }
      >
        {" "}
        <MaterialIcon iconName="error" size={48} color="inherit" filled />{" "}
      </motion.div>{" "}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={
          styles?.errorTextStyle || {
            color: theme.colors.onSurface,
            fontSize: "16px",
            fontWeight: 500,
            textAlign: "center",
            marginBottom: "24px",
            maxWidth: "80%",
          }
        }
      >
        {" "}
        {message}{" "}
      </motion.div>{" "}
      {onRetry && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.95 }}
          style={
            styles?.errorButtonStyle || {
              backgroundColor: theme.colors.primary,
              color: theme.colors.onPrimary || theme.colors.white || "#FFFFFF",
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
            }
          }
          onClick={onRetry}
          type="button"
        >
          {" "}
          <MaterialIcon iconName="refresh" size={18} color="inherit" />{" "}
          <span>Try Again</span>{" "}
        </motion.button>
      )}{" "}
    </motion.div>
  );
};

// --- MapPlaceholder Component ---
// (Keep as is from original)
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
    style={
      styles?.mapPlaceholderStyle || {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.surfaceVariant || "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }
    }
    aria-label={message}
  >
    {" "}
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
      {" "}
      <MaterialIcon
        iconName="location_off"
        size={64}
        color={hexToRgba(theme.colors.outline || "#E5E7EB", 0.5)}
      />{" "}
    </motion.div>{" "}
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      style={
        styles?.mapPlaceholderTextStyle || {
          color: theme.colors.neutral?.[700] || "#4B5563",
          fontSize: "18px",
          fontWeight: 600,
          marginTop: "16px",
        }
      }
    >
      {" "}
      {message}{" "}
    </motion.div>{" "}
    {subtext && (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        style={
          styles?.mapPlaceholderSubTextStyle || {
            color: theme.colors.neutral?.[500] || "#6B7280",
            fontSize: "14px",
            marginTop: "8px",
            textAlign: "center",
          }
        }
      >
        {" "}
        {subtext}{" "}
      </motion.div>
    )}{" "}
  </motion.div>
);

// --- FilterButton Component ---
// (Keep as is from original)
export const FilterButton = ({
  label,
  isActive,
  onClick,
  iconName,
  theme,
  styles,
}) => {
  const baseStyle = styles?.filterButtonStyleBase
    ? styles.filterButtonStyleBase(isActive)
    : {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        backgroundColor: isActive
          ? theme.colors.surfaceVariant || "rgba(0,0,0,0.05)"
          : "transparent",
        border: `1px solid ${
          isActive ? theme.colors.primary : theme.colors.outline || "#e5e7eb"
        }`,
        borderRadius: theme.shape?.full || "999px",
        color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
        fontSize: "13px",
        fontWeight: isActive ? 600 : 400,
        cursor: "pointer",
        transition: "background-color 0.2s, border-color 0.2s, color 0.2s",
        whiteSpace: "nowrap",
        userSelect: "none",
      };
  return (
    <motion.button
      whileHover={{
        backgroundColor: isActive
          ? theme.colors.neutral?.[100] || "rgba(0,0,0,0.05)"
          : theme.colors.neutral?.[50] || "rgba(0,0,0,0.02)",
      }}
      whileTap={{ scale: 0.98 }}
      style={baseStyle}
      onClick={onClick}
      aria-pressed={isActive}
      type="button"
    >
      {" "}
      {iconName && (
        <MaterialIcon iconName={iconName} size={16} color="currentColor" />
      )}{" "}
      {label}{" "}
    </motion.button>
  );
};
