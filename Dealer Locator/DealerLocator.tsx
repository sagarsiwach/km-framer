// DealerLocator.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";

// --- Inline useDebounce Hook ---
function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 400);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
// --- End Inline useDebounce Hook ---

// --- Imports ---
import {
  GOOGLE_MAP_STYLES,
  SAMPLE_DEALERS,
  getInitialCenter,
  calculateDistance,
  type Dealer,
  type Location,
  type MapProvider,
  type Coordinates,
  type Address,
  type Contact,
  type Hours,
  hexToRgba,
  Icon,
} from "https://framer.com/m/Lib-8AS5.js@OT7MrLyxrSeMBPdmFx17";
import {
  useDealerData,
  useGeolocation,
  useMapApiState,
} from "https://framer.com/m/Hooks-ZmUS.js@t0bAWb1Cb6F6YvK1Z1Pa";
import {
  DealerCard,
  DealerDetailPanel,
  ErrorDisplay,
  LoadingOverlay,
  MapPlaceholder,
  PaginationControls,
  SearchBar,
} from "https://framer.com/m/Components-bS3j.js@PbbpQ6Ble0TPC8xSuXcp";
import MapWrapper from "https://framer.com/m/MapWrapper-dYOf.js@QB8uUzl6D74oWduC0l24";

