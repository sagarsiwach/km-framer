// Components.tsx
import React, { useEffect, useState } from "react";

// Import types and utility functions from Lib.tsx
import {
  ICONS,
  Icon,
  formatAddress,
  formatPhone,
  formatUrl,
  getDirectionsUrl,
  type Dealer,
  type MapProvider,
  type Address,
  type Contact,
  type Hours,
} from "https://framer.com/m/Lib-8AS5.js@OT7MrLyxrSeMBPdmFx17"; // <-- Adjust URL

// --- DealerCard (No changes needed from previous version) ---
export const DealerCard = ({
  dealer,
  isSelected,
  onSelect,
  distanceUnit,
  theme,
  styles,
}) => {
  const baseStyle = styles.dealerCardStyleBase(isSelected);
  const hasCharging = dealer.services?.some((s) =>
    s.toLowerCase().includes("charging"),
  );
  const iconName = hasCharging ? "bolt" : "store";
  return (
    <div
      style={baseStyle}
      onClick={() => onSelect(dealer)}
      data-dealer-id={dealer.id}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(dealer);
      }}
      onMouseEnter={styles.handleItemHoverEnter}
      onMouseLeave={styles.handleItemHoverLeave}
    >
      <div style={styles.dealerCardIconStyle}>
        <Icon name={iconName} size={20} color={theme.colors.onSurface} />
      </div>
      <div style={styles.dealerCardContentStyle}>
        <div style={styles.dealerCardTextWrapStyle}>
          <h3 style={styles.dealerCardTitleStyle}>{dealer.name}</h3>
          <p style={styles.dealerCardAddressStyle}>
            {formatAddress(dealer.address)}
          </p>
          {dealer.distance !== undefined && dealer.distance >= 0 && (
            <p style={styles.dealerCardDistanceStyle}>
              {dealer.distance} {distanceUnit}
            </p>
          )}
        </div>
        <div style={styles.dealerCardArrowStyle}>
          <Icon name="arrow_forward" size={20} />
        </div>
      </div>
    </div>
  );
};

