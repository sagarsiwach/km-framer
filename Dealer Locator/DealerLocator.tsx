// DealerLocator.tsx
// Re-confirmed desktop sidebar layout structure. No changes needed.
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import { motion, AnimatePresence } from "framer-motion";

// --- Imports (Ensure these URLs are correct in your Framer project) ---
import {
  DEFAULT_CENTER_MAPBOX,
  DEFAULT_ZOOM,
  SAMPLE_DEALERS,
  calculateDistance,
  hexToRgba,
  isValidCoordinates,
  formatAddress,
  formatPhone,
  formatUrl,
  getDirectionsUrl,
  type Dealer,
  type Location,
  type MapProvider,
  type Coordinates,
} from "https://framer.com/m/Lib-8AS5.js";

import {
  useDealerData,
  useGeolocation,
  useMapApiState,
} from "https://framer.com/m/Hooks-ZmUS.js";

import MapWrapper from "https://framer.com/m/MapWrapper-dYOf.js";

import {
  DealerCard,
  DealerDetailPanel,
  ErrorDisplay,
  MapPlaceholder,
  PaginationControls,
  SearchBar, // Ensure SearchBar is imported
  MaterialIcon,
} from "https://framer.com/m/Components-bS3j.js";

import LoadingIndicator from "https://framer.com/m/LoadingOverlay-8m7G.js";