// --- Main Dealer Locator Component ---
export default function DealerLocator(props) {
  // --- Props ---
  const {
    mapProvider = "mapbox",
    mapboxAccessToken = "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA",
    mapboxMapStyleUrl = "mapbox://styles/mapbox/light-v11",
    googleApiKey = "",
    apiEndpoint = "https://booking-engine.sagarsiwach.workers.dev/dealer",
    initialZoom = 11,
    distanceUnit = "km",
    resultsPerPage = 7,
    showSearchBar = true,
    showFilters = true,
    allowLocationAccess = true,
    primaryColor = "#111827",
    secondaryColor = "#6B7280",
    accentColor = "#16A34A",
    backgroundColor = "#FFFFFF",
    surfaceColor = "#FFFFFF",
    onSurfaceColor = "#111827",
    outlineColor = "#E5E7EB",
    borderRadius = 6,
    showShadows = false,
    searchPlaceholder = "Area / Pincode",
    filterStoresText = "Stores",
    filterServiceText = "Service",
    filterChargingText = "Charging",
    noResultsText = "No locations found.",
    loadingText = "Loading...",
    getDirectionsText = "Navigate",
    servicesLabel = "Services Available",
    hoursLabel = "Opening Hours",
    contactLabel = "Contact",
    style,
    detailPanelWidth = 400,
  } = props;

  // --- State ---
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<Location>(null);
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLocatingCombined, setIsLocatingCombined] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [activeMapCenter, setActiveMapCenter] = useState;
  Coordinates | ([number, number] > getInitialCenter(mapProvider));
  const [activeMapZoom, setActiveMapZoom] = useState(initialZoom);
  const [spinnerRotation, setSpinnerRotation] = useState(0);
  const [showStores, setShowStores] = useState(true);
  const [showService, setShowService] = useState(false);
  const [showCharging, setShowCharging] = useState(false);
  const [mapBackgroundOverlay, setMapBackgroundOverlay] = useState(false);

  // --- Refs ---
  const geocoderRef = useRef<any>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // --- Hooks ---
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const {
    dealers: allDealers,
    isLoading: isDealersLoading,
    error: dealersError,
    refetch: refetchDealers,
  } = useDealerData(apiEndpoint, SAMPLE_DEALERS);
  const {
    userLocation,
    isLocating: isGeoLocating,
    locationError: geoError,
    getUserLocation,
  } = useGeolocation();
  const { isLoaded: isMapApiLoaded, loadError: mapApiLoadError } =
    useMapApiState(mapProvider, googleApiKey);

  // --- Responsive Check ---
  const isMobile = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) return false;
    return typeof window !== "undefined" && window.innerWidth < 768;
  }, []);

  // --- Effects ---
  useEffect(() => {
    /* Geocoder Init */ if (mapProvider === "mapbox" && mapboxAccessToken)
      geocoderRef.current = "mapbox";
    else if (
      mapProvider === "google" &&
      isMapApiLoaded &&
      window.google?.maps?.Geocoder
    )
      geocoderRef.current = new window.google.maps.Geocoder();
    else geocoderRef.current = null;
  }, [mapProvider, isMapApiLoaded, mapboxAccessToken]);

  useEffect(() => {
    /* Loading State */ setIsLocatingCombined(
      isDealersLoading || isGeoLocating,
    );
  }, [isDealersLoading, isGeoLocating]);

  useEffect(() => {
    /* Error State */ setComponentError(
      dealersError || geoError || mapApiLoadError?.message || null,
    );
  }, [dealersError, geoError, mapApiLoadError]);

  useEffect(() => {
    /* Spinner */ let f;
    if (isLocatingCombined) {
      const a = () => {
        setSpinnerRotation((r) => (r + 6) % 360);
        f = requestAnimationFrame(a);
      };
      f = requestAnimationFrame(a);
    } else {
      setSpinnerRotation(0);
    }
    return () => {
      if (f) cancelAnimationFrame(f);
    };
  }, [isLocatingCombined]);

  useEffect(() => {
    /* Provider Reset */ setActiveMapCenter(getInitialCenter(mapProvider));
    setActiveMapZoom(initialZoom);
    setSearchLocation(null);
    setSelectedDealer(null);
    setIsDetailOpen(false);
    setComponentError(null);
  }, [mapProvider, initialZoom]);

  // --- Filtering and Sorting Logic (Depends on multiple states) ---
  useEffect(() => {
    if (RenderTarget.current() === RenderTarget.canvas) {
      setFilteredDealers(SAMPLE_DEALERS.slice(0, resultsPerPage));
      return;
    }

    const locationForDistance = searchLocation || userLocation || null;
    let filtered = allDealers.map((dealer) => ({
      ...dealer,
      distance: locationForDistance
        ? calculateDistance(
            locationForDistance,
            dealer.coordinates,
            distanceUnit,
          )
        : undefined,
    }));

    // Apply Text Search
    if (debouncedSearchQuery && !searchLocation) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name?.toLowerCase().includes(query) ||
          d.address?.formatted?.toLowerCase().includes(query) ||
          d.address?.city?.toLowerCase().includes(query) ||
          d.address?.zip?.toLowerCase().includes(query) ||
          d.address?.pincode?.toLowerCase().includes(query),
      );
    } else if (searchLocation) {
      const MAX_SEARCH_RADIUS_KM = 100;
      const maxDist =
        distanceUnit === "miles"
          ? MAX_SEARCH_RADIUS_KM * 0.621371
          : MAX_SEARCH_RADIUS_KM;
      filtered = filtered.filter(
        (d) => d.distance !== undefined && d.distance <= maxDist,
      );
    }

    // Apply Service Filters
    const anyFilterActive = showStores || showService || showCharging;
    if (anyFilterActive) {
      filtered = filtered.filter((d) => {
        const services = d.services?.map((s) => s.toLowerCase()) || [];
        const isStore =
          services.includes("sales") || services.includes("store");
        const isService =
          services.includes("service") || services.includes("repair");
        const isCharging =
          services.includes("charging") || services.includes("ev charging");
        return (
          (showStores && isStore) ||
          (showService && isService) ||
          (showCharging && isCharging)
        );
      });
    }

    // Sort Results
    filtered.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined)
        return a.distance - b.distance;
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });

    setFilteredDealers(filtered);
    // Reset page only if filters or search *actually change* the list count/order significantly.
    // For simplicity, resetting every time is easier.
    setCurrentPage(1);
  }, [
    allDealers,
    debouncedSearchQuery,
    userLocation,
    searchLocation,
    distanceUnit,
    resultsPerPage,
    showStores,
    showService,
    showCharging,
  ]);

  // --- Pagination Data (Depends on filteredDealers) ---
  const paginatedDealers = useMemo(
    () =>
      filteredDealers.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage,
      ),
    [filteredDealers, currentPage, resultsPerPage],
  );
  const totalPages = useMemo(
    () => Math.ceil(filteredDealers.length / resultsPerPage),
    [filteredDealers, resultsPerPage],
  );

  // --- Theme and Style Generation (Depends on theme props, isMobile, totalPages) ---
  const theme = useMemo(
    () => ({
      /* ... Theme object ... */
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        tertiary: accentColor,
        onPrimary: surfaceColor,
        background: backgroundColor,
        surface: surfaceColor,
        onSurface: onSurfaceColor,
        surfaceVariant: hexToRgba(onSurfaceColor, 0.04),
        onSurfaceVariant: secondaryColor,
        outline: outlineColor,
        error: "#DC2626",
        onErrorContainer: "#7F1D1D",
        tertiaryContainer: hexToRgba(onSurfaceColor, 0.08),
        onTertiaryContainer: onSurfaceColor,
        success: "#16A34A", // Added success color for service indicators
      },
      typography: {
        fontFamily:
          "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        titleLarge: {
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "28px",
        },
        titleMedium: {
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: "24px",
        },
        titleSmall: {
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
        },
        bodyLarge: {
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "24px",
        },
        bodyMedium: {
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "20px",
        },
        bodySmall: {
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "16px",
        },
        labelLarge: {
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
        },
        labelMedium: {
          fontSize: "12px",
          fontWeight: 500,
          lineHeight: "16px",
        },
        labelSmall: {
          fontSize: "11px",
          fontWeight: 500,
          lineHeight: "16px",
        },
      },
      shape: {
        medium: `${borderRadius}px`,
        full: "9999px",
        small: `${Math.max(2, Math.round(borderRadius * 0.6))}px`,
        extraSmall: `${Math.max(2, Math.round(borderRadius * 0.33))}px`,
      },
      spacing: (m = 1) => `${8 * m}px`,
      shadows: showShadows
        ? [
            "none",
            `0 1px 2px ${hexToRgba("#000000", 0.05)}`,
            `0 4px 6px -1px ${hexToRgba("#000000", 0.1)}`,
            `0 10px 15px -3px ${hexToRgba("#000000", 0.1)}`,
            `0 20px 25px -5px ${hexToRgba("#000000", 0.1)}`,
          ]
        : Array(6).fill("none"),
    }),
    [
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      surfaceColor,
      onSurfaceColor,
      outlineColor,
      borderRadius,
      showShadows,
    ],
  );

  const styles = useMemo(() => {
    // --- Define all style objects using theme ---
    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.background,
      overflow: "hidden",
      position: "relative",
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.onSurface,
      ...style,
    };

    const mapContainerStyle: React.CSSProperties = {
      flex: 1,
      minHeight: isMobile ? "50%" : "100%",
      position: "relative",
      backgroundColor: theme.colors.surfaceVariant,
      order: isMobile ? 1 : 2,
    };

    const sidebarStyle: React.CSSProperties = {
      flex: isMobile ? "1" : `0 0 ${detailPanelWidth}px`,
      height: isMobile ? "50%" : "100%",
      display: "flex",
      flexDirection: "column",
      background: theme.colors.surface,
      borderRight: !isMobile ? `1px solid ${theme.colors.outline}` : "none",
      overflow: "hidden",
      order: isMobile ? 2 : 1,
      position: "relative",
    };

    // --- Add more style objects here ---
    const mapOverlayStyle: React.CSSProperties = {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(10, 10, 10, 0.3)",
      backdropFilter: "blur(2.5px)",
      zIndex: 39, // Just below the detail panel
      visibility: mapBackgroundOverlay ? "visible" : "hidden",
      opacity: mapBackgroundOverlay ? 1 : 0,
      transition:
        "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.35s",
    };

    // (keep all other style objects from your original code)...

    return {
      containerStyle,
      mapContainerStyle,
      sidebarStyle,
      mapOverlayStyle,
      // Include all other style objects
      searchFilterContainerStyle,
      locationLabelStyle,
      searchInputContainerStyle,
      searchInputStyle,
      searchIconButtonStyle,
      filterContainerStyle,
      filterCheckboxStyle,
      filterCheckboxIndicatorStyle,
      dealerListContainerStyle,
      dealerCardStyleBase,
      dealerCardIconStyle,
      dealerCardContentStyle,
      dealerCardTextWrapStyle,
      dealerCardTitleStyle,
      dealerCardAddressStyle,
      dealerCardDistanceStyle,
      dealerCardArrowStyle,
      paginationContainerStyle,
      paginationButtonStyleBase,
      paginationInfoStyle,
      detailPanelContainerStyle,
      detailPanelHeaderStyle,
      detailPanelTitleStyle,
      detailPanelCloseButtonStyleBase,
      detailPanelContentStyle,
      detailPanelImageStyle,
      detailSectionTitleStyle,
      detailInfoLineStyle,
      detailInfoLinkStyleBase,
      detailHoursGridStyle,
      detailHoursDayStyle,
      detailHoursTimeStyle,
      detailServicesContainerStyle,
      detailServiceChipStyle,
      detailActionsContainerStyle,
      filledButtonStyle,
      textButtonStyle,
      outlinedButtonStyle,
      loadingOverlayStyle,
      spinnerStyle,
      loadingTextStyle,
      errorOverlayStyle,
      errorIconStyle,
      errorTextStyle,
      errorButtonStyle,
      mapPlaceholderStyle,
      mapPlaceholderTextStyle,
      mapPlaceholderSubTextStyle,
      handleButtonMouseEnter,
      handleButtonMouseLeave,
      handleItemHoverEnter,
      handleItemHoverLeave,
      handlePaginationHoverEnter,
      handlePaginationHoverLeave,
      handleCloseButtonEnter,
      handleCloseButtonLeave,
      handleLinkEnter,
      handleLinkLeave,
    };
  }, [
    theme,
    isMobile,
    style,
    showShadows,
    detailPanelWidth,
    showFilters,
    totalPages,
    mapBackgroundOverlay,
  ]);

  // --- Geocoding Handler ---
  const handleGeocodeSearch = useCallback(
    async (query: string) => {
      /* ... Geocoding logic ... */
      if (!query) {
        setSearchLocation(null);
        return;
      }
      if (RenderTarget.current() === RenderTarget.canvas) return;
      setSearchLocation(null);
      setIsLocatingCombined(true);
      setComponentError(null);
      try {
        if (
          mapProvider === "mapbox" &&
          mapboxAccessToken &&
          geocoderRef.current === "mapbox"
        ) {
          const p = userLocation
            ? `${userLocation.lng},${userLocation.lat}`
            : "";
          const u = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxAccessToken}&limit=1&country=IN${p ? "&proximity=" + p : ""}`;
          const r = await fetch(u);
          setIsLocatingCombined(false);
          if (!r.ok) throw new Error(`Geocoding failed: ${r.statusText}`);
          const d = await r.json();
          if (d.features?.length > 0) {
            const [lng, lat] = d.features[0].center;
            setSearchLocation({ lat, lng });
          } else {
            setComponentError("Could not find location.");
          }
        } else if (
          mapProvider === "google" &&
          geocoderRef.current instanceof window.google.maps.Geocoder
        ) {
          geocoderRef.current.geocode(
            { address: query, region: "IN" },
            (res, stat) => {
              setIsLocatingCombined(false);
              if (stat === "OK" && res?.[0]) {
                const l = res[0].geometry.location;
                setSearchLocation({
                  lat: l.lat(),
                  lng: l.lng(),
                });
              } else {
                setComponentError("Could not find location.");
                console.warn(`Google Geocoding failed: ${stat}`);
              }
            },
          );
        } else {
          setIsLocatingCombined(false);
          setComponentError("Geocoding service not available.");
        }
      } catch (e: any) {
        setIsLocatingCombined(false);
        console.error("Geocoding error:", e);
        setComponentError(e.message || "Geocoding failed.");
      }
    },
    [mapProvider, mapboxAccessToken, userLocation],
  );

  // --- Event Handlers ---
  const handleSearchSubmit = (query: string) => {
    handleGeocodeSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchLocation(null);
    setComponentError(null);
  };

  const handleDealerSelect = useCallback((dealer: Dealer) => {
    setSelectedDealer(dealer);
    setIsDetailOpen(true);
    setMapBackgroundOverlay(true); // Show overlay when detail opens
  }, []);

  const handleMapClick = useCallback(() => {
    // Close the detail panel when clicking outside on the map
    if (isDetailOpen) {
      setIsDetailOpen(false);
      setMapBackgroundOverlay(false);
    }
  }, [isDetailOpen]);

  const handleUseLocation = () => {
    setComponentError(null);
    handleClearSearch();
    getUserLocation();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setMapBackgroundOverlay(false); // Hide overlay when detail closes
  };

  // --- Render Conditionals ---
  const apiKeyMissing = mapProvider === "mapbox" && !mapboxAccessToken;
  const showMapPlaceholder =
    RenderTarget.current() === RenderTarget.canvas || apiKeyMissing;
  const actualMapProvider = apiKeyMissing ? "none" : mapProvider;

  // --- Final Render ---
  return (
    <div style={styles.containerStyle}>
      {/* Overlays */}
      {isLocatingCombined && !componentError && (
        <LoadingOverlay
          theme={theme}
          styles={styles}
          loadingText={loadingText}
          spinnerRotation={spinnerRotation}
        />
      )}

      {componentError && !isDetailOpen && (
        <ErrorDisplay
          message={componentError}
          onRetry={dealersError ? refetchDealers : undefined}
          theme={theme}
          styles={styles}
        />
      )}

      {/* Background overlay for detail panel */}
      <div
        style={styles.mapOverlayStyle}
        onClick={handleDetailClose}
        aria-hidden={!mapBackgroundOverlay}
      />

      {/* Sidebar or Mobile Bottom Section */}
      <div style={styles.sidebarStyle}>
        <div style={styles.searchFilterContainerStyle}>
          {!isMobile && <div style={styles.locationLabelStyle}>Location</div>}
          {showSearchBar && (
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              onClearSearch={handleClearSearch}
              allowLocationAccess={allowLocationAccess}
              onUseLocation={handleUseLocation}
              isLocating={isGeoLocating}
              locationError={null}
              searchPlaceholder={searchPlaceholder}
              useMyLocationText={"Use Location"}
              theme={theme}
              styles={styles}
            />
          )}
          <div style={styles.filterContainerStyle}>
            <label
              style={styles.filterCheckboxStyle(showStores)}
              onClick={() => setShowStores((s) => !s)}
            >
              <span
                style={styles.filterCheckboxIndicatorStyle(showStores)}
              ></span>{" "}
              {filterStoresText}
            </label>
            <label
              style={styles.filterCheckboxStyle(showService)}
              onClick={() => setShowService((s) => !s)}
            >
              <span
                style={styles.filterCheckboxIndicatorStyle(showService)}
              ></span>{" "}
              {filterServiceText}
            </label>
            <label
              style={styles.filterCheckboxStyle(showCharging)}
              onClick={() => setShowCharging((s) => !s)}
            >
              <span
                style={styles.filterCheckboxIndicatorStyle(showCharging)}
              ></span>{" "}
              {filterChargingText}
            </label>
          </div>
        </div>
        <div ref={listContainerRef} style={styles.dealerListContainerStyle}>
          {filteredDealers.length === 0 && !isDealersLoading ? (
            <div
              style={{
                padding: theme.spacing(4),
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
                ...theme.typography.bodyMedium,
              }}
            >
              {noResultsText}
            </div>
          ) : (
            paginatedDealers.map((dealer) => (
              <DealerCard
                key={dealer.id}
                dealer={dealer}
                isSelected={selectedDealer?.id === dealer.id}
                onSelect={handleDealerSelect}
                distanceUnit={distanceUnit}
                theme={theme}
                styles={styles}
              />
            ))
          )}
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          theme={theme}
          styles={styles}
        />
      </div>

      {/* Map Area */}
      <div style={styles.mapContainerStyle}>
        {showMapPlaceholder ? (
          <MapPlaceholder
            message={apiKeyMissing ? "Mapbox Token Required" : "Map Preview"}
            subtext={
              apiKeyMissing
                ? "Add token in properties panel."
                : "Map renders in Preview/Published site."
            }
            theme={theme}
            styles={styles}
          />
        ) : (
          <MapWrapper
            mapProvider={actualMapProvider as MapProvider}
            mapboxAccessToken={mapboxAccessToken}
            center={activeMapCenter}
            zoom={activeMapZoom}
            dealers={filteredDealers}
            selectedDealer={selectedDealer}
            userLocation={userLocation}
            searchLocation={searchLocation}
            onMarkerClick={handleDealerSelect}
            onMapClick={handleMapClick}
            theme={theme}
            distanceUnit={distanceUnit}
            mapboxMapStyleUrl={mapboxMapStyleUrl}
          />
        )}
      </div>

      {/* Detail Panel (Drawer/Sheet) - Rendered last */}
      <DealerDetailPanel
        dealer={selectedDealer}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        distanceUnit={distanceUnit}
        isMobile={isMobile}
        theme={theme}
        styles={styles}
        contactLabel={contactLabel}
        hoursLabel={hoursLabel}
        servicesLabel={servicesLabel}
        getDirectionsText={getDirectionsText}
        mapProvider={actualMapProvider as MapProvider}
      />
    </div>
  );
}

// ========== PROPERTY CONTROLS ==========
addPropertyControls(DealerLocator, {
  // --- Group: Map Setup ---
  _mapGroup: { type: ControlType.Group, title: "Map Setup" },
  mapProvider: {
    title: "Map Provider",
    type: ControlType.Enum,
    options: ["mapbox", "google"],
    optionTitles: ["Mapbox", "Google Maps"],
    defaultValue: "mapbox",
    displaySegmentedControl: true,
    group: "_mapGroup",
  },
  mapboxAccessToken: {
    title: "Mapbox Token",
    type: ControlType.String,
    defaultValue:
      "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA",
    hidden: (props) => props.mapProvider !== "mapbox",
    group: "_mapGroup",
  },
  mapboxMapStyleUrl: {
    title: "Mapbox Style URL",
    type: ControlType.String,
    defaultValue: "mapbox://styles/mapbox/light-v11",
    hidden: (props) => props.mapProvider !== "mapbox",
    group: "_mapGroup",
  },
  googleApiKey: {
    title: "Google API Key",
    type: ControlType.String,
    placeholder: "Paste key here...",
    hidden: (props) => props.mapProvider !== "google",
    group: "_mapGroup",
  },
  googleMapStyle: {
    title: "Google Style",
    type: ControlType.Enum,
    defaultValue: "monochrome_minimal",
    options: GOOGLE_MAP_STYLES.map((s) => s.id),
    optionTitles: GOOGLE_MAP_STYLES.map((s) => s.name),
    hidden: (props) => props.mapProvider !== "google",
    group: "_mapGroup",
  },
  initialZoom: {
    title: "Initial Zoom",
    type: ControlType.Number,
    defaultValue: 11,
    min: 1,
    max: 18,
    step: 1,
    displayStepper: true,
    group: "_mapGroup",
  },
  distanceUnit: {
    title: "Distance Unit",
    type: ControlType.Enum,
    defaultValue: "km",
    options: ["km", "miles"],
    optionTitles: ["KM", "Miles"],
    displaySegmentedControl: true,
    group: "_mapGroup",
  },

  // --- Group: Data & List ---
  _dataGroup: { type: ControlType.Group, title: "Data & List" },
  apiEndpoint: {
    title: "Dealer API Endpoint",
    type: ControlType.String,
    description: "URL for JSON data. Uses sample if empty.",
    defaultValue: "https://booking-engine.sagarsiwach.workers.dev/dealer",
    group: "_dataGroup",
  },
  resultsPerPage: {
    title: "Results Per Page",
    type: ControlType.Number,
    defaultValue: 7,
    min: 1,
    max: 20,
    step: 1,
    displayStepper: true,
    group: "_dataGroup",
  },

  // --- Group: Features ---
  _featuresGroup: { type: ControlType.Group, title: "Features" },
  showSearchBar: {
    title: "Show Search Bar",
    type: ControlType.Boolean,
    defaultValue: true,
    group: "_featuresGroup",
  },
  showFilters: {
    title: "Show Filters",
    type: ControlType.Boolean,
    defaultValue: true,
    group: "_featuresGroup",
  },
  allowLocationAccess: {
    title: "Allow 'Use Location'",
    type: ControlType.Boolean,
    defaultValue: true,
    group: "_featuresGroup",
  },

  // --- Group: Appearance ---
  _appearanceGroup: { type: ControlType.Group, title: "Appearance" },
  primaryColor: {
    title: "Primary",
    type: ControlType.Color,
    defaultValue: "#111827",
    group: "_appearanceGroup",
  },
  secondaryColor: {
    title: "Secondary",
    type: ControlType.Color,
    defaultValue: "#6B7280",
    group: "_appearanceGroup",
  },
  accentColor: {
    title: "Accent (Services)",
    type: ControlType.Color,
    defaultValue: "#16A34A",
    group: "_appearanceGroup",
  },
  backgroundColor: {
    title: "Page Background",
    type: ControlType.Color,
    defaultValue: "#FFFFFF",
    group: "_appearanceGroup",
  },
  surfaceColor: {
    title: "Surface",
    type: ControlType.Color,
    defaultValue: "#FFFFFF",
    group: "_appearanceGroup",
  },
  onSurfaceColor: {
    title: "Text/OnSurface",
    type: ControlType.Color,
    defaultValue: "#111827",
    group: "_appearanceGroup",
  },
  outlineColor: {
    title: "Outline",
    type: ControlType.Color,
    defaultValue: "#E5E7EB",
    group: "_appearanceGroup",
  },
  borderRadius: {
    title: "Border Radius",
    type: ControlType.Number,
    defaultValue: 6,
    min: 0,
    max: 24,
    step: 1,
    displayStepper: true,
    group: "_appearanceGroup",
  },
  showShadows: {
    title: "Show Shadows",
    type: ControlType.Boolean,
    defaultValue: false,
    group: "_appearanceGroup",
  },
  detailPanelWidth: {
    title: "Drawer Width (Desktop)",
    type: ControlType.Number,
    defaultValue: 400,
    min: 250,
    max: 600,
    step: 10,
    displayStepper: true,
    group: "_appearanceGroup",
  },

  // --- Group: Text Labels ---
  _textGroup: { type: ControlType.Group, title: "Text Labels" },
  searchPlaceholder: {
    title: "Search Placeholder",
    type: ControlType.String,
    defaultValue: "Area / Pincode",
    group: "_textGroup",
  },
  filterStoresText: {
    title: "Filter 'Stores'",
    type: ControlType.String,
    defaultValue: "Stores",
    hidden: (props) => !props.showFilters,
    group: "_textGroup",
  },
  filterServiceText: {
    title: "Filter 'Service'",
    type: ControlType.String,
    defaultValue: "Service",
    hidden: (props) => !props.showFilters,
    group: "_textGroup",
  },
  filterChargingText: {
    title: "Filter 'Charging'",
    type: ControlType.String,
    defaultValue: "Charging",
    hidden: (props) => !props.showFilters,
    group: "_textGroup",
  },
  noResultsText: {
    title: "No Results Text",
    type: ControlType.String,
    defaultValue: "No locations found.",
    group: "_textGroup",
  },
  loadingText: {
    title: "Loading Text",
    type: ControlType.String,
    defaultValue: "Loading...",
    group: "_textGroup",
  },
  getDirectionsText: {
    title: "'Directions' Text",
    type: ControlType.String,
    defaultValue: "Navigate",
    group: "_textGroup",
  },
  contactLabel: {
    title: "Contact Label",
    type: ControlType.String,
    defaultValue: "Contact",
    group: "_textGroup",
  },
  hoursLabel: {
    title: "Hours Label",
    type: ControlType.String,
    defaultValue: "Opening Hours",
    group: "_textGroup",
  },
  servicesLabel: {
    title: "Services Label",
    type: ControlType.String,
    defaultValue: "Services Available",
    group: "_textGroup",
  },
});
