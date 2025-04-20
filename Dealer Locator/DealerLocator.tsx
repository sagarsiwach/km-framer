// DealerLocator.tsx - A fully functional dealer/store locator component for Framer
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";

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
  hexToRgba,
  Icon,
  formatAddress,
} from "https://framer.com/m/Lib-8AS5.js@vS7d5YP2fjGyqMnH5L1D";

import {
  useDealerData,
  useGeolocation,
  useMapApiState,
} from "https://framer.com/m/Hooks-ZmUS.js@2ecUl320qKIztH19IQLd";

import MapWrapper from "https://framer.com/m/MapWrapper-dYOf.js";

import {
  DealerCard,
  DealerDetailPanel,
  ErrorDisplay,
  LoadingOverlay,
  MapPlaceholder,
  PaginationControls,
  SearchBar,
} from "https://framer.com/m/Components-bS3j.js@0jRsmeo87YGyazwSo9oO";

import LoadingIndicator from "https://framer.com/m/LoadingOverlay-8m7G.js";

// --- Inline useDebounce Hook ---
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function DealerLocator(props) {
  // ==================== PROPS ====================
  const {
    // Map Configuration
    mapProvider = "mapbox",
    mapboxAccessToken = "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA",
    mapboxMapStyleUrl = "mapbox://styles/mapbox/light-v11",
    googleApiKey = "",
    googleMapStyleId = "monochrome_minimal",
    apiEndpoint = "https://booking-engine.sagarsiwach.workers.dev/dealer",
    initialZoom = 5, // Lower zoom to show more of India
    distanceUnit = "km",

    // Content Configuration
    resultsPerPage = 7,
    useInfiniteScroll = true,
    showSearchBar = true,
    allowLocationAccess = true,

    // Theme Configuration
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
    showShadows = false,

    // Text Labels
    searchPlaceholder = "Area / Pincode",
    noResultsText = "No locations found.",
    loadingText = "Loading...",
    getDirectionsText = "Navigate",
    servicesLabel = "Services Available",
    hoursLabel = "Opening Hours",
    contactLabel = "Contact",
    title = "Locate a Dealer",
    description = "Discover our network of partners.",

    // Layout Configuration
    style,
    detailPanelWidth = 400,
    maxSearchRadius = 150,
    showNearestDealers = 7,
    navbarHeight = 81, // Height of the navbar for proper sizing
  } = props;

  // ==================== STATE ====================
  // UI States
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mapBackgroundOverlay, setMapBackgroundOverlay] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [componentError, setComponentError] = useState(null);
  const [spinnerRotation, setSpinnerRotation] = useState(0);

  // Data States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [searchLocation, setSearchLocation] = useState(null);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [searchMode, setSearchMode] = useState("none");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Map States
  const [activeMapCenter, setActiveMapCenter] = useState([78.9629, 20.5937]); // Center of India
  const [activeMapZoom, setActiveMapZoom] = useState(initialZoom);
  const [markersRendered, setMarkersRendered] = useState(false);

  // ==================== REFS ====================
  const geocoderRef = useRef(null);
  const listContainerRef = useRef(null);
  const markersProcessedRef = useRef(false);
  const userLocationRequestedRef = useRef(false);
  const mapCenteringTimeoutRef = useRef(null);
  const dealerSelectTimeoutRef = useRef(null);

  // ==================== HOOKS ====================
  // Data fetching hook
  const {
    dealers: allDealers,
    isLoading: isDealersLoading,
    error: dealersError,
    refetch: refetchDealers,
  } = useDealerData(apiEndpoint, SAMPLE_DEALERS);

  // Geolocation hook
  const {
    userLocation,
    isLocating: isGeoLocating,
    locationError: geoError,
    getUserLocation,
  } = useGeolocation();

  // Map API state hook
  const { isLoaded: isMapApiLoaded, loadError: mapApiLoadError } =
    useMapApiState(mapProvider, googleApiKey);

  // ==================== COMPUTED VALUES ====================
  // Combined loading state
  const isLocatingCombined = useMemo(
    () => isDealersLoading || isGeoLocating || !markersRendered,
    [isDealersLoading, isGeoLocating, markersRendered]
  );

  // Responsive check
  const isMobile = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) return false;
    return typeof window !== "undefined" && window.innerWidth < 768;
  }, []);

  // Pagination calculation
  const displayedDealers = useMemo(() => {
    if (!filteredDealers || filteredDealers.length === 0) return [];

    if (useInfiniteScroll) {
      return filteredDealers.slice(0, currentPage * resultsPerPage);
    } else {
      return filteredDealers.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
      );
    }
  }, [filteredDealers, currentPage, resultsPerPage, useInfiniteScroll]);

  const totalPages = useMemo(() => {
    if (!filteredDealers || filteredDealers.length === 0) return 0;
    return Math.ceil(filteredDealers.length / resultsPerPage);
  }, [filteredDealers, resultsPerPage]);

  // ==================== EFFECTS ====================
  // Initialize Geocoder
  useEffect(() => {
    if (mapProvider === "mapbox" && mapboxAccessToken) {
      geocoderRef.current = "mapbox";
      console.log("Mapbox geocoder ready (using fetch).");
    } else if (
      mapProvider === "google" &&
      isMapApiLoaded &&
      window.google?.maps?.Geocoder
    ) {
      geocoderRef.current = new window.google.maps.Geocoder();
      console.log("Google Maps Geocoder initialized.");
    } else {
      geocoderRef.current = null;
      console.log("Geocoder not available or provider/API not ready.");
    }
  }, [mapProvider, isMapApiLoaded, mapboxAccessToken, googleApiKey]);

  // Update combined error state (excluding geoError for main display)
  useEffect(() => {
    const errorMsg = dealersError || mapApiLoadError?.message || null;
    if (errorMsg !== componentError) {
      setComponentError(errorMsg);
      if (errorMsg) console.error("Component Error Set:", errorMsg);
    }
  }, [dealersError, mapApiLoadError, componentError]); // Removed geoError dependency

  // Spinner animation
  useEffect(() => {
    let frameId = null;
    if (isLocatingCombined) {
      const animate = () => {
        setSpinnerRotation((r) => (r + 6) % 360);
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    } else {
      setSpinnerRotation(0);
    }
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isLocatingCombined]);

  // Reset map state on provider change
  useEffect(() => {
    console.log(`Map provider changed to: ${mapProvider}`);
    setActiveMapCenter([78.9629, 20.5937]); // Center of India
    setActiveMapZoom(4.5); // Lower zoom to show all of India
    setSearchLocation(null);
    setSelectedDealer(null);
    setIsDetailOpen(false);
    setMapBackgroundOverlay(false);
    setComponentError(null);
    setMarkersRendered(false);
    markersProcessedRef.current = false;
    userLocationRequestedRef.current = false;

    // Clear any pending timeouts
    if (mapCenteringTimeoutRef.current) {
      clearTimeout(mapCenteringTimeoutRef.current);
      mapCenteringTimeoutRef.current = null;
    }

    if (dealerSelectTimeoutRef.current) {
      clearTimeout(dealerSelectTimeoutRef.current);
      dealerSelectTimeoutRef.current = null;
    }
  }, [mapProvider, initialZoom]);

  // Request location on mount
  useEffect(() => {
    // Request user location on component mount - only once
    if (allowLocationAccess && !userLocationRequestedRef.current) {
      console.log("Automatically requesting user location on mount");
      userLocationRequestedRef.current = true;
      getUserLocation();
    }
  }, [allowLocationAccess, getUserLocation]);

  // Markers ready notification
  useEffect(() => {
    if (
      !isDealersLoading &&
      allDealers.length > 0 &&
      !markersProcessedRef.current
    ) {
      const timer = setTimeout(() => {
        console.log("Setting markers as rendered");
        setMarkersRendered(true);
        markersProcessedRef.current = true;
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isDealersLoading, allDealers]);

  // User location handling
  useEffect(() => {
    if (userLocation) {
      console.log("User location updated:", userLocation);

      // Center map if location was specifically requested by user
      if (userLocationRequestedRef.current) {
        console.log("Centering map on user location");

        // Clear any existing timeout
        if (mapCenteringTimeoutRef.current) {
          clearTimeout(mapCenteringTimeoutRef.current);
        }

        // Use timeout to ensure map has time to initialize properly
        mapCenteringTimeoutRef.current = setTimeout(() => {
          setActiveMapCenter([userLocation.lng, userLocation.lat]);
          setActiveMapZoom(12); // Zoom level for user location - showing neighborhood
          mapCenteringTimeoutRef.current = null;
        }, 200);
      }
    }
  }, [userLocation]);

  // Fallback for markers ready
  useEffect(() => {
    // Force markers to be rendered after a timeout even if callback wasn't received
    const timer = setTimeout(() => {
      if (!markersRendered && !markersProcessedRef.current) {
        console.log("Force setting markers as rendered after timeout");
        setMarkersRendered(true);
        markersProcessedRef.current = true;
      }
    }, 3000); // Fallback timeout

    return () => clearTimeout(timer);
  }, [markersRendered]);

  // Process and sort dealers with filtering of invalid coordinates
  useEffect(() => {
    if (RenderTarget.current() === RenderTarget.canvas) {
      setFilteredDealers(SAMPLE_DEALERS.slice(0, 5));
      setMarkersRendered(true);
      return;
    }

    if (isDealersLoading) return;

    console.log("Processing and sorting dealers...");
    const locationForDistance = searchLocation || userLocation || null;

    // Filter out dealers with missing or invalid coordinates FIRST
    const validDealers = allDealers.filter((dealer) => {
      const isValid =
        dealer.coordinates &&
        typeof dealer.coordinates.lat === "number" &&
        typeof dealer.coordinates.lng === "number" &&
        !isNaN(dealer.coordinates.lat) &&
        !isNaN(dealer.coordinates.lng);
      if (!isValid) {
        console.warn(
          `Filtering out dealer with invalid coordinates: ${
            dealer.name || dealer.id
          }`,
          dealer.coordinates
        );
      }
      return isValid;
    });

    // Add distance to valid dealers
    let enhancedDealers = validDealers.map((dealer) => ({
        ...dealer,
        distance: locationForDistance
          ? calculateDistance(
              locationForDistance,
              dealer.coordinates,
              distanceUnit
            )
          : undefined,
      }));

    // Sort dealers: featured first, then by distance or alphabetically
    enhancedDealers.sort((a, b) => {
      // Featured dealers come first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Then sort by distance if available
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;

      // Finally sort alphabetically
      return a.name.localeCompare(b.name);
    });

    // Apply text search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      if (query) {
        console.log(`Filtering by text: "${query}"`);
        enhancedDealers = enhancedDealers.filter(
          (d) =>
            d.name?.toLowerCase().includes(query) ||
            d.address?.formatted?.toLowerCase().includes(query) ||
            d.address?.city?.toLowerCase().includes(query) ||
            d.address?.pincode?.toLowerCase().includes(query) ||
            d.services?.some((s) => s.toLowerCase().includes(query))
        );
      }
      setSearchMode(searchLocation || userLocation ? "location" : "text");
    } else {
      setSearchMode("none");
    }

    // Set filtered dealers for the list
    setFilteredDealers(enhancedDealers);

    // Reset to page 1 when filter changes
    if (currentPage !== 1) {
      setCurrentPage(1);
      if (listContainerRef.current) {
        listContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [
    allDealers,
    debouncedSearchQuery,
    userLocation,
    searchLocation,
    distanceUnit,
    isDealersLoading,
    currentPage,
  ]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!useInfiniteScroll || isLoadingMore || currentPage >= totalPages)
      return;

    const listEl = listContainerRef.current;
    if (listEl) {
      const { scrollTop, scrollHeight, clientHeight } = listEl;
      if (scrollHeight - scrollTop - clientHeight < 300) {
        console.log("Near bottom, loading next page...");
        setIsLoadingMore(true);
        setTimeout(() => {
          setCurrentPage((prev) => prev + 1);
          setIsLoadingMore(false);
        }, 300);
      }
    }
  }, [useInfiniteScroll, isLoadingMore, currentPage, totalPages]);

  // Attach/detach scroll listener
  useEffect(() => {
    const list = listContainerRef.current;
    if (list && useInfiniteScroll) {
      list.addEventListener("scroll", handleScroll);
      console.log("Infinite scroll listener attached.");
    }

    return () => {
      if (list && useInfiniteScroll) {
        list.removeEventListener("scroll", handleScroll);
      }
    };
  }, [useInfiniteScroll, handleScroll]);

  // ==================== THEME GENERATION ====================
  const theme = useMemo(
    () => ({
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        sales: salesColor,
        service: serviceColor,
        skyBlue: salesColor,
        redColor: serviceColor,
        greenColor: accentColor,
        onPrimary: surfaceColor,
        background: backgroundColor,
        surface: surfaceColor,
        onSurface: onSurfaceColor,
        surfaceVariant: hexToRgba(onSurfaceColor, 0.05),
        onSurfaceVariant: secondaryColor,
        outline: outlineColor,
        outlineVariant: hexToRgba(outlineColor, 0.7),
        error: "#DC2626",
        onError: "#FFFFFF",
        success: accentColor,
        neutral: {
          50: hexToRgba(onSurfaceColor, 0.03),
          100: hexToRgba(onSurfaceColor, 0.06),
          200: hexToRgba(onSurfaceColor, 0.1),
          300: hexToRgba(onSurfaceColor, 0.2),
          400: hexToRgba(onSurfaceColor, 0.35),
          500: hexToRgba(onSurfaceColor, 0.5),
          600: hexToRgba(onSurfaceColor, 0.65),
          700: hexToRgba(onSurfaceColor, 0.8),
          800: hexToRgba(onSurfaceColor, 0.9),
          900: onSurfaceColor,
          950: "#0D1117",
        },
        white: "#FFFFFF",
      },
      typography: {
        fontFamily:
          "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
      },
      shape: {
        small: `${Math.max(2, Math.round(borderRadius * 0.5))}px`,
        medium: `${borderRadius}px`,
        large: `${Math.max(4, Math.round(borderRadius * 1.5))}px`,
        full: "9999px",
      },
      spacing: (multiplier = 1) => `${8 * multiplier}px`,
      shadows: showShadows
        ? [
            "none",
            `0 1px 2px ${hexToRgba(onSurfaceColor, 0.05)}`,
            `0 3px 6px ${hexToRgba(onSurfaceColor, 0.07)}`,
            `0 6px 12px ${hexToRgba(onSurfaceColor, 0.1)}`,
            `0 10px 20px ${hexToRgba(onSurfaceColor, 0.12)}`,
          ]
        : Array(5).fill("none"),
    }),
    [
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
  const styles = useMemo(() => {
    // Calculate height respecting navbar
    const totalHeight = `calc(100dvh - ${navbarHeight}px)`;

    const containerStyle = {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      width: "100%",
      height: totalHeight,
      maxHeight: totalHeight,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
      position: "relative",
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.onSurface,
      ...style,
    };

    const mapContainerStyle = {
      flex: 1,
      minHeight: isMobile ? "40vh" : "auto",
      height: isMobile ? "40%" : "100%",
      position: "relative",
      backgroundColor: theme.colors.surfaceVariant,
      order: isMobile ? 1 : 2,
    };

    const sidebarStyle = {
      flex: isMobile ? "1" : `0 0 ${detailPanelWidth}px`,
      height: isMobile ? "60vh" : "100%",
      maxHeight: isMobile ? "60vh" : "100%",
      display: "flex",
      flexDirection: "column",
      background: theme.colors.surface,
      borderRight: !isMobile ? `1px solid ${theme.colors.outline}` : "none",
      borderTop: isMobile ? `1px solid ${theme.colors.outline}` : "none",
      overflow: "hidden",
      order: isMobile ? 2 : 1,
      position: "relative",
      boxShadow: !isMobile ? theme.shadows[1] : "none",
    };

    const mapOverlayStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: hexToRgba(theme.colors.neutral[900], 0.4),
      backdropFilter: "blur(4px)",
      zIndex: 39,
      pointerEvents: mapBackgroundOverlay ? "auto" : "none",
      visibility: mapBackgroundOverlay ? "visible" : "hidden",
      opacity: mapBackgroundOverlay ? 1 : 0,
      transition: "opacity 0.3s ease-out, visibility 0.3s ease-out",
    };

    const topSectionContainerStyle = {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.colors.outline}`,
      flexShrink: 0,
    };

    const titleStyle = {
      fontSize: isMobile ? "22px" : "28px",
      fontWeight: 600,
      margin: `0 0 ${theme.spacing(1)} 0`,
      color: theme.colors.onSurface,
    };

    const descriptionStyle = {
      fontSize: isMobile ? "14px" : "16px",
      color: theme.colors.neutral[600],
      margin: "0",
      lineHeight: 1.5,
      marginBottom: theme.spacing(2),
    };

    const locationLabelStyle = {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: theme.spacing(0.5),
      color: theme.colors.neutral[700],
    };

    const searchInputContainerStyle = (isFocused = false) => ({
      display: "flex",
      alignItems: "center",
      height: "44px",
      border: `1px solid ${
        isFocused ? theme.colors.primary : theme.colors.outline
      }`,
      borderRadius: theme.shape.medium,
      backgroundColor: theme.colors.surface,
      overflow: "hidden",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxShadow: isFocused
        ? `0 0 0 2px ${hexToRgba(theme.colors.primary, 0.2)}`
        : "none",
    });

    const searchInputStyle = {
      flex: 1,
      border: "none",
      outline: "none",
      padding: `0 ${theme.spacing(1.5)}`,
      background: "transparent",
      color: theme.colors.onSurface,
      fontSize: "14px",
    };

    const searchIconButtonStyle = {
      border: "none",
      background: "transparent",
      padding: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: theme.colors.onSurfaceVariant,
    };

    const dealerListContainerStyle = {
      flex: 1,
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
      height: "calc(100% - 20px)",
      maxHeight: "100%",
    };

    const dealerCardStyleBase = (isSelected) => ({
      background: isSelected
        ? theme.colors.surfaceVariant
        : theme.colors.surface,
      borderRadius: theme.shape.medium,
      padding: theme.spacing(1.5),
      cursor: "pointer",
      marginBottom: theme.spacing(1.5),
      border: `1px solid ${isSelected ? theme.colors.primary : "transparent"}`,
      borderLeft: `3px solid ${
        isSelected ? theme.colors.primary : "transparent"
      }`,
      boxShadow: isSelected ? theme.shadows[2] : theme.shadows[1],
      transition:
        "background-color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s",
      position: "relative",
    });

    const dealerCardContentStyle = {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      width: "100%",
      gap: theme.spacing(1.5),
    };

    const dealerCardTextWrapStyle = {
      flex: 1,
      minWidth: 0,
    };

    const dealerCardTitleStyle = {
      margin: `0 0 ${theme.spacing(0.5)} 0`,
      fontSize: "16px",
      fontWeight: 600,
      color: theme.colors.onSurface,
      lineHeight: 1.4,
    };

    const dealerCardAddressStyle = {
      margin: `0 0 ${theme.spacing(1)} 0`,
      fontSize: "14px",
      color: theme.colors.neutral[600],
      lineHeight: 1.45,
    };

    const dealerCardDistanceStyle = {
      margin: `${theme.spacing(1)} 0 0 0`,
      fontSize: "13px",
      fontWeight: 500,
      color: theme.colors.primary,
    };

    const dealerCardArrowStyle = {
      color: theme.colors.onSurfaceVariant,
      display: "flex",
      alignItems: "center",
      marginTop: theme.spacing(0.5),
      flexShrink: 0,
    };

    const paginationContainerStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(1.5),
      borderTop: `1px solid ${theme.colors.outline}`,
      backgroundColor: theme.colors.surface,
      flexShrink: 0,
    };

    const paginationButtonStyleBase = (isDisabled) => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "50%",
      color: isDisabled
        ? theme.colors.neutral[400]
        : theme.colors.onSurfaceVariant,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.6 : 1,
      transition: "background-color 0.2s, color 0.2s",
    });

    const paginationInfoStyle = {
      margin: `0 ${theme.spacing(2)}`,
      fontSize: "14px",
      color: theme.colors.onSurfaceVariant,
    };

    const loadingOverlayStyle = {
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
    };

    const spinnerStyle = (rotation) => ({
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      border: `3px solid ${theme.colors.neutral[200]}`,
      borderTopColor: theme.colors.primary,
      transform: `rotate(${rotation}deg)`,
    });

    const loadingTextStyle = {
      marginTop: theme.spacing(2),
      color: theme.colors.neutral[700],
      fontSize: "16px",
      fontWeight: 500,
    };

    const errorOverlayStyle = {
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
      padding: theme.spacing(3),
      zIndex: 1000,
    };

    const errorIconContainerStyle = {
      marginBottom: theme.spacing(2),
      color: theme.colors.error,
    };

    const errorTextStyle = {
      color: theme.colors.neutral[800],
      fontSize: "16px",
      fontWeight: 500,
      textAlign: "center",
      marginBottom: theme.spacing(3),
    };

    const errorButtonStyle = {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      borderRadius: theme.shape.medium,
      padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing(1),
    };

    const mapPlaceholderStyle = {
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
      padding: theme.spacing(3),
    };

    const mapPlaceholderTextStyle = {
      color: theme.colors.neutral[700],
      fontSize: "18px",
      fontWeight: 600,
      marginTop: theme.spacing(2),
    };

    const mapPlaceholderSubTextStyle = {
      color: theme.colors.neutral[500],
      fontSize: "14px",
      marginTop: theme.spacing(1),
      textAlign: "center",
    };

    // Fixed textButtonStyle (now an object, not a function)
    const textButtonStyle = (isDisabled = false) => ({
      backgroundColor: "transparent",
      color: isDisabled ? theme.colors.neutral[400] : theme.colors.primary,
      border: "none",
      borderRadius: theme.shape.medium,
      padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
      fontSize: "14px",
      fontWeight: 500,
      cursor: isDisabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      transition: "background-color 0.2s, color 0.2s",
      opacity: isDisabled ? 0.6 : 1,
    });

    // Detail panel styles
    const detailSectionTitleStyle = {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.72px",
      color: theme.colors.neutral[700],
      margin: `0 0 ${theme.spacing(1.25)} 0`,
    };

    const detailParagraphStyle = {
      fontSize: "16px",
      lineHeight: 1.6,
      color: theme.colors.neutral[700],
      margin: `0 0 ${theme.spacing(1)} 0`,
    };

    const detailDistanceStyle = {
      fontSize: "14px",
      color: theme.colors.neutral[500],
      margin: `${theme.spacing(1)} 0 0 0`,
    };

    const detailContactItemStyle = {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1.25),
    };

    const detailLinkStyle = {
      color: theme.colors.primary,
      textDecoration: "none",
      fontSize: "16px",
      wordBreak: "break-word",
    };

    const detailHoursGridStyle = {
      display: "grid",
      gridTemplateColumns: "100px 1fr",
      gap: theme.spacing(1),
      fontSize: "14px",
    };

    const detailHoursDayStyle = {
      color: theme.colors.neutral[600],
    };

    const detailHoursTimeStyle = {
      color: theme.colors.neutral[800],
    };

    const detailServicesListStyle = {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(1),
    };

    const detailServiceItemStyle = {
      fontSize: "16px",
      lineHeight: 1.4,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    };

    const detailActionsFooterStyle = {
      display: "flex",
      padding: theme.spacing(2),
      borderTop: `1px solid ${theme.colors.outline}`,
      gap: theme.spacing(1.5),
      backgroundColor: theme.colors.surface,
      flexShrink: 0,
    };

    const detailActionButtonStyle = {
      flex: 1,
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
      backgroundColor: theme.colors.neutral[800],
      color: theme.colors.white,
      fontSize: "16px",
      fontWeight: 600,
      textDecoration: "none",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing(1),
      borderRadius: theme.shape.medium,
      transition: "filter 0.2s ease-out",
      border: "none",
      cursor: "pointer",
    };

    // Event handlers for hover effects
    const handleLinkEnter = (e) => {
      e.currentTarget.style.textDecoration = "underline";
    };

    const handleLinkLeave = (e) => {
      e.currentTarget.style.textDecoration = "none";
    };

    return {
      containerStyle,
      mapContainerStyle,
      sidebarStyle,
      mapOverlayStyle,
      topSectionContainerStyle,
      titleStyle,
      descriptionStyle,
      locationLabelStyle,
      searchInputContainerStyle,
      searchInputStyle,
      searchIconButtonStyle,
      dealerListContainerStyle,
      dealerCardStyleBase,
      dealerCardContentStyle,
      dealerCardTextWrapStyle,
      dealerCardTitleStyle,
      dealerCardAddressStyle,
      dealerCardDistanceStyle,
      dealerCardArrowStyle,
      paginationContainerStyle,
      paginationButtonStyleBase,
      paginationInfoStyle,
      loadingOverlayStyle,
      spinnerStyle,
      loadingTextStyle,
      errorOverlayStyle,
      errorIconContainerStyle,
      errorTextStyle,
      errorButtonStyle,
      mapPlaceholderStyle,
      mapPlaceholderTextStyle,
      mapPlaceholderSubTextStyle,
      textButtonStyle,
      handleLinkEnter,
      handleLinkLeave,
      detailPanelWidth,
      detailSectionTitleStyle,
      detailParagraphStyle,
      detailDistanceStyle,
      detailContactItemStyle,
      detailLinkStyle,
      detailHoursGridStyle,
      detailHoursDayStyle,
      detailHoursTimeStyle,
      detailServicesListStyle,
      detailServiceItemStyle,
      detailActionsFooterStyle,
      detailActionButtonStyle,
    };
  }, [
    theme,
    isMobile,
    style,
    detailPanelWidth,
    navbarHeight,
    mapBackgroundOverlay,
  ]);

  // ==================== EVENT HANDLERS ====================
  // Geocoding handler
  // Update geocoding handler for better search experience and India restriction
  const handleGeocodeSearch = useCallback(
    async (query) => {
      if (!query) {
        setSearchLocation(null);
        return;
      }
      if (RenderTarget.current() === RenderTarget.canvas) return;

      setSearchLocation(null);
      setComponentError(null);
      console.log(`Geocoding search for: "${query}"`);

      try {
        if (
          mapProvider === "mapbox" &&
          mapboxAccessToken &&
          geocoderRef.current === "mapbox"
        ) {
          const proximity = userLocation
            ? `&proximity=${userLocation.lng},${userLocation.lat}`
            : "";

          // Strictly enforce India search with multiple constraints
          const country = "&country=in"; // India country code
          const bbox = "&bbox=68.1,6.5,97.4,35.5"; // India bounding box
          const types =
            "&types=region,district,place,locality,neighborhood,address,postcode"; // Valid result types

          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${mapboxAccessToken}&limit=1${country}${proximity}${bbox}${types}`;

          const response = await fetch(url);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              `Mapbox Geocoding failed: ${data.message || response.statusText}`
            );
          }

          if (data.features?.length > 0) {
            // Verify result is in India by checking context
            const isInIndia = data.features[0].context?.some(
              (ctx) => ctx.id.startsWith("country.") && ctx.short_code === "in"
            );

            if (!isInIndia) {
              setComponentError(
                "Search is restricted to locations in India only."
              );
              return;
            }

            const feature = data.features[0];
            const [lng, lat] = feature.center;
            console.log("Mapbox Geocoding result:", {
              lat,
              lng,
              feature,
            });

            // Validate coordinates are within India bounds
            if (lat < 6.5 || lat > 35.5 || lng < 68.1 || lng > 97.4) {
              setComponentError(
                "Search is restricted to locations in India only."
              );
              return;
            }

            setSearchLocation({ lat, lng });

            // Clear any existing timeout
            if (mapCenteringTimeoutRef.current) {
              clearTimeout(mapCenteringTimeoutRef.current);
            }

            // Determine zoom level based on the result type/precision
            let newZoom = 13; // Default zoom

            // Adjust zoom based on the type of result
            if (feature.place_type) {
              const placeType = feature.place_type[0];
              if (placeType === "country") newZoom = 5;
              else if (placeType === "region") newZoom = 7; // State level
              else if (placeType === "district") newZoom = 9;
              else if (placeType === "place") newZoom = 11; // City level
              else if (placeType === "locality" || placeType === "neighborhood")
                newZoom = 13;
              else if (placeType === "address" || placeType === "poi")
                newZoom = 15;
              else if (placeType === "postcode") newZoom = 12; // Pincode
            }

            // Use timeout to ensure consistent behavior
            mapCenteringTimeoutRef.current = setTimeout(() => {
              setActiveMapCenter([lng, lat]);
              setActiveMapZoom(newZoom);
              mapCenteringTimeoutRef.current = null;
            }, 200);

            setSearchMode("location");
          } else {
            console.warn("Mapbox Geocoding: No results found.");
            setComponentError(
              "Could not find location in India. Please try a different search."
            );
          }
        } else if (
          mapProvider === "google" &&
          geocoderRef.current instanceof window.google.maps.Geocoder
        ) {
          // For Google Maps, similar strict restriction to India
          geocoderRef.current.geocode(
            {
              address: query,
              region: "in",
              componentRestrictions: { country: "in" }, // Strictly enforce India
              bounds: new window.google.maps.LatLngBounds(
                new window.google.maps.LatLng(6.5, 68.1), // SW corner
                new window.google.maps.LatLng(35.5, 97.4) // NE corner
              ),
            },
            (results, status) => {
              if (status === "OK" && results?.[0]) {
                // Verify result is in India
                const isInIndia = results[0].address_components.some(
                  (component) =>
                    component.types.includes("country") &&
                    component.short_name === "IN"
                );

                if (!isInIndia) {
                  setComponentError(
                    "Search is restricted to locations in India only."
                  );
                  return;
                }

                const location = results[0].geometry.location;
                const coords = {
                  lat: location.lat(),
                  lng: location.lng(),
                };

                // Validate coordinates are within India bounds
                if (
                  coords.lat < 6.5 ||
                  coords.lat > 35.5 ||
                  coords.lng < 68.1 ||
                  coords.lng > 97.4
                ) {
                  setComponentError(
                    "Search is restricted to locations in India only."
                  );
                  return;
                }

                console.log("Google Geocoding result:", coords, results[0]);
                setSearchLocation(coords);

                // Clear any existing timeout
                if (mapCenteringTimeoutRef.current) {
                  clearTimeout(mapCenteringTimeoutRef.current);
                }

                // Determine zoom level based on the result type
                let newZoom = 13; // Default zoom
                const resultTypes = results[0].types || [];

                if (resultTypes.includes("country")) newZoom = 5;
                else if (resultTypes.includes("administrative_area_level_1"))
                  newZoom = 7; // State
                else if (resultTypes.includes("administrative_area_level_2"))
                  newZoom = 9; // District
                else if (resultTypes.includes("locality")) newZoom = 11; // City
                else if (resultTypes.includes("sublocality"))
                  newZoom = 13; // Area
                else if (resultTypes.includes("postal_code"))
                  newZoom = 12; // Pincode
                else if (
                  resultTypes.includes("street_address") ||
                  resultTypes.includes("point_of_interest")
                )
                  newZoom = 15;

                // Use timeout to ensure consistent behavior
                mapCenteringTimeoutRef.current = setTimeout(() => {
                  setActiveMapCenter([coords.lng, coords.lat]);
                  setActiveMapZoom(newZoom);
                  mapCenteringTimeoutRef.current = null;
                }, 200);

                setSearchMode("location");
              } else {
                console.warn(`Google Geocoding failed: ${status}`);
                setComponentError(
                  "Could not find location in India. Please try a different search."
                );
              }
            }
          );
        } else {
          console.warn("Geocoding service not available or not configured.");
          setComponentError("Geocoding service not available.");
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setComponentError(err.message || "Geocoding failed.");
      }
    },
    [mapProvider, mapboxAccessToken, userLocation]
  );

  // Search handlers
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    handleGeocodeSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchLocation(null);
    setComponentError(null);
    setSearchMode("none");
    userLocationRequestedRef.current = false;

    // Reset map view to user location or default center of India
    if (userLocation) {
      setActiveMapCenter([userLocation.lng, userLocation.lat]);
      setActiveMapZoom(12);
    } else {
      setActiveMapCenter([78.9629, 20.5937]);
      setActiveMapZoom(initialZoom);
    }
  };

  // Dealer selection handler
  // Update dealer selection handler to validate coordinates first
  const handleDealerSelect = useCallback(
    (dealer) => {
      // Coordinate validation is now done upstream when processing allDealers
      console.log("Dealer selected:", dealer.name);

      setSelectedDealer(dealer);

      // Clear any existing timeout
      if (dealerSelectTimeoutRef.current) {
        clearTimeout(dealerSelectTimeoutRef.current);
      }

      // Use timeout to ensure consistent behavior
      dealerSelectTimeoutRef.current = setTimeout(() => {
        // Force the map to center exactly on these coordinates
        setActiveMapCenter([dealer.coordinates.lng, dealer.coordinates.lat]);
        setActiveMapZoom(14);
        dealerSelectTimeoutRef.current = null;
      }, 100);

      setIsDetailOpen(true);
      setMapBackgroundOverlay(true);

      if (isMobile) {
        setDrawerExpanded(false);
      }

      // Scroll selected card into view in the list
      const cardElement = listContainerRef.current?.querySelector(
        `[data-dealer-id="${dealer.id}"]`
      );

      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    },
    [isMobile]
  );

  // Map interaction handlers
  const handleMapClick = useCallback(() => {
    if (isDetailOpen) {
      console.log("Map click detected, closing detail panel.");
      setIsDetailOpen(false);
      setMapBackgroundOverlay(false);
      setSelectedDealer(null);
    }
  }, [isDetailOpen]);

  // User location handler
  const handleUseLocation = useCallback(() => {
    console.log("Attempting to use user location...");
    setComponentError(null);
    handleClearSearch();
    userLocationRequestedRef.current = true;
    getUserLocation();
    setSearchMode("location");
  }, [getUserLocation]);

  // Pagination handler
  const handlePageChange = (page) => {
    if (!useInfiniteScroll) {
      console.log(`Changing page to: ${page}`);
      setCurrentPage(page);
      listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Detail panel handlers
  const handleDetailClose = useCallback(() => {
    console.log("Closing detail panel.");
    setIsDetailOpen(false);
    setMapBackgroundOverlay(false);
    setSelectedDealer(null);
  }, []);

  const handleToggleDrawerExpanded = useCallback((expanded) => {
    console.log(`Toggling mobile drawer expanded state to: ${expanded}`);
    setDrawerExpanded(expanded);
  }, []);

  // Update the markers ready callback to be more reliable
  const handleMarkersReady = useCallback(() => {
    console.log("Markers rendered callback received");
    // Set a short timeout to ensure the UI has time to update
    setTimeout(() => {
      setMarkersRendered(true);
      markersProcessedRef.current = true;
    }, 100);
  }, []);

  // ==================== RENDER CONDITIONALS ====================
  const apiKeyMissing =
    (mapProvider === "mapbox" && !mapboxAccessToken) ||
    (mapProvider === "google" && !googleApiKey);

  const showMapPlaceholder =
    RenderTarget.current() === RenderTarget.canvas || apiKeyMissing;

  const actualMapProvider = showMapPlaceholder ? "none" : mapProvider;

  // ==================== RENDER ====================
  return (
    <div style={styles.containerStyle}>
      {/* Full Screen Loading Indicator - Only show during initial loading */}
      {isLocatingCombined && !componentError && (
        <LoadingIndicator
          text={loadingText}
          showText={true}
          color={primaryColor}
          size="large"
          fullScreen={true}
          backgroundColor="rgba(255, 255, 255, 0.95)"
        />
      )}

      {/* Only show ErrorDisplay for critical errors (API, Map load), not geoError */}
      {componentError && !isLocatingCombined && !dealersError && (
        <ErrorDisplay
          message={componentError} // Shows mapApiLoadError
          onRetry={undefined} // No specific retry for map load error here
+          theme={theme}
+          styles={styles}
+        />
+      )}
+      {/* Show ErrorDisplay with retry for dealer fetch errors */}
+      {dealersError && !isLocatingCombined && (
+        <ErrorDisplay
+          message={dealersError}
+          onRetry={refetchDealers}
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

      {/* Sidebar (List View) */}
      <div style={styles.sidebarStyle}>
        {/* Top Section: Title, Desc, Search, Filters */}
        <div style={styles.topSectionContainerStyle}>
          <h1 style={styles.titleStyle}>{title}</h1>
          <p style={styles.descriptionStyle}>{description}</p>
          {!isMobile && (
            <div style={styles.locationLabelStyle}>FIND LOCATION</div>
          )}
          {showSearchBar && (
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              onClearSearch={handleClearSearch}
              allowLocationAccess={allowLocationAccess}
              onUseLocation={handleUseLocation}
              isLocating={isGeoLocating}
              locationError={geoError} // Pass geoError to SearchBar
              searchPlaceholder={searchPlaceholder}
              useMyLocationText={"Use Location"}
              theme={theme}
              styles={styles}
            />
          )}
        </div>

        {/* Dealer List Area */}
        <div ref={listContainerRef} style={styles.dealerListContainerStyle}>
          {/* Conditional Rendering: No Results or Dealer Cards */}
          {filteredDealers.length === 0 && !isLocatingCombined ? (
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
              {/* Use displayedDealers which handles pagination/infinite scroll */}
              {displayedDealers.map((dealer) => (
                <DealerCard
                  key={dealer.id}
                  dealer={dealer}
                  isSelected={selectedDealer?.id === dealer.id}
                  onSelect={handleDealerSelect}
                  distanceUnit={distanceUnit}
                  theme={theme}
                  styles={styles}
                />
              ))}
              {/* Loading indicator for infinite scroll */}
              {useInfiniteScroll && isLoadingMore && (
                <div
                  style={{
                    padding: theme.spacing(2),
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: `2px solid ${theme.colors.outline}`,
                      borderTopColor: theme.colors.primary,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </>
          )}
        </div>

        {/* Optional Pagination Controls */}
        {!useInfiniteScroll && totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            theme={theme}
            styles={styles}
          />
        )}
      </div>

      {/* Map Area */}
      <div style={styles.mapContainerStyle}>
        {showMapPlaceholder ? (
          <MapPlaceholder
            message={
              apiKeyMissing
                ? `${
                    mapProvider === "mapbox" ? "Mapbox Token" : "Google API Key"
                  } Required`
                : "Map Preview"
            }
            subtext={
              apiKeyMissing
                ? "Add credential in properties panel."
                : "Map renders in Preview/Published site."
            }
            theme={theme}
            styles={styles}
          />
        ) : (
          <MapWrapper
            mapProvider={actualMapProvider}
            mapboxAccessToken={mapboxAccessToken}
            googleApiKey={googleApiKey}
            center={activeMapCenter}
            zoom={activeMapZoom}
            dealers={allDealers} // Always show all dealers on the map
            selectedDealer={selectedDealer}
            userLocation={userLocation}
            searchLocation={searchLocation}
            onMarkerClick={handleDealerSelect}
            onMapClick={handleMapClick}
            onMarkersReady={handleMarkersReady}
            theme={theme}
            distanceUnit={distanceUnit}
            mapboxMapStyleUrl={mapboxMapStyleUrl}
            googleMapStyleId={googleMapStyleId}
            hideControls={false}
            navigationControl={true}
            attributionControl={true}
          />
        )}
      </div>

      {/* Detail Panel */}
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
        mapProvider={actualMapProvider}
        isExpanded={drawerExpanded}
        onToggleExpanded={handleToggleDrawerExpanded}
      />
    </div>
  );
}

// ==================== PROPERTY CONTROLS ====================
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
  googleMapStyleId: {
    title: "Google Style ID",
    type: ControlType.String,
    defaultValue: "monochrome_minimal",
    description: "Use 'standard' or custom style ID.",
    hidden: (props) => props.mapProvider !== "google",
    group: "_mapGroup",
  },
  initialZoom: {
    title: "Initial Zoom",
    type: ControlType.Number,
    defaultValue: 5, // Lower zoom to show more of India
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
  maxSearchRadius: {
    title: "Max Search Radius",
    type: ControlType.Number,
    defaultValue: 150,
    min: 10,
    max: 500,
    step: 10,
    displayStepper: true,
    description: "Maximum radius (in km) to show dealers from search location",
    group: "_mapGroup",
  },
  showNearestDealers: {
    title: "Show Nearest X",
    type: ControlType.Number,
    defaultValue: 7,
    min: 1,
    max: 20,
    step: 1,
    displayStepper: true,
    description: "Number of nearest dealers to show if none found in radius",
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
  useInfiniteScroll: {
    title: "Use Infinite Scroll",
    type: ControlType.Boolean,
    defaultValue: true,
    description: "Loads more items on scroll instead of pagination.",
    group: "_dataGroup",
  },
  resultsPerPage: {
    title: "Items Per Load",
    type: ControlType.Number,
    defaultValue: 10,
    min: 1,
    max: 50,
    step: 1,
    displayStepper: true,
    description: "Items per page (Pagination) or per scroll load (Infinite).",
    group: "_dataGroup",
  },

  // --- Group: Features ---
  _featuresGroup: { type: ControlType.Group, title: "Features" },
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

  // --- Group: Appearance ---
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
    title: "Surface (Cards)",
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
    title: "Navbar Height",
    type: ControlType.Number,
    defaultValue: 81,
    min: 0,
    max: 200,
    step: 1,
    displayStepper: true,
    description: "Height of the navbar to adjust component height",
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
  noResultsText: {
    title: "No Results Text",
    type: ControlType.String,
    defaultValue: "No locations found matching your criteria.",
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