// --- Inline useDebounce Hook ---
function useDebounce(value: string, delay: number = 400): string {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Inject global styles ---
const injectRequiredStyles = (navbarHeight: number) => {
  if (typeof document === "undefined") return;

  const fontLinkId = "material-symbols-font";
  if (!document.getElementById(fontLinkId)) {
    const link = document.createElement("link");
    link.id = fontLinkId;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
    document.head.appendChild(link);
  }

  const styleId = "dealer-locator-global-styles";
  let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
  const newStyleContent = `
        .dealer-locator-container {
            height: 100vh; /* Fallback */
            height: calc(100dvh - ${navbarHeight}px);
            max-height: -webkit-fill-available; /* iOS */
            overscroll-behavior: none;
            touch-action: manipulation;
            display: flex;
            flex-direction: column; /* Mobile First */
            overflow: hidden; /* Prevent container scroll */
        }
        @media (min-width: 768px) { .dealer-locator-container { flex-direction: row; } }
        body.dealer-locator-active { position: fixed !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; text-rendering: optimizeLegibility; user-select: none; }
        .dealer-detail-panel-mobile { height: 100vh; height: 100dvh; }
        .mobile-dealer-list-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; flex-grow: 1; }
    `;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = styleId;
    styleTag.innerHTML = newStyleContent;
    document.head.appendChild(styleTag);
  } else if (styleTag.innerHTML !== newStyleContent) {
    styleTag.innerHTML = newStyleContent;
  }

  document.body.classList.add("dealer-locator-active");
  return () => {
    document.body.classList.remove("dealer-locator-active");
  };
};

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function DealerLocator(props) {
  // ==================== PROPS ====================
  const {
    mapProvider = "mapbox",
    mapboxAccessToken = "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA",
    mapboxMapStyleUrl = "mapbox://styles/mapbox/light-v11",
    googleApiKey = "",
    googleMapStyleId = "monochrome_minimal",
    apiEndpoint = "https://booking-engine.sagarsiwach.workers.dev/dealer",
    initialZoom: initialZoomProp = DEFAULT_ZOOM,
    distanceUnit = "km",
    resultsPerPage = 7,
    useInfiniteScroll = true,
    showSearchBar = true,
    allowLocationAccess = true,
    primaryColor = "#111827",
    secondaryColor = "#6B7280",
    accentColor = "#22C55E",
    salesColor = "#0284C7",
    serviceColor = "#DC2626",
    backgroundColor = "#FFFFFF",
    surfaceColor = "#FFFFFF",
    onSurfaceColor = "#111827",
    outlineColor = "#E5E7EB",
    borderRadius = 6,
    showShadows = true,
    searchPlaceholder = "Area / Pincode",
    noResultsText = "No locations found.",
    loadingText = "Loading...",
    getDirectionsText = "Navigate",
    servicesLabel = "Services Available",
    hoursLabel = "Opening Hours",
    contactLabel = "Contact",
    title = "Locate a Dealer",
    description = "Discover our network of partners.",
    style,
    detailPanelWidth = 400,
    navbarHeight = 81,
    mobileListHeightPercent = 45,
  } = props;

  // ==================== STATE & REFS ====================
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mapBackgroundOverlay, setMapBackgroundOverlay] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [searchLocation, setSearchLocation] = useState<Location>(null);
  const [geocodeResult, setGeocodeResult] = useState<any>(null); // Used to determine zoom after geocode
  const [filteredAndSortedDealers, setFilteredAndSortedDealers] = useState<
    Dealer[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [areMarkersReady, setAreMarkersReady] = useState<boolean>(false);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const userLocationRequestedRef = useRef<boolean>(false); // Tracks if the user explicitly clicked "Use My Location"
  const isMountedRef = useRef<boolean>(false);
  const mapNeedsUpdateRef = useRef<{
    center?: Location | null; // Can be null to signal a reset
    zoom?: number;
    type: "fly" | "jump";
  } | null>(null);

  // ==================== HOOKS ====================
  const isMobile = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) return false;
    return typeof window !== "undefined" && window.innerWidth < 768;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const cleanupStyles = injectRequiredStyles(navbarHeight);
    return () => {
      isMountedRef.current = false;
      cleanupStyles();
    };
  }, [navbarHeight]);

  const {
    dealers: allDealersRaw,
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

  // ==================== COMPUTED VALUES ====================
  const actualMapProvider: MapProvider = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) return "none";
    if (mapProvider === "mapbox" && mapboxAccessToken) return "mapbox";
    if (mapProvider === "google" && googleApiKey && isMapApiLoaded)
      return "google";
    return "none";
  }, [mapProvider, mapboxAccessToken, googleApiKey, isMapApiLoaded]);

  const apiKeyMissing = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) return false;
    return (
      (mapProvider === "mapbox" && !mapboxAccessToken) ||
      (mapProvider === "google" && !googleApiKey)
    );
  }, [mapProvider, mapboxAccessToken, googleApiKey]);

  const showMapPlaceholder = useMemo(
    () => apiKeyMissing || actualMapProvider === "none",
    [apiKeyMissing, actualMapProvider]
  );

  const isBusy = useMemo(() => isDealersLoading, [isDealersLoading]);

  // Filter out dealers without valid coordinates early
  const validDealers = useMemo(
    () => allDealersRaw.filter((d) => isValidCoordinates(d.coordinates)),
    [allDealersRaw]
  );

  // Paginate or limit the filtered/sorted dealers for display
  const displayedDealers = useMemo(() => {
    const limit = useInfiniteScroll
      ? currentPage * resultsPerPage
      : resultsPerPage;
    const offset = useInfiniteScroll ? 0 : (currentPage - 1) * resultsPerPage;
    return filteredAndSortedDealers.slice(offset, offset + limit);
  }, [
    filteredAndSortedDealers,
    currentPage,
    resultsPerPage,
    useInfiniteScroll,
  ]);

  const totalPages = useMemo(() => {
    if (
      useInfiniteScroll ||
      !filteredAndSortedDealers ||
      filteredAndSortedDealers.length === 0
    )
      return 1; // Infinite scroll doesn't use total pages display
    return Math.ceil(filteredAndSortedDealers.length / resultsPerPage);
  }, [filteredAndSortedDealers, resultsPerPage, useInfiniteScroll]);

  // Memoize initial map center/zoom based on props
  const initialMapCenter = useMemo(() => DEFAULT_CENTER_MAPBOX, []); // Using Mapbox default as base
  const initialZoom = useMemo(() => initialZoomProp, [initialZoomProp]);

  // ==================== EFFECTS ====================

  // Handle Component Errors (Display overlay)
  useEffect(() => {
    let errorMsg: string | null = null;
    if (dealersError) errorMsg = dealersError;
    else if (mapApiLoadError)
      errorMsg = `Map API Error: ${mapApiLoadError.message}`;
    else if (apiKeyMissing && RenderTarget.current() !== RenderTarget.canvas)
      errorMsg = `API Key/Token missing for ${mapProvider}. Map disabled.`;

    // Only update state if the error message actually changes
    if (errorMsg !== componentError) {
      setComponentError(errorMsg);
      if (errorMsg) console.error("DealerLocator Error:", errorMsg);
    }
  }, [
    dealersError,
    mapApiLoadError,
    apiKeyMissing,
    mapProvider,
    componentError,
  ]);

  // Manage Initial Loading State (Show full screen loader)
  useEffect(() => {
    // Hide loader once dealers are loaded AND map is ready (or placeholder shown)
    if (
      isInitialLoading &&
      !isDealersLoading &&
      (areMarkersReady || showMapPlaceholder)
    ) {
      // Add a small delay for smoother transition
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setIsInitialLoading(false);
          console.log("Initial loading complete.");
        }
      }, 300); // Adjust delay as needed
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading, isDealersLoading, areMarkersReady, showMapPlaceholder]);

  // Fallback to hide loader if it gets stuck
  useEffect(() => {
    if (isInitialLoading) {
      const fallbackTimer = setTimeout(() => {
        if (isMountedRef.current && isInitialLoading) {
          console.warn(
            "Initial load fallback timeout triggered. Hiding loader."
          );
          setIsInitialLoading(false);
        }
      }, 8000); // 8 seconds fallback
      return () => clearTimeout(fallbackTimer);
    }
  }, [isInitialLoading]);

  // --- Map Update Trigger Effects ---
  // These effects queue map updates by setting `mapNeedsUpdateRef.current`.
  // The `MapWrapper` component consumes this ref in its own effect.

  // Trigger map update when USER explicitly requests their location
  useEffect(() => {
    if (userLocation && userLocationRequestedRef.current) {
      console.log(
        "Effect: Queueing map update for requested user location:",
        userLocation
      );
      mapNeedsUpdateRef.current = {
        center: userLocation,
        zoom: 12, // Zoom in reasonably close for user location
        type: "fly",
      };
      userLocationRequestedRef.current = false; // Reset flag after queuing
    }
  }, [userLocation]); // Only depends on userLocation changing

  // Trigger map update after a successful SEARCH geocode result
  useEffect(() => {
    if (searchLocation && geocodeResult) {
      console.log(
        "Effect: Queueing map update for search location:",
        searchLocation
      );
      // Determine appropriate zoom based on geocode result type
      let newZoom = 13; // Default zoom for searches
      if (geocodeResult?.place_type) {
        const pt = geocodeResult.place_type[0];
        if (pt === "country") newZoom = 5;
        else if (pt === "region") newZoom = 7; // State/Province
        else if (pt === "district") newZoom = 9; // County/District
        else if (pt === "place") newZoom = 11; // City/Town
        else if (pt === "locality" || pt === "neighborhood") newZoom = 13;
        else if (pt === "address" || pt === "poi")
          newZoom = 15; // Specific address or Point of Interest
        else if (pt === "postcode") newZoom = 12;
      }
      mapNeedsUpdateRef.current = {
        center: searchLocation,
        zoom: newZoom,
        type: "fly",
      };
      setGeocodeResult(null); // Consume the geocode result after queuing update
    }
  }, [searchLocation, geocodeResult]); // Depends on search location & geocode result

  // Trigger map update when a DEALER is selected AND detail panel opens
  useEffect(() => {
    // Only fly to dealer if the detail panel is intended to be open
    if (
      selectedDealer &&
      isDetailOpen &&
      isValidCoordinates(selectedDealer.coordinates)
    ) {
      console.log(
        "Effect: Queueing map update for selected dealer:",
        selectedDealer.name
      );
      mapNeedsUpdateRef.current = {
        center: selectedDealer.coordinates,
        zoom: 14, // Zoom reasonably close to the dealer
        type: "fly",
      };
    }
    // Note: No 'else' block needed here. If no dealer is selected or panel isn't open,
    // we don't queue an update based on selection. The map stays where it is.
  }, [selectedDealer, isDetailOpen]); // Depends on selected dealer and panel state

  // --- Data Processing Effects ---

  // Filter and Sort Dealers whenever relevant state changes
  useEffect(() => {
    if (isDealersLoading) return; // Don't process while fetching

    // Determine the location to calculate distances from (search overrides user location)
    const locationForDistance = searchLocation || userLocation || null;

    // 1. Calculate distances (if a reference location exists)
    let processedDealers = validDealers.map((dealer) => ({
      ...dealer,
      distance:
        locationForDistance && dealer.coordinates
          ? calculateDistance(
              locationForDistance,
              dealer.coordinates,
              distanceUnit
            )
          : undefined,
    }));

    // 2. Filter by search query (if present)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      processedDealers = processedDealers.filter(
        (d) =>
          d.name?.toLowerCase().includes(query) ||
          d.address?.formatted?.toLowerCase().includes(query) ||
          d.address?.city?.toLowerCase().includes(query) ||
          d.address?.pincode?.includes(query) ||
          d.services?.some((s) => s.toLowerCase().includes(query))
      );
    }

    // 3. Sort dealers: Featured first, then by distance, then alphabetically
    processedDealers.sort((a, b) => {
      // Featured status
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Distance (if available for both)
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      // If only one has distance, prioritize the one with distance
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;

      // Fallback to name sorting
      return (a.name || "").localeCompare(b.name || "");
    });

    setFilteredAndSortedDealers(processedDealers);

    // Reset pagination/scroll if filters change (unless it's just loading more)
    if (!isLoadingMore && currentPage !== 1) {
      setCurrentPage(1);
      // Reset scroll position of the list
      listContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [
    validDealers, // Source data (already filtered for valid coords)
    debouncedSearchQuery, // User's typed search
    userLocation, // User's GPS location
    searchLocation, // Location from search query geocoding
    distanceUnit, // Unit for distance calculation
    isDealersLoading, // To prevent processing during load
    // Dependencies related to pagination/infinite scroll:
    isLoadingMore,
    currentPage,
  ]);

  // Infinite Scroll Logic & Listener
  const handleScroll = useCallback(() => {
    if (
      !useInfiniteScroll ||
      isLoadingMore ||
      currentPage * resultsPerPage >= filteredAndSortedDealers.length
    )
      return; // Exit if not applicable or already loading/finished

    const listEl = listContainerRef.current;
    if (listEl) {
      const { scrollTop, scrollHeight, clientHeight } = listEl;
      // Trigger load more when near the bottom (e.g., 400px from end)
      if (
        scrollHeight > clientHeight && // Ensure there's actually overflow
        scrollHeight - scrollTop - clientHeight < 400
      ) {
        setIsLoadingMore(true);
        // Use requestAnimationFrame to avoid layout thrashing
        requestAnimationFrame(() => {
          setCurrentPage((prev) => prev + 1);
          // Allow state update then reset loading flag
          setTimeout(() => setIsLoadingMore(false), 150);
        });
      }
    }
  }, [
    useInfiniteScroll,
    isLoadingMore,
    currentPage,
    resultsPerPage,
    filteredAndSortedDealers.length,
  ]);
  useEffect(() => {
    const listElement = listContainerRef.current;
    if (listElement && useInfiniteScroll) {
      // Add passive scroll listener for performance
      listElement.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      // Cleanup listener on unmount or if infinite scroll is turned off
      return () => {
        listElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [useInfiniteScroll, handleScroll]); // Re-attach if infinite scroll toggled

  // ==================== THEME GENERATION ====================
  // Memoize theme object to avoid recalculation unless colors/props change
  const theme = useMemo(
    () => ({
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        sales: salesColor,
        service: serviceColor,
        background: backgroundColor,
        surface: surfaceColor,
        onSurface: onSurfaceColor,
        outline: outlineColor,
        error: "#DC2626", // Standard error red
        onError: "#FFFFFF",
        success: accentColor,
        white: "#FFFFFF",
        neutral: {
          // Material-like neutral scale
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        onSurfaceVariant: secondaryColor, // Color for less prominent text on surface
        surfaceVariant: hexToRgba(onSurfaceColor || "#111827", 0.05), // Subtle background variant
        onPrimary: surfaceColor, // Text color on primary background
      },
      typography: {
        // Define a base font stack
        fontFamily:
          "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
      },
      shape: {
        // Define border radius levels based on the main prop
        small: `${Math.max(2, Math.round(borderRadius * 0.5))}px`,
        medium: `${borderRadius}px`,
        large: `${Math.max(4, Math.round(borderRadius * 1.5))}px`,
        full: "9999px", // For pills/circular elements
      },
      // Utility for consistent spacing (based on 8px grid)
      spacing: (multiplier = 1) => `${8 * multiplier}px`,
      // Define shadow levels (can be turned off)
      shadows: showShadows
        ? [
            "none",
            `0 1px 2px ${hexToRgba(onSurfaceColor || "#111827", 0.05)}`, // Subtle shadow
            `0 3px 6px ${hexToRgba(onSurfaceColor || "#111827", 0.07)}`, // Card shadow
            `0 6px 12px ${hexToRgba(onSurfaceColor || "#111827", 0.1)}`, // Detail panel shadow
            `0 10px 20px ${hexToRgba(onSurfaceColor || "#111827", 0.12)}`, // Deeper shadow
          ]
        : Array(5).fill("none"), // No shadows if disabled
    }),
    [
      // List all theme-related props as dependencies
      primaryColor,
      secondaryColor,
      accentColor,
      salesColor,
      serviceColor,
      backgroundColor,
      surfaceColor,
      onSurfaceColor,
      outlineColor,
      borderRadius,
      showShadows,
    ]
  );

  // ==================== STYLE GENERATION ====================
  // Memoize style objects based on theme and layout state (isMobile)
  const styles = useMemo(() => {
    const mapOverlayBG = hexToRgba(
      theme.colors.neutral?.[900] || "#111827",
      0.4
    ); // Semi-transparent dark overlay

    // --- Desktop Styles ---
    const desktopMapContainerStyle: React.CSSProperties = {
      order: 2, // Map on the right
      flex: "1 1 auto", // Takes remaining space
      position: "relative", // For absolute positioning children (like map overlay)
      backgroundColor: theme.colors.surfaceVariant, // Placeholder BG
      overflow: "hidden", // Mapbox needs this
      minWidth: 0, // Prevent flex overflow
    };
    const desktopSidebarStyle: React.CSSProperties = {
      order: 1, // Sidebar on the left
      flex: `0 0 ${detailPanelWidth}px`, // Fixed width for sidebar
      display: "flex",
      flexDirection: "column", // Stack elements vertically
      background: theme.colors.surface,
      overflow: "hidden", // Prevent sidebar itself from scrolling
      position: "relative", // For potential absolute elements within
      borderRight: `1px solid ${theme.colors.outline}`, // Separator line
      boxShadow: theme.shadows[1], // Subtle shadow
      height: "100%", // Fill parent height
    };
    // Style for the section containing Title, Desc, SearchBar
    const desktopTopSectionContainerStyle: React.CSSProperties = {
      // order: 1, // Implicitly first in document flow, order property not needed here
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
      borderBottom: `1px solid ${theme.colors.outline}`,
      flexShrink: 0, // *** KEY: Prevents this section from shrinking ***
      backgroundColor: theme.colors.surface,
      // Apply safe area padding only to top
      paddingTop: `max(${theme.spacing(1.5)}, env(safe-area-inset-top, 0px))`,
    };
    const desktopListContainerStyle: React.CSSProperties = {
      // order: 2, // Implicitly second in document flow
      flex: "1 1 auto", // *** KEY: Allows list to grow/shrink and take available space ***
      overflowY: "auto", // Enable vertical scrolling for the list
      WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`, // Inner padding
      minHeight: 0, // Prevent flex overflow issues in some browsers
    };
    const desktopPaginationContainerStyle: React.CSSProperties = {
      // order: 3, // Implicitly third in document flow
      borderTop: `1px solid ${theme.colors.outline}`,
      flexShrink: 0, // *** KEY: Prevents pagination from shrinking ***
      // Apply safe area padding only to bottom
      paddingBottom: `env(safe-area-inset-bottom, 0px)`,
    };

    // --- Mobile Styles ---
    // Re-use desktopTopSectionContainerStyle for mobile as it includes safe area padding
    const mobileTopSectionContainerStyle = desktopTopSectionContainerStyle;

    const mobileMapContainerStyle: React.CSSProperties = {
      order: 2, // Map below top section
      flex: "1 1 auto", // Takes available space between top/bottom
      position: "relative",
      backgroundColor: theme.colors.surfaceVariant,
      overflow: "hidden",
      minHeight: "150px", // Ensure map has some minimum height
    };
    const mobileListOuterContainerStyle: React.CSSProperties = {
      order: 3, // List at the bottom
      flexShrink: 0, // Fixed height based on percentage
      height: `${mobileListHeightPercent}%`, // Use prop for height
      maxHeight: `calc(${mobileListHeightPercent}dvh)`, // Use dvh for dynamic viewport
      display: "flex",
      flexDirection: "column",
      background: theme.colors.surface,
      overflow: "hidden", // Outer container hides overflow
      borderTop: `1px solid ${theme.colors.outline}`,
      // Apply safe area padding only to bottom
      paddingBottom: `env(safe-area-inset-bottom, 0px)`,
    };
    // Style for the *inner* scrollable div within the mobile list container
    const mobileListInnerScrollStyle: React.CSSProperties = {
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
      flexGrow: 1, // Allows this inner div to grow and scroll
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
    };
    // Re-use desktopPaginationContainerStyle for mobile
    const mobilePaginationContainerStyle = desktopPaginationContainerStyle;

    // --- Shared Styles ---
    const mapOverlayStyle: React.CSSProperties = {
      position: "fixed", // Covers viewport
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: mapOverlayBG,
      backdropFilter: "blur(3px)", // Optional blur effect
      zIndex: 39, // Below detail panel (40) but above map content
      pointerEvents: mapBackgroundOverlay ? "auto" : "none", // Clickable only when active
      opacity: mapBackgroundOverlay ? 1 : 0, // Animate opacity
      transition: "opacity 0.3s ease-out",
      willChange: "opacity", // Hint for browser optimization
    };
    const titleStyle: React.CSSProperties = {
      fontSize: isMobile ? "20px" : "24px",
      fontWeight: 600,
      margin: `0 0 ${theme.spacing(0.5)} 0`, // Tight bottom margin
      color: theme.colors.onSurface,
      lineHeight: 1.2,
    };
    const descriptionStyle: React.CSSProperties = {
      fontSize: isMobile ? "13px" : "14px",
      color: theme.colors.neutral?.[600], // Slightly muted text
      margin: `0 0 ${theme.spacing(1.5)} 0`, // Space before search bar
      lineHeight: 1.5,
    };
    // Base style function for DealerCard (accepts isSelected state)
    const dealerCardStyleBase = (isSelected = false): React.CSSProperties => ({
      background: isSelected
        ? theme.colors.surfaceVariant // Highlight selected card
        : theme.colors.surface,
      padding: theme.spacing(2),
      margin: `0 0 ${theme.spacing(1.5)} 0`, // Spacing between cards
      borderRadius: theme.shape.medium,
      cursor: "pointer",
      border: `1px solid ${
        isSelected ? theme.colors.primary : theme.colors.outline
      }`, // Primary border if selected
      borderLeft: `3px solid ${
        isSelected ? theme.colors.primary : "transparent"
      }`, // Accent border on left
      boxShadow: theme.shadows[isSelected ? 2 : 1], // Slightly raise selected card
      transition:
        "background-color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s",
      position: "relative", // For potential pseudo-elements or overlays
    });

    return {
      // Group styles for easier consumption
      desktopMapContainerStyle,
      desktopSidebarStyle,
      desktopTopSectionContainerStyle, // Used by desktop sidebar
      desktopListContainerStyle, // Used by desktop sidebar
      desktopPaginationContainerStyle, // Used by desktop sidebar
      mobileTopSectionContainerStyle, // Used by mobile layout
      mobileMapContainerStyle, // Used by mobile layout
      mobileListOuterContainerStyle, // Used by mobile layout
      mobileListInnerScrollStyle, // Used by mobile layout (inner scroll)
      mobilePaginationContainerStyle, // Used by mobile layout
      mapOverlayStyle,
      titleStyle,
      descriptionStyle,
      dealerCardStyleBase,
      detailPanelWidth, // Pass width prop for detail panel
      theme, // Pass theme object itself
    };
  }, [
    // Dependencies for style generation
    theme,
    isMobile,
    style, // User-provided style overrides
    detailPanelWidth,
    mapBackgroundOverlay, // For map overlay style
    mobileListHeightPercent,
  ]);

  // ==================== EVENT HANDLERS ====================
  // Memoize handlers to prevent unnecessary re-renders of child components

  // Geocode search query using Mapbox API
  const handleGeocodeSearch = useCallback(
    async (query: string) => {
      if (
        !query || // No query
        actualMapProvider !== "mapbox" || // Only works with Mapbox
        !mapboxAccessToken || // Need token
        RenderTarget.current() === RenderTarget.canvas // Skip on canvas
      ) {
        setSearchLocation(null); // Clear previous search location
        setGeocodeResult(null);
        return;
      }

      console.log(`Geocoding search: "${query}"`);
      setComponentError(null); // Clear previous errors

      try {
        // Construct Mapbox Geocoding API URL
        const proximity = userLocation // Bias results towards user location if available
          ? `&proximity=${userLocation.lng},${userLocation.lat}`
          : "";
        const country = "&country=in"; // Restrict search to India
        const bbox = "&bbox=68.1,6.5,97.4,35.5"; // Bounding box for India
        const types = // Specify desired result types
          "&types=region,district,place,locality,neighborhood,address,postcode,poi";
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxAccessToken}&limit=1${country}${proximity}${bbox}${types}&language=en`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            `Mapbox Geocoding failed: ${data.message || response.statusText}`
          );
        }

        if (data.features?.length > 0) {
          const feature = data.features[0];
          console.log("Geocode successful:", feature);

          // Basic check if the result seems within India (can be improved)
          const isInIndia =
            feature.context?.some(
              (ctx) => ctx.id.startsWith("country.") && ctx.short_code === "in"
            ) || feature.place_name.toLowerCase().includes("india");

          // Allow country/state results, but reject others outside India
          if (
            !isInIndia &&
            !feature.id.startsWith("country.") &&
            !feature.id.startsWith("region.")
          ) {
            console.warn("Geocoded location outside India:", feature);
            setComponentError("Location found is outside the expected region.");
            setSearchLocation(null);
            setGeocodeResult(null);
            return;
          }

          // Extract coordinates and update state
          const [lng, lat] = feature.center;
          const newSearchLocation = { lat, lng };
          setSearchLocation(newSearchLocation); // Update the location state
          setGeocodeResult(feature); // Store feature data to determine zoom later
        } else {
          console.log("Geocode: No results found.");
          setComponentError("Could not find the specified location.");
          setSearchLocation(null); // Clear location if no results
          setGeocodeResult(null);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Geocoding request failed";
        console.error("Geocoding error:", err);
        setComponentError(errorMsg);
        setSearchLocation(null); // Clear location on error
        setGeocodeResult(null);
      }
    },
    [actualMapProvider, mapboxAccessToken, userLocation] // Dependencies
  );

  // Update search query state (controlled input)
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Trigger geocode when search submitted (Enter key or button click)
  const handleSearchSubmit = useCallback(
    (query: string) => {
      handleGeocodeSearch(query);
    },
    [handleGeocodeSearch] // Depends on the geocoding function
  );

  // Clear search input, results, and reset map view
  const handleClearSearch = useCallback(() => {
    console.log("Handler: Clearing search and queueing map reset");
    setSearchQuery("");
    setSearchLocation(null);
    setGeocodeResult(null);
    setComponentError(null); // Clear any search-related errors
    userLocationRequestedRef.current = false; // Reset this flag too

    // Determine where to reset the map view
    const resetCenter = userLocation // Prefer user location if available
      ? userLocation
      : { lng: initialMapCenter[0], lat: initialMapCenter[1] }; // Fallback to initial default
    const resetZoom = userLocation ? 12 : initialZoom; // Zoom appropriately

    // Queue the map update to reset the view
    mapNeedsUpdateRef.current = {
      center: resetCenter,
      zoom: resetZoom,
      type: userLocation ? "fly" : "jump", // Fly if user location known, jump otherwise
    };

    // Scroll list back to top
    listContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [userLocation, initialMapCenter, initialZoom]); // Dependencies for reset logic

  // Handle "Use My Location" button click
  const handleUseLocation = useCallback(() => {
    console.log("Handler: User clicked 'Use My Location'");
    // Clear any previous search state/errors
    setComponentError(null);
    setSearchQuery(""); // Clear search input
    setSearchLocation(null);
    setGeocodeResult(null);

    // Set flag to indicate user explicitly requested location
    // This helps the effect differentiate between initial load and explicit request
    userLocationRequestedRef.current = true;

    // If location already exists, trigger map update immediately
    if (userLocation) {
      console.log("Handler: User location already exists, queueing map update");
      mapNeedsUpdateRef.current = {
        center: userLocation,
        zoom: 12,
        type: "fly",
      };
    }

    // Always request fresh location data (or permission)
    getUserLocation();
  }, [getUserLocation, userLocation]); // Dependencies

  // Handle selecting a dealer from the list or map marker
  const handleDealerSelect = useCallback(
    (dealer: Dealer) => {
      if (!dealer || !isValidCoordinates(dealer.coordinates)) {
        console.error("Attempted to select invalid dealer:", dealer);
        return;
      }
      console.log("Handler: Selecting dealer -", dealer.name);

      // IMPORTANT: Set the selected dealer *first* so the effect can react
      setSelectedDealer(dealer);
      setIsDetailOpen(true); // Open the panel
      setMapBackgroundOverlay(true); // Show background overlay

      // Queue map update in the EFFECT that depends on selectedDealer & isDetailOpen
      // This ensures the update happens after state is set.
      // (Removed direct mapNeedsUpdateRef setting here, relying on the useEffect)

      // Scroll the selected card into view (on next frame for smoother effect)
      requestAnimationFrame(() => {
        const cardElement = listContainerRef.current?.querySelector(
          `[data-dealer-id="${dealer.id}"]`
        );
        cardElement?.scrollIntoView({
          behavior: "smooth",
          block: "nearest", // Tries to keep the whole card visible
        });
      });
    },
    [] // No direct dependencies, reads state internally
  );

  // Handle closing the detail panel
  const handleDetailClose = useCallback(() => {
    console.log("Handler: Closing detail panel (NO map view reset)");
    setIsDetailOpen(false);
    setMapBackgroundOverlay(false);
    // Don't nullify selectedDealer immediately if panel animation needs it,
    // but it's safe to do so here for map state as the map shouldn't reset.
    setSelectedDealer(null);
    // *** CRITICAL: Do NOT queue a map reset here ***
  }, []); // No dependencies

  // Handle clicking directly on the map background (not markers)
  const handleMapClick = useCallback(() => {
    // If the detail panel is open, close it on map click
    if (isDetailOpen) {
      console.log("Handler: Map click detected, closing detail panel");
      handleDetailClose();
    }
  }, [isDetailOpen, handleDetailClose]); // Depends on panel state and close handler

  // Callback triggered by MapWrapper when its markers are initially rendered
  const handleMarkersReady = useCallback(() => {
    // Check if component is still mounted and markers weren't already marked as ready
    if (isMountedRef.current && !areMarkersReady) {
      console.log("Handler: MapWrapper signals markers ready");
      setAreMarkersReady(true); // Update state, which helps hide initial loader
    }
  }, [areMarkersReady]); // Depends on areMarkersReady state

  // Handle page changes for pagination controls
  const handlePageChange = useCallback(
    (page: number) => {
      // Only applicable if not using infinite scroll
      if (!useInfiniteScroll) {
        setCurrentPage(page);
        // Scroll list to top when changing pages
        listContainerRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    },
    [useInfiniteScroll] // Depends on scroll mode
  );

  // ==================== RENDER ====================
  return (
    <div className="dealer-locator-container" style={style}>
      {/* Initial Full Screen Loading Overlay */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            key="initial-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000, // Highest z-index
              pointerEvents: "none", // Don't block interaction initially
            }}
          >
            <LoadingIndicator
              text={loadingText}
              showText={true}
              color={theme.colors.primary}
              size="large"
              fullScreen={true}
              backgroundColor={theme.colors.background || "#FFFFFF"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper (Hidden during initial load) */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
          height: "100%",
          // Hide content visually until initial load is complete
          visibility: isInitialLoading ? "hidden" : "visible",
          // Apply user-defined styles if needed, though container handles main layout
          ...(style ?? {}), // Spread user styles if provided
        }}
      >
        {isMobile ? ( // ---- MOBILE LAYOUT ----
          <>
            {/* Mobile: Top Section (Title, Desc, Search) */}
            <div style={styles.mobileTopSectionContainerStyle}>
              {title && <h1 style={styles.titleStyle}>{title}</h1>}
              {description && (
                <p style={styles.descriptionStyle}>{description}</p>
              )}
              {showSearchBar && (
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onSearchSubmit={handleSearchSubmit}
                  onClearSearch={handleClearSearch}
                  allowLocationAccess={allowLocationAccess}
                  onUseLocation={handleUseLocation}
                  isLocating={isGeoLocating}
                  locationError={geoError}
                  userLocation={userLocation}
                  searchPlaceholder={searchPlaceholder}
                  useMyLocationText={"Use My Location"}
                  theme={theme}
                />
              )}
            </div>

            {/* Mobile: Map Area */}
            <div style={styles.mobileMapContainerStyle}>
              {showMapPlaceholder ? (
                <MapPlaceholder
                  message={apiKeyMissing ? "Map Unavailable" : "Map Preview"}
                  subtext={
                    apiKeyMissing
                      ? `API key/token required.`
                      : "Live map requires preview mode."
                  }
                  theme={theme}
                />
              ) : (
                <MapWrapper
                  key="map-mobile" // Key helps React differentiate
                  mapProvider={actualMapProvider as any}
                  mapboxAccessToken={mapboxAccessToken}
                  googleApiKey={googleApiKey}
                  initialCenter={initialMapCenter}
                  initialZoom={initialZoom}
                  dealers={validDealers} // Pass only dealers with valid coords
                  selectedDealer={selectedDealer}
                  userLocation={userLocation}
                  mapUpdateTrigger={mapNeedsUpdateRef} // Pass the ref
                  onMarkerClick={handleDealerSelect}
                  onMapClick={handleMapClick}
                  onMarkersReady={handleMarkersReady}
                  theme={theme}
                  distanceUnit={distanceUnit}
                  mapboxMapStyleUrl={mapboxMapStyleUrl}
                  style={{ width: "100%", height: "100%" }} // Ensure map fills container
                />
              )}
            </div>

            {/* Mobile: List Area (Bottom) */}
            <div style={styles.mobileListOuterContainerStyle}>
              {/* This inner div handles the scrolling */}
              <div
                ref={listContainerRef}
                className="mobile-dealer-list-scroll"
                style={styles.mobileListInnerScrollStyle}
                role="region"
                aria-label="Dealer List"
              >
                {displayedDealers.length === 0 && !isBusy ? (
                  <div
                    style={{
                      padding: theme.spacing(4),
                      textAlign: "center",
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    {noResultsText}
                  </div>
                ) : (
                  <>
                    {/* Render dealer cards */}
                    {displayedDealers.map((dealer) => (
                      <DealerCard
                        key={dealer.id}
                        dealer={dealer}
                        isSelected={selectedDealer?.id === dealer.id}
                        onSelect={handleDealerSelect}
                        distanceUnit={distanceUnit}
                        theme={theme}
                        styles={{
                          dealerCardStyleBase: styles.dealerCardStyleBase,
                        }}
                      />
                    ))}
                    {/* Show loading indicator at bottom for infinite scroll */}
                    {useInfiniteScroll && isLoadingMore && (
                      <div
                        style={{
                          padding: theme.spacing(2),
                          textAlign: "center",
                        }}
                      >
                        <LoadingIndicator
                          showText={false}
                          color={theme.colors.primary}
                          size="small"
                          fullScreen={false} // Inline indicator
                          style={{ height: "40px" }} // Give it some space
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Pagination controls (only show if not infinite scroll and > 1 page) */}
              {!useInfiniteScroll && totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  theme={theme}
                  styles={{
                    // Apply specific styles for mobile pagination container
                    paginationContainerStyle:
                      styles.mobilePaginationContainerStyle,
                  }}
                />
              )}
            </div>
          </>
        ) : (
          // ---- DESKTOP LAYOUT ----
          <>
            {/* Desktop: Sidebar (Left) */}
            {/* This div uses flexbox (column) to arrange its children */}
            <div style={styles.desktopSidebarStyle}>
              {/* === Top Section (Title, Desc, SearchBar) === */}
              {/* This div is styled with `flex-shrink: 0` to stay at the top */}
              <div style={styles.desktopTopSectionContainerStyle}>
                {title && <h1 style={styles.titleStyle}>{title}</h1>}
                {description && (
                  <p style={styles.descriptionStyle}>{description}</p>
                )}
                {showSearchBar && (
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearchSubmit}
                    onClearSearch={handleClearSearch}
                    allowLocationAccess={allowLocationAccess}
                    onUseLocation={handleUseLocation}
                    isLocating={isGeoLocating}
                    locationError={geoError}
                    userLocation={userLocation}
                    searchPlaceholder={searchPlaceholder}
                    useMyLocationText={"Use My Location"}
                    theme={theme}
                  />
                )}
              </div>{" "}
              {/* End Top Section */}
              {/* === List Container (Scrollable Dealer Cards) === */}
              {/* This div is styled with `flex: 1 1 auto` and `overflow-y: auto` */}
              {/* It takes the remaining space and scrolls */}
              <div
                ref={listContainerRef}
                style={styles.desktopListContainerStyle}
                role="region"
                aria-label="Dealer List"
              >
                {displayedDealers.length === 0 && !isBusy ? (
                  <div
                    style={{
                      padding: theme.spacing(4),
                      textAlign: "center",
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    {noResultsText}
                  </div>
                ) : (
                  <>
                    {displayedDealers.map((dealer) => (
                      <DealerCard
                        key={dealer.id}
                        dealer={dealer}
                        isSelected={selectedDealer?.id === dealer.id}
                        onSelect={handleDealerSelect}
                        distanceUnit={distanceUnit}
                        theme={theme}
                        styles={{
                          dealerCardStyleBase: styles.dealerCardStyleBase,
                        }}
                      />
                    ))}
                    {useInfiniteScroll && isLoadingMore && (
                      <div
                        style={{
                          padding: theme.spacing(2),
                          textAlign: "center",
                        }}
                      >
                        <LoadingIndicator
                          showText={false}
                          color={theme.colors.primary}
                          size="small"
                          fullScreen={false}
                          style={{ height: "40px" }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>{" "}
              {/* End List Container */}
              {/* === Pagination (Fixed at bottom if used) === */}
              {/* This component is styled with `flex-shrink: 0` */}
              {!useInfiniteScroll && totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  theme={theme}
                  styles={{
                    // Apply specific styles for desktop pagination container
                    paginationContainerStyle:
                      styles.desktopPaginationContainerStyle,
                  }}
                />
              )}{" "}
              {/* End Pagination */}
            </div>{" "}
            {/* End Desktop Sidebar */}
            {/* Desktop: Map Area (Right) */}
            <div style={styles.desktopMapContainerStyle}>
              {showMapPlaceholder ? (
                <MapPlaceholder
                  message={apiKeyMissing ? "Map Unavailable" : "Map Preview"}
                  subtext={
                    apiKeyMissing
                      ? `API key/token required.`
                      : "Live map requires preview mode."
                  }
                  theme={theme}
                />
              ) : (
                <MapWrapper
                  key="map-desktop"
                  mapProvider={actualMapProvider as any}
                  mapboxAccessToken={mapboxAccessToken}
                  googleApiKey={googleApiKey}
                  initialCenter={initialMapCenter}
                  initialZoom={initialZoom}
                  dealers={validDealers} // Pass only valid dealers
                  selectedDealer={selectedDealer}
                  userLocation={userLocation}
                  mapUpdateTrigger={mapNeedsUpdateRef} // Pass ref
                  onMarkerClick={handleDealerSelect}
                  onMapClick={handleMapClick}
                  onMarkersReady={handleMarkersReady}
                  theme={theme}
                  distanceUnit={distanceUnit}
                  mapboxMapStyleUrl={mapboxMapStyleUrl}
                  style={{ width: "100%", height: "100%" }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Global Error Display Overlay */}
      {componentError && !isInitialLoading && (
        <div
          style={{
            position: "absolute", // Position relative to the main container
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1500, // Above map but below detail panel potentially
            pointerEvents: "none", // Overlay doesn't block clicks unless error component does
          }}
        >
          <ErrorDisplay
            message={componentError}
            // Only show retry if it was a dealer fetch error
            onRetry={dealersError ? refetchDealers : undefined}
            theme={theme}
            styles={{
              // Make the error display itself clickable if retry exists
              errorOverlayStyle: { pointerEvents: "auto" },
            }}
          />
        </div>
      )}

      {/* Background overlay for Detail Panel (Covers map/list) */}
      <div
        style={styles.mapOverlayStyle}
        onClick={handleDetailClose} // Close panel if overlay clicked
        aria-hidden={!mapBackgroundOverlay} // Accessibility
      />

      {/* Dealer Detail Panel (Slides in) */}
      <DealerDetailPanel
        dealer={selectedDealer}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        distanceUnit={distanceUnit}
        isMobile={isMobile}
        theme={theme}
        styles={{ detailPanelWidth: styles.detailPanelWidth }} // Pass width for desktop
        contactLabel={contactLabel}
        hoursLabel={hoursLabel}
        servicesLabel={servicesLabel}
        getDirectionsText={getDirectionsText}
        mapProvider={actualMapProvider} // Pass the determined map provider
      />
    </div>
  );
}

// ==================== PROPERTY CONTROLS ====================
// (Keep Property Controls as they were - no changes needed here)
addPropertyControls(DealerLocator, {
  _mapGroup: { type: ControlType.Group, title: "Map Setup", expanded: true },
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
    placeholder: "pk.eyJ...",
    hidden: (props) => props.mapProvider !== "mapbox",
    group: "_mapGroup",
    defaultValue:
      "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA",
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
  initialZoom: {
    title: "Initial Zoom",
    type: ControlType.Number,
    defaultValue: DEFAULT_ZOOM,
    min: 1,
    max: 18,
    step: 1,
    displayStepper: true,
    group: "_mapGroup",
  }, // Prop name is initialZoomProp internally
  distanceUnit: {
    title: "Distance Unit",
    type: ControlType.Enum,
    defaultValue: "km",
    options: ["km", "miles"],
    optionTitles: ["KM", "Miles"],
    displaySegmentedControl: true,
    group: "_mapGroup",
  },
  _dataGroup: { type: ControlType.Group, title: "Data & List" },
  apiEndpoint: {
    title: "Dealer API Endpoint",
    type: ControlType.String,
    description:
      "URL for JSON data (expects {status: 'success', dealers: [...]}). Uses sample if empty.",
    defaultValue: "https://booking-engine.sagarsiwach.workers.dev/dealer",
    group: "_dataGroup",
  },
  useInfiniteScroll: {
    title: "List Loading",
    type: ControlType.Enum,
    options: ["infinite", "pagination"],
    optionTitles: ["Infinite Scroll", "Pagination"],
    defaultValue: "infinite", // Changed default to infinite
    displaySegmentedControl: true,
    description: "How list items load.",
    group: "_dataGroup",
  },
  resultsPerPage: {
    title: "Items Per Load",
    type: ControlType.Number,
    defaultValue: 10, // Adjusted default
    min: 1,
    max: 50,
    step: 1,
    displayStepper: true,
    description: "Items per page (Pagination) or per scroll load (Infinite).",
    group: "_dataGroup",
  },
  mobileListHeightPercent: {
    title: "List Height (Mobile %)",
    type: ControlType.Number,
    defaultValue: 45,
    min: 20,
    max: 80,
    step: 5,
    displayStepper: true,
    description: "Percentage of component height for the list on mobile.",
    group: "_dataGroup",
  },
  _featuresGroup: { type: ControlType.Group, title: "Features & Text" },
  title: {
    title: "Title",
    type: ControlType.String,
    defaultValue: "Locate a Dealer",
    group: "_featuresGroup",
  },
  description: {
    title: "Description",
    type: ControlType.String,
    defaultValue: "Discover our network of partners.",
    group: "_featuresGroup",
  },
  showSearchBar: {
    title: "Show Search Bar",
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
  searchPlaceholder: {
    title: "Search Placeholder",
    type: ControlType.String,
    defaultValue: "Area / Pincode",
    group: "_featuresGroup",
  },
  noResultsText: {
    title: "No Results Text",
    type: ControlType.String,
    defaultValue: "No locations found matching your criteria.",
    group: "_featuresGroup",
  },
  loadingText: {
    title: "Loading Text",
    type: ControlType.String,
    defaultValue: "Loading...",
    group: "_featuresGroup",
  },
  getDirectionsText: {
    title: "'Directions' Button",
    type: ControlType.String,
    defaultValue: "Navigate",
    group: "_featuresGroup",
  },
  contactLabel: {
    title: "Contact Label",
    type: ControlType.String,
    defaultValue: "Contact",
    group: "_featuresGroup",
  },
  hoursLabel: {
    title: "Hours Label",
    type: ControlType.String,
    defaultValue: "Opening Hours",
    group: "_featuresGroup",
  },
  servicesLabel: {
    title: "Services Label",
    type: ControlType.String,
    defaultValue: "Services Available",
    group: "_featuresGroup",
  },
  _appearanceGroup: { type: ControlType.Group, title: "Appearance" },
  primaryColor: {
    title: "Primary",
    type: ControlType.Color,
    defaultValue: "#111827",
    group: "_appearanceGroup",
  },
  secondaryColor: {
    title: "Secondary (Text)",
    type: ControlType.Color,
    defaultValue: "#6B7280",
    group: "_appearanceGroup",
  },
  salesColor: {
    title: "Sales Color",
    type: ControlType.Color,
    defaultValue: "#0284C7",
    group: "_appearanceGroup",
  },
  serviceColor: {
    title: "Service Color",
    type: ControlType.Color,
    defaultValue: "#DC2626",
    group: "_appearanceGroup",
  },
  accentColor: {
    title: "Charging/Accent",
    type: ControlType.Color,
    defaultValue: "#22C55E",
    group: "_appearanceGroup",
  },
  backgroundColor: {
    title: "Page Background",
    type: ControlType.Color,
    defaultValue: "#FFFFFF",
    group: "_appearanceGroup",
  },
  surfaceColor: {
    title: "Card/Panel Surface",
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
    title: "Outline/Borders",
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
    defaultValue: true,
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
  navbarHeight: {
    title: "External Navbar Height",
    type: ControlType.Number,
    defaultValue: 81,
    min: 0,
    max: 200,
    step: 1,
    displayStepper: true,
    description: "For correct component height calculation.",
    group: "_appearanceGroup",
  },
});
