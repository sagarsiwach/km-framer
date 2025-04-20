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
  formatAddress,
} from "https://framer.com/m/Lib-8AS5.js@vS7d5YP2fjGyqMnH5L1D"; // Adjust path
import {
  useDealerData,
  useGeolocation,
  useMapApiState,
} from "https://framer.com/m/Hooks-ZmUS.js@2ecUl320qKIztH19IQLd"; // Adjust path
import MapWrapper from "https://framer.com/m/MapWrapper-dYOf.js"; // Adjust path
import {
  DealerCard,
  DealerDetailPanel,
  ErrorDisplay,
  LoadingOverlay,
  MapPlaceholder,
  PaginationControls,
  SearchBar,
} from "https://framer.com/m/Components-bS3j.js@0jRsmeo87YGyazwSo9oO"; // Adjust path
import LoadingIndicator from "https://framer.com/m/LoadingOverlay-8m7G.js";

// --- Main Dealer Locator Component ---
export default function DealerLocator(props) {
  // --- Props ---
  const {
    mapProvider = "mapbox",
    mapboxAccessToken = "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA",
    mapboxMapStyleUrl = "mapbox://styles/mapbox/light-v11",
    googleApiKey = "",
    googleMapStyleId = "monochrome_minimal", // Keep for potential switch
    apiEndpoint = "https://booking-engine.sagarsiwach.workers.dev/dealer",
    initialZoom = 11,
    distanceUnit = "km",
    resultsPerPage = 7,
    useInfiniteScroll = true,
    showSearchBar = true,
    showFilters = true,
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
    title = "Locate a Dealer",
    description = "Discover our network of partners.",
    style,
    detailPanelWidth = 400,
    maxSearchRadius = 150, // Default maximum search radius in km (can be made a prop)
    showNearestDealers = 7, // Number of nearest dealers to show if no results in search area
  } = props;

  // --- State ---
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [searchLocation, setSearchLocation] = useState<Location>(null);
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);
  const [allFilteredDealers, setAllFilteredDealers] = useState<Dealer[]>([]); // Store all filtered dealers
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [activeMapCenter, setActiveMapCenter] = useState<
    Coordinates | [number, number]
  >(getInitialCenter(mapProvider));
  const [activeMapZoom, setActiveMapZoom] = useState(initialZoom);
  const [spinnerRotation, setSpinnerRotation] = useState(0);
  const [showStores, setShowStores] = useState(true);
  const [showService, setShowService] = useState(true);
  const [showCharging, setShowCharging] = useState(true);
  const [mapBackgroundOverlay, setMapBackgroundOverlay] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [markersReady, setMarkersReady] = useState(false); // Track when markers are ready
  const [searchMode, setSearchMode] = useState<"none" | "text" | "location">(
    "none"
  );
  const [markersRendered, setMarkersRendered] = useState(false);

  // --- Refs ---
  const geocoderRef = useRef<any>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const markersProcessedRef = useRef(false);

  // --- Hooks ---
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

  // Combined loading state
  const isLocatingCombined = useMemo(
    () => isDealersLoading || isGeoLocating || !markersRendered,
    [isDealersLoading, isGeoLocating, markersRendered]
  );

  // --- Responsive Check ---
  const isMobile = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) return false;
    return typeof window !== "undefined" && window.innerWidth < 768;
  }, []);

  // --- Effects ---

  // Initialize Geocoder based on provider
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

  // Update combined error state
  useEffect(() => {
    const errorMsg =
      dealersError || geoError || mapApiLoadError?.message || null;
    if (errorMsg !== componentError) {
      setComponentError(errorMsg);
      if (errorMsg) console.error("Component Error Set:", errorMsg);
    }
  }, [dealersError, geoError, mapApiLoadError, componentError]);

  // Spinner animation effect
  useEffect(() => {
    let frameId: number | null = null;
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
    setActiveMapCenter(getInitialCenter(mapProvider));
    setActiveMapZoom(initialZoom);
    setSearchLocation(null);
    setSelectedDealer(null);
    setIsDetailOpen(false);
    setMapBackgroundOverlay(false);
    setComponentError(null);
    setMarkersRendered(false);
  }, [mapProvider, initialZoom]);

  // Effects for markers ready notification
  useEffect(() => {
    // After dealers are loaded, set a timeout to ensure markers are processed
    if (
      !isDealersLoading &&
      allDealers.length > 0 &&
      !markersProcessedRef.current
    ) {
      const timer = setTimeout(() => {
        setMarkersRendered(true);
        markersProcessedRef.current = true;
      }, 1500); // Allow some time for markers to render

      return () => clearTimeout(timer);
    }
  }, [isDealersLoading, allDealers]);

  // Effect for when user location changes
  useEffect(() => {
    if (userLocation) {
      console.log("User location updated:", userLocation);
      // If we're in location search mode, update the center
      if (searchMode === "location") {
        setActiveMapCenter([userLocation.lng, userLocation.lat]);
        setActiveMapZoom(13); // Zoom in a bit
      }
    }
  }, [userLocation, searchMode]);

  // --- Filtering and Sorting Logic ---
  useEffect(() => {
    if (RenderTarget.current() === RenderTarget.canvas) {
      // Show limited sample data on canvas
      setFilteredDealers(SAMPLE_DEALERS.slice(0, 5));
      setAllFilteredDealers(SAMPLE_DEALERS);
      setMarkersRendered(true);
      return;
    }

    if (isDealersLoading) return; // Wait for initial data load

    console.log("Filtering and sorting dealers...");
    const locationForDistance = searchLocation || userLocation || null;

    // STEP 1: Enhance dealers with distance if location available
    let allDealersWithDistance = allDealers.map((dealer) => ({
      ...dealer,
      distance: locationForDistance
        ? calculateDistance(
            locationForDistance,
            dealer.coordinates,
            distanceUnit
          )
        : undefined,
    }));

    // STEP 2: Sort by distance (if available) or alphabetically
    allDealersWithDistance.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });

    // Store all dealers with distance for potential nearest fallback
    const allDealersWithDistanceSorted = [...allDealersWithDistance];

    // STEP 3: Apply Text Search Filter if using text search without location
    if (debouncedSearchQuery && !searchLocation && !userLocation) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      if (query) {
        console.log(`Filtering by text: "${query}"`);
        allDealersWithDistance = allDealersWithDistance.filter(
          (d) =>
            d.name?.toLowerCase().includes(query) ||
            d.address?.formatted?.toLowerCase().includes(query) ||
            d.address?.city?.toLowerCase().includes(query) ||
            d.address?.pincode?.toLowerCase().includes(query) ||
            d.services?.some((s) => s.toLowerCase().includes(query))
        );
      }
      setSearchMode("text");
    }
    // STEP 4: Apply distance filtering if using location-based search
    else if (locationForDistance) {
      const MAX_SEARCH_RADIUS_KM = maxSearchRadius;
      const maxDist =
        distanceUnit === "miles"
          ? MAX_SEARCH_RADIUS_KM * 0.621371
          : MAX_SEARCH_RADIUS_KM;

      console.log(
        `Filtering by distance (max ${maxDist} ${distanceUnit}) from location:`,
        locationForDistance
      );

      // Filter dealers by distance
      const dealersInRadius = allDealersWithDistance.filter(
        (d) => d.distance !== undefined && d.distance <= maxDist
      );

      // If no dealers found in radius, show nearest N dealers
      if (dealersInRadius.length === 0) {
        console.log(
          `No dealers found within ${maxDist} ${distanceUnit}, showing nearest ${showNearestDealers}`
        );
        allDealersWithDistance = allDealersWithDistanceSorted.slice(
          0,
          showNearestDealers
        );
      } else {
        allDealersWithDistance = dealersInRadius;
      }

      setSearchMode("location");
    } else {
      // No search applied, reset search mode
      setSearchMode("none");
    }

    // STEP 5: Apply Service Type Filters
    const anyFilterActive = showStores || showService || showCharging;

    // Store the full filtered list before service filtering for the map
    let allFilteredBeforeServiceFilters = [...allDealersWithDistance];

    // Apply service filters if any are active
    if (anyFilterActive) {
      allDealersWithDistance = allDealersWithDistance.filter((d) => {
        const services = d.services?.map((s) => s.toLowerCase()) || [];
        const isStore =
          services.includes("sales") || services.includes("store");
        const isService =
          services.includes("service") || services.includes("repair");
        const isCharging =
          services.includes("charging") || services.includes("ev charging");

        // FIXED: Changed from AND to OR logic for filters
        return (
          (showStores && isStore) ||
          (showService && isService) ||
          (showCharging && isCharging)
        );
      });
    }

    console.log(`Found ${allDealersWithDistance.length} filtered dealers.`);

    // Set the filtered dealers for the list view
    setFilteredDealers(allDealersWithDistance);

    // Set all filtered dealers for the map (without service filters)
    // This way map shows all dealers but list is filtered
    setAllFilteredDealers(allFilteredBeforeServiceFilters);

    // Reset to page 1 whenever filters/search changes the list
    if (currentPage !== 1) {
      setCurrentPage(1);
      listContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [
    allDealers,
    debouncedSearchQuery,
    userLocation,
    searchLocation,
    distanceUnit,
    showStores,
    showService,
    showCharging,
    isDealersLoading,
    maxSearchRadius,
    showNearestDealers,
  ]);

  // --- Pagination/Infinite Scroll Data ---
  const displayedDealers = useMemo(() => {
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
    return Math.ceil(filteredDealers.length / resultsPerPage);
  }, [filteredDealers, resultsPerPage]);

  // --- Infinite Scroll Handler ---
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

  // Attach/Detach scroll listener
  useEffect(() => {
    const list = listContainerRef.current;
    if (list && useInfiniteScroll) {
      list.addEventListener("scroll", handleScroll);
      console.log("Infinite scroll listener attached.");
    } else {
      console.log(
        "Infinite scroll listener NOT attached (disabled or element missing)."
      );
    }

    return () => {
      if (list && useInfiniteScroll) {
        list.removeEventListener("scroll", handleScroll);
        console.log("Infinite scroll listener removed.");
      }
    };
  }, [useInfiniteScroll, handleScroll]);

  // --- Theme and Style Generation ---
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

  // --- Style Objects Generation ---
  const styles = useMemo(() => {
    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      width: "100%",
      height: "100%",
      maxHeight: "100%",
      backgroundColor: theme.colors.background,
      overflow: "hidden",
      position: "relative",
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.onSurface,
      ...style,
    };

    const mapContainerStyle: React.CSSProperties = {
      flex: 1,
      minHeight: isMobile ? "40%" : "auto",
      height: isMobile ? "40%" : "100%",
      position: "relative",
      backgroundColor: theme.colors.surfaceVariant,
      order: isMobile ? 1 : 2,
    };

    const sidebarStyle: React.CSSProperties = {
      flex: isMobile ? "1" : `0 0 ${detailPanelWidth}px`,
      height: isMobile ? "60%" : "100%",
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

    const mapOverlayStyle: React.CSSProperties = {
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

    // --- Search/Filter Area Styles ---
    const topSectionContainerStyle: React.CSSProperties = {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.colors.outline}`,
      flexShrink: 0,
    };

    const titleStyle: React.CSSProperties = {
      fontSize: isMobile ? "22px" : "28px",
      fontWeight: 600,
      margin: `0 0 ${theme.spacing(1)} 0`,
      color: theme.colors.onSurface,
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: isMobile ? "14px" : "16px",
      color: theme.colors.neutral[600],
      margin: "0",
      lineHeight: 1.5,
      marginBottom: theme.spacing(2),
    };

    const locationLabelStyle: React.CSSProperties = {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: theme.spacing(0.5),
      color: theme.colors.neutral[700],
    };

    const searchInputContainerStyle = (
      isFocused = false
    ): React.CSSProperties => ({
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

    const searchInputStyle: React.CSSProperties = {
      flex: 1,
      border: "none",
      outline: "none",
      padding: `0 ${theme.spacing(1.5)}`,
      background: "transparent",
      color: theme.colors.onSurface,
      fontSize: "14px",
    };

    const searchIconButtonStyle: React.CSSProperties = {
      border: "none",
      background: "transparent",
      padding: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: theme.colors.onSurfaceVariant,
    };

    const filterContainerStyle: React.CSSProperties = {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(2),
    };

    const filterCheckboxStyle = (isActive: boolean): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(0.75),
      fontSize: "14px",
      fontWeight: 400,
      color: theme.colors.onSurfaceVariant,
      cursor: "pointer",
      userSelect: "none",
      padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
      borderRadius: theme.shape.small,
      transition: "background-color 0.15s ease-in-out",
    });

    const filterCheckboxIndicatorStyle = (
      isActive: boolean
    ): React.CSSProperties => ({
      width: "18px",
      height: "18px",
      borderRadius: theme.shape.small,
      border: `1.5px solid ${
        isActive ? theme.colors.primary : theme.colors.outline
      }`,
      backgroundColor: isActive ? theme.colors.primary : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s, border-color 0.2s",
      flexShrink: 0,
      content: isActive
        ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(
            theme.colors.onPrimary
          )}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>')`
        : '""',
    });

    // --- Dealer List Styles ---
    const dealerListContainerStyle: React.CSSProperties = {
      flex: 1,
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
    };

    const dealerCardStyleBase = (isSelected: boolean): React.CSSProperties => ({
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

    const dealerCardContentStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      width: "100%",
      gap: theme.spacing(1.5),
    };

    const dealerCardTextWrapStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
    };

    const dealerCardTitleStyle: React.CSSProperties = {
      margin: `0 0 ${theme.spacing(0.5)} 0`,
      fontSize: "16px",
      fontWeight: 600,
      color: theme.colors.onSurface,
      lineHeight: 1.4,
    };

    const dealerCardAddressStyle: React.CSSProperties = {
      margin: `0 0 ${theme.spacing(1)} 0`,
      fontSize: "14px",
      color: theme.colors.neutral[600],
      lineHeight: 1.45,
    };

    const dealerCardServicesStyle: React.CSSProperties = {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    };

    const dealerCardServiceTagStyle = (
      bgColor: string,
      textColor: string,
      bdColor: string
    ): React.CSSProperties => ({
      fontSize: "10px",
      padding: "3px 6px",
      backgroundColor: bgColor,
      color: textColor,
      borderRadius: "3px",
      textTransform: "uppercase",
      fontWeight: 700,
      letterSpacing: "0.5px",
      outline: `1px solid ${bdColor}`,
      outlineOffset: "-1px",
    });

    const dealerCardDistanceStyle: React.CSSProperties = {
      margin: `${theme.spacing(1)} 0 0 0`,
      fontSize: "13px",
      fontWeight: 500,
      color: theme.colors.primary,
    };

    const dealerCardArrowStyle: React.CSSProperties = {
      color: theme.colors.onSurfaceVariant,
      display: "flex",
      alignItems: "center",
      marginTop: theme.spacing(0.5),
      flexShrink: 0,
    };

    // --- Pagination Styles ---
    const paginationContainerStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(1.5),
      borderTop: `1px solid ${theme.colors.outline}`,
      backgroundColor: theme.colors.surface,
      flexShrink: 0,
    };

    const paginationButtonStyleBase = (
      isDisabled: boolean
    ): React.CSSProperties => ({
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

    const paginationInfoStyle: React.CSSProperties = {
      margin: `0 ${theme.spacing(2)}`,
      fontSize: "14px",
      color: theme.colors.onSurfaceVariant,
    };

    // --- Loading, Error, Placeholder Styles ---
    const loadingOverlayStyle: React.CSSProperties = {
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

    const loadingTextStyle: React.CSSProperties = {
      marginTop: theme.spacing(2),
      color: theme.colors.neutral[700],
      fontSize: "16px",
      fontWeight: 500,
    };

    const errorOverlayStyle: React.CSSProperties = {
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

    const errorIconContainerStyle: React.CSSProperties = {
      marginBottom: theme.spacing(2),
      color: theme.colors.error,
    };

    const errorTextStyle: React.CSSProperties = {
      color: theme.colors.neutral[800],
      fontSize: "16px",
      fontWeight: 500,
      textAlign: "center",
      marginBottom: theme.spacing(3),
    };

    const errorButtonStyle: React.CSSProperties = {
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

    const mapPlaceholderStyle: React.CSSProperties = {
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

    const mapPlaceholderTextStyle: React.CSSProperties = {
      color: theme.colors.neutral[700],
      fontSize: "18px",
      fontWeight: 600,
      marginTop: theme.spacing(2),
    };

    const mapPlaceholderSubTextStyle: React.CSSProperties = {
      color: theme.colors.neutral[500],
      fontSize: "14px",
      marginTop: theme.spacing(1),
      textAlign: "center",
    };

    // --- Button Styles ---
    const textButtonStyle = (isDisabled = false): React.CSSProperties => ({
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

    // --- Detail Panel Styles ---
    const detailSectionTitleStyle: React.CSSProperties = {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.72px",
      color: theme.colors.neutral[700],
      margin: `0 0 ${theme.spacing(1.25)} 0`,
    };

    const detailParagraphStyle: React.CSSProperties = {
      fontSize: "16px",
      lineHeight: 1.6,
      color: theme.colors.neutral[700],
      margin: `0 0 ${theme.spacing(1)} 0`,
    };

    const detailDistanceStyle: React.CSSProperties = {
      fontSize: "14px",
      color: theme.colors.neutral[500],
      margin: `${theme.spacing(1)} 0 0 0`,
    };

    const detailContactItemStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1.25),
    };

    const detailLinkStyle: React.CSSProperties = {
      color: theme.colors.primary,
      textDecoration: "none",
      fontSize: "16px",
      wordBreak: "break-word",
    };

    const detailHoursGridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "100px 1fr",
      gap: theme.spacing(1),
      fontSize: "14px",
    };

    const detailHoursDayStyle: React.CSSProperties = {};

    const detailHoursTimeStyle: React.CSSProperties = {};

    const detailServicesListStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(1),
    };

    const detailServiceItemStyle: React.CSSProperties = {
      fontSize: "16px",
      lineHeight: 1.4,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
    };

    const detailActionsFooterStyle: React.CSSProperties = {
      display: "flex",
      padding: theme.spacing(2),
      borderTop: `1px solid ${theme.colors.outline}`,
      gap: theme.spacing(1.5),
      backgroundColor: theme.colors.surface,
      flexShrink: 0,
    };

    const detailActionButtonStyle: React.CSSProperties = {
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
    };

    // Event handlers for hover effects
    const handleLinkEnter = () => {};
    const handleLinkLeave = () => {};

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
      filterContainerStyle,
      filterCheckboxStyle,
      filterCheckboxIndicatorStyle,
      dealerListContainerStyle,
      dealerCardStyleBase,
      dealerCardContentStyle,
      dealerCardTextWrapStyle,
      dealerCardTitleStyle,
      dealerCardAddressStyle,
      dealerCardServicesStyle,
      dealerCardServiceTagStyle,
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
    showFilters,
    mapBackgroundOverlay,
  ]);

  // --- Geocoding Handler ---
  const handleGeocodeSearch = useCallback(
    async (query: string) => {
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
          const country = "&country=IN"; // Bias search to India
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${mapboxAccessToken}&limit=1${country}${proximity}`;

          const response = await fetch(url);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              `Mapbox Geocoding failed: ${data.message || response.statusText}`
            );
          }

          if (data.features?.length > 0) {
            const [lng, lat] = data.features[0].center;
            console.log("Mapbox Geocoding result:", { lat, lng });
            setSearchLocation({ lat, lng });
            setActiveMapCenter([lng, lat]);
            setActiveMapZoom(13);
            setSearchMode("location");
          } else {
            console.warn("Mapbox Geocoding: No results found.");
            setComponentError("Could not find location for the search query.");
          }
        } else if (
          mapProvider === "google" &&
          geocoderRef.current instanceof window.google.maps.Geocoder
        ) {
          geocoderRef.current.geocode(
            { address: query, region: "IN" },
            (results, status) => {
              if (status === "OK" && results?.[0]) {
                const location = results[0].geometry.location;
                const coords = {
                  lat: location.lat(),
                  lng: location.lng(),
                };
                console.log("Google Geocoding result:", coords);
                setSearchLocation(coords);
                setActiveMapCenter(coords);
                setActiveMapZoom(13);
                setSearchMode("location");
              } else {
                console.warn(`Google Geocoding failed: ${status}`);
                setComponentError(
                  "Could not find location for the search query."
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
    [mapProvider, mapboxAccessToken, userLocation, googleApiKey]
  );

  // --- Event Handlers ---
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    handleGeocodeSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchLocation(null);
    setComponentError(null);
    setSearchMode("none");

    // Reset map view to user location or default
    if (userLocation) {
      setActiveMapCenter([userLocation.lng, userLocation.lat]);
      setActiveMapZoom(12);
    } else {
      setActiveMapCenter(getInitialCenter(mapProvider));
      setActiveMapZoom(initialZoom);
    }
  };

  const handleDealerSelect = useCallback(
    (dealer: Dealer) => {
      console.log("Dealer selected:", dealer.name);
      setSelectedDealer(dealer);
      setActiveMapCenter([dealer.coordinates.lng, dealer.coordinates.lat]);
      setActiveMapZoom(14);
      setIsDetailOpen(true);
      setMapBackgroundOverlay(true);

      if (isMobile) {
        setDrawerExpanded(false);
      }

      // Scroll selected card into view in the list
      const cardElement = listContainerRef.current?.querySelector(
        `[data-dealer-id="${dealer.id}"]`
      );

      cardElement?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    },
    [isMobile]
  );

  const handleMapClick = useCallback(() => {
    // Close detail panel when clicking map background (if open)
    if (isDetailOpen) {
      console.log("Map click detected, closing detail panel.");
      setIsDetailOpen(false);
      setMapBackgroundOverlay(false);
      setSelectedDealer(null);
    }
  }, [isDetailOpen]);

  const handleUseLocation = useCallback(() => {
    console.log("Attempting to use user location...");
    setComponentError(null);
    handleClearSearch();
    getUserLocation();
    setSearchMode("location");
    // Map panning will happen in the effect watching userLocation
  }, [getUserLocation]);

  const handlePageChange = (page: number) => {
    if (!useInfiniteScroll) {
      console.log(`Changing page to: ${page}`);
      setCurrentPage(page);
      listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDetailClose = useCallback(() => {
    console.log("Closing detail panel.");
    setIsDetailOpen(false);
    setMapBackgroundOverlay(false);
    setSelectedDealer(null);
  }, []);

  const handleToggleDrawerExpanded = useCallback((expanded: boolean) => {
    console.log(`Toggling mobile drawer expanded state to: ${expanded}`);
    setDrawerExpanded(expanded);
  }, []);

  // Function to notify when markers are loaded
  const handleMarkersReady = useCallback(() => {
    setMarkersRendered(true);
  }, []);

  // --- Render Conditionals ---
  const apiKeyMissing =
    (mapProvider === "mapbox" && !mapboxAccessToken) ||
    (mapProvider === "google" && !googleApiKey);

  const showMapPlaceholder =
    RenderTarget.current() === RenderTarget.canvas || apiKeyMissing;

  const actualMapProvider = showMapPlaceholder ? "none" : mapProvider;

  // --- Final Render ---
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

      {componentError && !isLocatingCombined && (
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
              locationError={geoError}
              searchPlaceholder={searchPlaceholder}
              useMyLocationText={"Use Location"}
              theme={theme}
              styles={styles}
            />
          )}
          {showFilters && (
            <div style={styles.filterContainerStyle}>
              <label
                style={styles.filterCheckboxStyle(showStores)}
                onClick={() => setShowStores((s) => !s)}
              >
                <span
                  style={styles.filterCheckboxIndicatorStyle(showStores)}
                ></span>
                {filterStoresText}
              </label>
              <label
                style={styles.filterCheckboxStyle(showService)}
                onClick={() => setShowService((s) => !s)}
              >
                <span
                  style={styles.filterCheckboxIndicatorStyle(showService)}
                ></span>
                {filterServiceText}
              </label>
              <label
                style={styles.filterCheckboxStyle(showCharging)}
                onClick={() => setShowCharging((s) => !s)}
              >
                <span
                  style={styles.filterCheckboxIndicatorStyle(showCharging)}
                ></span>
                {filterChargingText}
              </label>
            </div>
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
            dealers={allFilteredDealers} // Use allFilteredDealers for the map to show all dealers, not just list-filtered ones
            selectedDealer={selectedDealer}
            userLocation={userLocation}
            searchLocation={searchLocation}
            onMarkerClick={handleDealerSelect}
            onMapClick={handleMapClick}
            onMarkersReady={handleMarkersReady} // Add callback for marker rendering
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
