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

  // Determine icon based on services
  const hasCharging = dealer.services?.some((s) =>
    s.toLowerCase().includes("charging"),
  );
  const iconName = hasCharging ? "bolt" : "store";

  // Animation variants
  const cardVariants = {
    initial: { scale: 0.98, opacity: 0.8 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.01, y: -2 },
    tap: { scale: 0.98 },
    selected: {
      scale: 1.01,
      y: -2,
      backgroundColor: theme.colors.surfaceVariant,
    },
  };

  return (
    <motion.div
      initial="initial"
      animate={isSelected ? "selected" : "animate"}
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={baseStyle}
      onClick={() => onSelect(dealer)}
      data-dealer-id={dealer.id}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(dealer);
      }}
    >
      <div style={styles.dealerCardIconStyle}>
        <Icon
          name={iconName}
          size={20}
          color={isSelected ? theme.colors.primary : theme.colors.onSurface}
        />
      </div>
      <div style={styles.dealerCardContentStyle}>
        <div style={styles.dealerCardTextWrapStyle}>
          <h3 style={styles.dealerCardTitleStyle}>{dealer.name}</h3>
          <p style={styles.dealerCardAddressStyle}>
            {formatAddress(dealer.address)}
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
              {dealer.services.map((service) => (
                <span
                  key={service}
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    backgroundColor:
                      service.toLowerCase() === "charging"
                        ? hexToRgba(theme.colors.success, 0.1)
                        : theme.colors.surfaceVariant,
                    color:
                      service.toLowerCase() === "charging"
                        ? theme.colors.success
                        : theme.colors.onSurfaceVariant,
                    borderRadius: theme.shape.small,
                    textTransform: "capitalize",
                    fontWeight: 500,
                  }}
                >
                  {service}
                </span>
              ))}
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
          <Icon name="arrow_forward" size={20} />
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

  // Animation variants based on mobile or desktop
  const panelVariants = isMobile
    ? {
        hidden: { y: "100%" },
        visible: { y: 0 },
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
          animate="visible"
          exit="exit"
          variants={panelVariants}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            mass: 0.8,
          }}
          style={{
            position: "absolute",
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
                  maxHeight: "75vh",
                  borderTopLeftRadius: theme.spacing(2),
                  borderTopRightRadius: theme.spacing(2),
                }
              : {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${styles.detailPanelWidth || 400}px`,
                  borderLeft: `1px solid ${theme.colors.outline}`,
                }),
            overflow: "hidden",
          }}
        >
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke={theme.colors.neutral[500]}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                        <a
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
                        <a
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
                        <a
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
                      const available = dealer.services.includes(service);
                      return (
                        <div
                          key={service}
                          style={{
                            color: available
                              ? theme.colors.success
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
                                fill={theme.colors.success}
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
                <Icon name="call" size={16} color={theme.colors.white} />
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
              <Icon
                name="directions_car"
                size={16}
                color={theme.colors.white}
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          <Icon name="close" size={16} />
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
            <Icon name="my_location" size={18} />
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
        <Icon name="arrow_back" size={18} />
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
        <Icon name="arrow_forward" size={18} />
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
        <Icon name="error" size={48} style={styles.errorIconStyle} />
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
          <Icon name="refresh" size={18} color={theme.colors.white} />
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
      <Icon
        name="map_pin"
        color={theme.colors.outline}
        size={64}
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