// --- DealerDetailPanel (Adjusted for Drawer Context) ---
export const DealerDetailPanel = ({
  dealer,
  isOpen, // Controlled by parent
  onClose,
  distanceUnit,
  isMobile, // Used for potential internal adjustments
  theme,
  styles, // Styles now handle positioning/transitions
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
    ? `tel:${dealer.contact.phone}`
    : undefined;
  const imageUrl = dealer.imageUrl || null;

  // Use the specific style function from the styles object passed down
  // This style now controls position, transitions, etc.
  const panelStyle = styles.detailPanelContainerStyle(isOpen, isMobile);

  return (
    <div
      style={panelStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dealer-detail-title"
      hidden={!isOpen}
    >
      {/* Optional Drag Handle for Mobile Bottom Sheet? (Add if needed) */}
      {/* {isMobile && <div style={styles.detailPanelDragHandleStyle}></div>} */}

      {/* Header - Remains similar */}
      <div style={styles.detailPanelHeaderStyle}>
        <h2 id="dealer-detail-title" style={styles.detailPanelTitleStyle}>
          {dealer.name}
        </h2>
        <button
          style={styles.detailPanelCloseButtonStyleBase}
          onClick={onClose}
          aria-label="Close details"
          onMouseEnter={styles.handleCloseButtonEnter}
          onMouseLeave={styles.handleCloseButtonLeave}
        >
          <Icon name="close" size={24} />
        </button>
      </div>

      {/* Scrollable Content - Add padding here */}
      <div style={styles.detailPanelContentStyle}>
        {/* Image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`${dealer.name} location`}
            style={styles.detailPanelImageStyle}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        {/* Address & Distance */}
        <div
          style={{
            marginBottom: theme.spacing(1),
            padding: `0 ${theme.spacing(2.5)}`,
          }}
        >
          {" "}
          {/* Add horizontal padding */}
          <p
            style={{
              ...theme.typography.bodyMedium,
              color: theme.colors.onSurface,
              marginBottom: theme.spacing(0.5),
            }}
          >
            {formatAddress(dealer.address)}
          </p>
          {dealer.distance !== undefined && dealer.distance >= 0 && (
            <p
              style={{
                ...theme.typography.bodySmall,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {dealer.distance} {distanceUnit} away
            </p>
          )}
        </div>

        {/* Sections with padding */}
        <div style={{ padding: `0 ${theme.spacing(2.5)}` }}>
          {/* Contact Info */}
          {(dealer.contact?.phone ||
            dealer.contact?.email ||
            dealer.contact?.website) && (
            <div>
              <h3 style={styles.detailSectionTitleStyle(true)}>
                {contactLabel}
              </h3>
              {dealer.contact?.phone && (
                <div style={styles.detailInfoLineStyle}>
                  <Icon
                    name="call"
                    color={theme.colors.onSurfaceVariant}
                    size={18}
                  />
                  <a
                    href={callUrl}
                    style={styles.detailInfoLinkStyleBase}
                    onMouseEnter={styles.handleLinkEnter}
                    onMouseLeave={styles.handleLinkLeave}
                  >
                    {formatPhone(dealer.contact.phone)}
                  </a>
                </div>
              )}
              {dealer.contact?.website && (
                <div style={styles.detailInfoLineStyle}>
                  <Icon
                    name="language"
                    color={theme.colors.onSurfaceVariant}
                    size={18}
                  />
                  <a
                    href={formatUrl(dealer.contact.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.detailInfoLinkStyleBase}
                    onMouseEnter={styles.handleLinkEnter}
                    onMouseLeave={styles.handleLinkLeave}
                  >
                    {dealer.contact.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {dealer.contact?.email && (
                <div style={styles.detailInfoLineStyle}>
                  <Icon
                    name="language"
                    color={theme.colors.onSurfaceVariant}
                    size={18}
                  />
                  <a
                    href={`mailto:${dealer.contact.email}`}
                    style={styles.detailInfoLinkStyleBase}
                    onMouseEnter={styles.handleLinkEnter}
                    onMouseLeave={styles.handleLinkLeave}
                  >
                    {dealer.contact.email}
                  </a>
                </div>
              )}
            </div>
          )}
          {/* Services */}
          {dealer.services && dealer.services.length > 0 && (
            <div>
              <h3 style={styles.detailSectionTitleStyle()}>{servicesLabel}</h3>
              <div style={styles.detailServicesContainerStyle}>
                {dealer.services.map((service) => (
                  <span key={service} style={styles.detailServiceChipStyle}>
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Hours */}
          {dealer.hours && dealer.hours.length > 0 && (
            <div>
              <h3 style={styles.detailSectionTitleStyle()}>{hoursLabel}</h3>
              <div style={styles.detailHoursGridStyle}>
                {dealer.hours.map((hourItem) => (
                  <React.Fragment key={hourItem.day}>
                    <span
                      style={styles.detailHoursDayStyle(hourItem.day === today)}
                    >
                      {hourItem.day}
                    </span>
                    <span
                      style={styles.detailHoursTimeStyle(
                        hourItem.day === today,
                      )}
                    >
                      {hourItem.open === "Closed"
                        ? "Closed"
                        : `${hourItem.open} - ${hourItem.close}`}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer - Remains similar, padding handled by container */}
      <div style={styles.detailActionsContainerStyle}>
        {callUrl && (
          <a
            href={callUrl}
            style={styles.outlinedButtonStyle(false)}
            onMouseEnter={(e) =>
              styles.handleButtonMouseEnter(
                e,
                styles.outlinedButtonStyle,
                false,
                true,
              )
            }
            onMouseLeave={(e) =>
              styles.handleButtonMouseLeave(
                e,
                styles.outlinedButtonStyle,
                false,
                true,
              )
            }
          >
            <Icon name="call" size={16} /> Call
          </a>
        )}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.filledButtonStyle(false)}
          onMouseEnter={(e) =>
            styles.handleButtonMouseEnter(
              e,
              styles.filledButtonStyle,
              false,
              true,
            )
          }
          onMouseLeave={(e) =>
            styles.handleButtonMouseLeave(
              e,
              styles.filledButtonStyle,
              false,
              true,
            )
          }
        >
          <Icon name="directions_car" size={16} /> {getDirectionsText}
        </a>
      </div>
    </div>
  );
};

// --- SearchBar (No functional changes needed, styling controlled by parent) ---
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

  return (
    <div style={styles.searchInputContainerStyle(isFocused)}>
      <button
        style={styles.searchIconButtonStyle}
        onClick={() => {
          if (inputValue.trim()) onSearchSubmit(inputValue.trim());
        }}
        aria-label="Search"
      >
        <Icon name="search" size={20} color={theme.colors.onSurfaceVariant} />
      </button>
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
        <button
          style={{
            ...styles.searchIconButtonStyle,
            color: theme.colors.onSurfaceVariant,
          }}
          onClick={handleClear}
          aria-label="Clear search"
          onMouseEnter={styles.handleCloseButtonEnter}
          onMouseLeave={styles.handleCloseButtonLeave}
        >
          <Icon name="close" size={18} />
        </button>
      )}
      {allowLocationAccess && (
        <button
          style={{
            ...styles.textButtonStyle(isLocating),
            color: isLocating
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant,
            padding: `0 ${theme.spacing(1.5)}`,
          }}
          onClick={onUseLocation}
          disabled={isLocating}
          aria-label={useMyLocationText}
          onMouseEnter={(e) =>
            styles.handleButtonMouseEnter(
              e,
              styles.textButtonStyle,
              isLocating,
              false,
            )
          }
          onMouseLeave={(e) =>
            styles.handleButtonMouseLeave(
              e,
              styles.textButtonStyle,
              isLocating,
              false,
            )
          }
        >
          {isLocating ? (
            <div
              style={{
                width: "18px",
                height: "18px",
                border: `2px solid ${theme.colors.outline}`,
                borderTopColor: theme.colors.primary,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <Icon name="my_location" size={20} />
          )}
        </button>
      )}
    </div>
  );
};

// --- PaginationControls (No changes needed) ---
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
  const prevStyle = styles.paginationButtonStyleBase(prevDisabled);
  const nextStyle = styles.paginationButtonStyleBase(nextDisabled);
  return (
    <div style={styles.paginationContainerStyle}>
      <button
        style={prevStyle}
        onClick={handlePrev}
        disabled={prevDisabled}
        aria-label="Previous page"
        onMouseEnter={(e) => styles.handlePaginationHoverEnter(e, prevDisabled)}
        onMouseLeave={(e) => styles.handlePaginationHoverLeave(e, prevDisabled)}
      >
        <Icon name="arrow_back" size={18} />
      </button>
      <span style={styles.paginationInfoStyle}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        style={nextStyle}
        onClick={handleNext}
        disabled={nextDisabled}
        aria-label="Next page"
        onMouseEnter={(e) => styles.handlePaginationHoverEnter(e, nextDisabled)}
        onMouseLeave={(e) => styles.handlePaginationHoverLeave(e, nextDisabled)}
      >
        <Icon name="arrow_forward" size={18} />
      </button>
    </div>
  );
};

// --- LoadingOverlay (No changes needed) ---
export const LoadingOverlay = ({
  theme,
  styles,
  loadingText,
  spinnerRotation,
}) => (
  <div
    style={styles.loadingOverlayStyle}
    aria-live="assertive"
    aria-busy="true"
  >
    <div style={styles.spinnerStyle(spinnerRotation)} />
    <p style={styles.loadingTextStyle}>{loadingText}</p>
  </div>
);

// --- ErrorDisplay (No changes needed) ---
export const ErrorDisplay = ({ message, onRetry, theme, styles }) => {
  const retryStyle = styles.errorButtonStyle;
  return (
    <div style={styles.errorOverlayStyle} role="alert">
      <Icon name="error" size={36} style={styles.errorIconStyle} />
      <div style={styles.errorTextStyle}>{message}</div>
      {onRetry && (
        <button
          style={retryStyle}
          onClick={onRetry}
          onMouseEnter={(e) =>
            styles.handleButtonMouseEnter(
              e,
              () => styles.errorButtonStyle,
              false,
              true,
            )
          }
          onMouseLeave={(e) =>
            styles.handleButtonMouseLeave(
              e,
              () => styles.errorButtonStyle,
              false,
              true,
            )
          }
        >
          {" "}
          Try Again{" "}
        </button>
      )}
    </div>
  );
};

// --- MapPlaceholder (No changes needed) ---
export const MapPlaceholder = ({ message, subtext, theme, styles }) => (
  <div style={styles.mapPlaceholderStyle}>
    <Icon
      name="map_pin"
      color={theme.colors.outline}
      size={48}
      style={{ opacity: 0.5 }}
    />
    <div style={styles.mapPlaceholderTextStyle}>{message}</div>
    {subtext && <div style={styles.mapPlaceholderSubTextStyle}>{subtext}</div>}
  </div>
);
