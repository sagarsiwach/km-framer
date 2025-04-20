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
  formatAddress, // Import formatAddress
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
  // FilterButton, // FilterButton seems replaced by checkboxes, remove if unused
  LoadingOverlay,
  MapPlaceholder,
  PaginationControls,
  SearchBar,
} from "https://framer.com/m/Components-bS3j.js@0jRsmeo87YGyazwSo9oO"; // Adjust path

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
    resultsPerPage = 7, // Default results per page for pagination (if using pagination component)
    useInfiniteScroll = true, // Added prop to toggle infinite scroll
    showSearchBar = true,
    showFilters = true,
    allowLocationAccess = true,
    primaryColor = "#111827", // Default: Tailwind Gray 900
    secondaryColor = "#6B7280", // Default: Tailwind Gray 500
    accentColor = "#22C55E", // Default: Tailwind Green 500 (Used for Charging)
    salesColor = "#0284C7", // Default: Tailwind Sky 700
    serviceColor = "#DC2626", // Default: Tailwind Red 600
    backgroundColor = "#FFFFFF",
    surfaceColor = "#FFFFFF",
    onSurfaceColor = "#111827",
    outlineColor = "#E5E7EB", // Default: Tailwind Gray 200
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
  } = props;

  // --- State ---
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [searchLocation, setSearchLocation] = useState<Location>(null);
  const [filteredDealers, setFilteredDealers] = useState<Dealer[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // For both pagination/infinite scroll
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For infinite scroll UI
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [activeMapCenter, setActiveMapCenter] = useState<
    Coordinates | [number, number]
  >(getInitialCenter(mapProvider));
  const [activeMapZoom, setActiveMapZoom] = useState(initialZoom);
  const [spinnerRotation, setSpinnerRotation] = useState(0); // Keep for loading overlay
  const [showStores, setShowStores] = useState(true); // Filter states
  const [showService, setShowService] = useState(true);
  const [showCharging, setShowCharging] = useState(true);
  const [mapBackgroundOverlay, setMapBackgroundOverlay] = useState(false); // Detail panel overlay
  const [drawerExpanded, setDrawerExpanded] = useState(false); // Mobile detail panel state

  // --- Refs ---
  const geocoderRef = useRef<any>(null); // For geocoding instance
  const listContainerRef = useRef<HTMLDivElement>(null); // For infinite scroll

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
    useMapApiState(mapProvider, googleApiKey); // Manages API script loading if Google is used

  // Combined loading state
  const isLocatingCombined = useMemo(
    () => isDealersLoading || isGeoLocating,
    [isDealersLoading, isGeoLocating]
  );

  // --- Responsive Check ---
  const isMobile = useMemo(() => {
    if (RenderTarget.current() === RenderTarget.canvas) return false;
    return typeof window !== "undefined" && window.innerWidth < 768;
  }, []); // Re-evaluates only on client side

  // --- Effects ---

  // Initialize Geocoder based on provider
  useEffect(() => {
    if (mapProvider === "mapbox" && mapboxAccessToken) {
      // Mapbox geocoding uses fetch, no specific instance needed here
      geocoderRef.current = "mapbox";
      console.log("Mapbox geocoder ready (using fetch).");
    } else if (
      mapProvider === "google" &&
      isMapApiLoaded &&
      window.google?.maps?.Geocoder
    ) {
      // Initialize Google Geocoder only if API is loaded
      geocoderRef.current = new window.google.maps.Geocoder();
      console.log("Google Maps Geocoder initialized.");
    } else {
      geocoderRef.current = null;
      console.log("Geocoder not available or provider/API not ready.");
    }
  }, [mapProvider, isMapApiLoaded, mapboxAccessToken, googleApiKey]); // Ensure googleApiKey is a dependency if needed

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
    setSearchLocation(null); // Clear search location
    setSelectedDealer(null); // Deselect dealer
    setIsDetailOpen(false); // Close detail panel
    setMapBackgroundOverlay(false);
    setComponentError(null); // Clear errors related to previous provider
  }, [mapProvider, initialZoom]);

  // --- Filtering and Sorting Logic ---
  useEffect(() => {
    if (RenderTarget.current() === RenderTarget.canvas) {
      // Show limited sample data on canvas
      setFilteredDealers(SAMPLE_DEALERS.slice(0, 5)); // Show fewer on canvas
      return;
    }
    if (isDealersLoading) return; // Wait for initial data load

    console.log("Filtering and sorting dealers...");
    const locationForDistance = searchLocation || userLocation || null;
    let filtered = allDealers.map((dealer) => ({
      ...dealer,
      distance: locationForDistance
        ? calculateDistance(
            locationForDistance,
            dealer.coordinates,
            distanceUnit
          )
        : undefined, // Calculate distance if reference location exists
    }));

    // Apply Text Search Filter (if no specific location is searched/used)
    if (debouncedSearchQuery && !searchLocation && !userLocation) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      if (query) {
        console.log(`Filtering by text: "${query}"`);
        filtered = filtered.filter(
          (d) =>
            d.name?.toLowerCase().includes(query) ||
            d.address?.formatted?.toLowerCase().includes(query) ||
            d.address?.city?.toLowerCase().includes(query) ||
            d.address?.pincode?.toLowerCase().includes(query) || // Use pincode if available
            d.services?.some((s) => s.toLowerCase().includes(query)) // Filter by service name
        );
      }
    } else if (locationForDistance) {
      // If we have a location, filter by distance (optional, useful for dense areas)
      const MAX_SEARCH_RADIUS_KM = 150; // Increased radius
      const maxDist =
        distanceUnit === "miles"
          ? MAX_SEARCH_RADIUS_KM * 0.621371
          : MAX_SEARCH_RADIUS_KM;
      console.log(
        `Filtering by distance (max ${maxDist} ${distanceUnit}) from location:`,
        locationForDistance
      );
      filtered = filtered.filter(
        (d) => d.distance !== undefined && d.distance <= maxDist
      );
    }

    // Apply Service Type Filters
    const anyFilterActive = showStores || showService || showCharging;
    const noFiltersActive = !showStores && !showService && !showCharging; // Check if ALL filters are off

    if (anyFilterActive && !noFiltersActive) {
      // Apply only if at least one filter is ON
      console.log("Applying service filters:", {
        showStores,
        showService,
        showCharging,
      });
      filtered = filtered.filter((d) => {
        const services = d.services?.map((s) => s.toLowerCase()) || [];
        const isStore =
          services.includes("sales") || services.includes("store");
        const isService =
          services.includes("service") || services.includes("repair");
        const isCharging =
          services.includes("charging") || services.includes("ev charging");
        // Return true if the dealer matches ANY of the ACTIVE filters
        return (
          (showStores && isStore) ||
          (showService && isService) ||
          (showCharging && isCharging)
        );
      });
    } else {
      console.log(
        "No service filters active or all are off, showing all types based on other filters."
      );
    }

    // Sort Results: Prioritize distance if available, otherwise alphabetically
    filtered.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance; // Sort by distance ascending
      }
      if (a.distance !== undefined) return -1; // Dealers with distance come first
      if (b.distance !== undefined) return 1; // Dealers without distance come last
      return a.name.localeCompare(b.name); // Fallback to alphabetical sort
    });

    console.log(`Found ${filtered.length} filtered dealers.`);
    setFilteredDealers(filtered);
    // Reset to page 1 whenever filters/search changes the list
    if (currentPage !== 1) {
      setCurrentPage(1);
      listContainerRef.current?.scrollTo({ top: 0, behavior: "auto" }); // Scroll to top immediately
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
    isDealersLoading, // Re-filter when loading finishes
    // currentPage is intentionally omitted to prevent loops on page reset
  ]);

  // --- Pagination/Infinite Scroll Data ---
  // Use useMemo for derived data based on filteredDealers and currentPage
  const displayedDealers = useMemo(() => {
    if (useInfiniteScroll) {
      // Slice up to the current "page" for infinite scroll effect
      return filteredDealers.slice(0, currentPage * resultsPerPage);
    } else {
      // Slice only the current page for pagination
      return filteredDealers.slice(
        (currentPage - 1) * resultsPerPage,
        currentPage * resultsPerPage
      );
    }
  }, [filteredDealers, currentPage, resultsPerPage, useInfiniteScroll]);

  // Calculate total pages only if using pagination component
  const totalPages = useMemo(() => {
    if (useInfiniteScroll)
      return Math.ceil(filteredDealers.length / resultsPerPage); // Still useful for knowing when to stop loading
    return Math.ceil(filteredDealers.length / resultsPerPage);
  }, [filteredDealers, resultsPerPage, useInfiniteScroll]);

  // --- Infinite Scroll Handler ---
  const handleScroll = useCallback(() => {
    if (!useInfiniteScroll || isLoadingMore || currentPage >= totalPages)
      return;

    const listEl = listContainerRef.current;
    if (listEl) {
      const { scrollTop, scrollHeight, clientHeight } = listEl;
      // Trigger loading more when user is near the bottom (e.g., 300px threshold)
      if (scrollHeight - scrollTop - clientHeight < 300) {
        console.log("Near bottom, loading next page...");
        setIsLoadingMore(true);
        // Increment page number after a short delay to allow rendering
        setTimeout(() => {
          setCurrentPage((prev) => prev + 1);
          // IMPORTANT: Reset isLoadingMore slightly later OR after data update if async
          // For now, reset it quickly, assuming data update is fast enough
          setIsLoadingMore(false);
        }, 300); // Short delay before allowing next trigger
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

    // Cleanup listener on unmount or when infinite scroll is disabled
    return () => {
      if (list && useInfiniteScroll) {
        list.removeEventListener("scroll", handleScroll);
        console.log("Infinite scroll listener removed.");
      }
    };
  }, [useInfiniteScroll, handleScroll]); // Re-attach if mode changes or handler updates

  // --- Theme and Style Generation ---
  const theme = useMemo(
    () => ({
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor, // Used for charging as default green
        sales: salesColor, // Specific color for sales
        service: serviceColor, // Specific color for service
        // Keep specific service colors easily accessible if needed elsewhere
        skyBlue: salesColor, // Alias for Sales
        redColor: serviceColor, // Alias for Service
        greenColor: accentColor, // Alias for Charging/Accent

        onPrimary: surfaceColor, // Text on primary background
        background: backgroundColor,
        surface: surfaceColor,
        onSurface: onSurfaceColor,
        surfaceVariant: hexToRgba(onSurfaceColor, 0.05), // Lighter variant
        onSurfaceVariant: secondaryColor, // Text on variant surfaces (often grey)
        outline: outlineColor,
        outlineVariant: hexToRgba(outlineColor, 0.7), // Slightly dimmer outline
        error: "#DC2626", // Consistent error red
        onError: "#FFFFFF",
        success: accentColor, // Use accent for success indicators
        // Neutrals for shades of grey/text
        neutral: {
          50: hexToRgba(onSurfaceColor, 0.03),
          100: hexToRgba(onSurfaceColor, 0.06),
          200: hexToRgba(onSurfaceColor, 0.1),
          300: hexToRgba(onSurfaceColor, 0.2),
          400: hexToRgba(onSurfaceColor, 0.35),
          500: hexToRgba(onSurfaceColor, 0.5), // Mid-grey
          600: hexToRgba(onSurfaceColor, 0.65), // Good for secondary text
          700: hexToRgba(onSurfaceColor, 0.8), // Darker text
          800: hexToRgba(onSurfaceColor, 0.9),
          900: onSurfaceColor, // Usually black/darkest grey
        },
        white: "#FFFFFF",
      },
      typography: {
        fontFamily:
          "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        // Define various text styles if needed
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
            "none", // 0
            `0 1px 2px ${hexToRgba(onSurfaceColor, 0.05)}`, // 1 (subtle)
            `0 3px 6px ${hexToRgba(onSurfaceColor, 0.07)}`, // 2 (small elevation)
            `0 6px 12px ${hexToRgba(onSurfaceColor, 0.1)}`, // 3 (medium elevation)
            `0 10px 20px ${hexToRgba(onSurfaceColor, 0.12)}`, // 4 (large elevation)
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
      height: "calc(100dvh - 81px)", // Example: Adjust based on header height if applicable
      maxHeight: "calc(100dvh - 81px)",
      backgroundColor: theme.colors.background,
      overflow: "hidden",
      position: "relative",
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.onSurface,
      ...style, // Allow overriding via Framer props
    };

    const mapContainerStyle: React.CSSProperties = {
      flex: 1, // Takes remaining space
      minHeight: isMobile ? "40%" : "auto", // Ensure map is visible on mobile
      height: isMobile ? "40%" : "100%",
      position: "relative",
      backgroundColor: theme.colors.surfaceVariant,
      order: isMobile ? 1 : 2, // Map below list on mobile
    };

    const sidebarStyle: React.CSSProperties = {
      flex: isMobile ? "1" : `0 0 ${detailPanelWidth}px`, // Fixed width desktop, takes rest mobile
      height: isMobile ? "60%" : "100%",
      display: "flex",
      flexDirection: "column",
      background: theme.colors.surface,
      borderRight: !isMobile ? `1px solid ${theme.colors.outline}` : "none",
      borderTop: isMobile ? `1px solid ${theme.colors.outline}` : "none", // Border top on mobile
      overflow: "hidden", // Important: child list scrolls
      order: isMobile ? 2 : 1, // List below map on mobile
      position: "relative", // For absolute positioning of overlays
      boxShadow: !isMobile ? theme.shadows[1] : "none", // Slight shadow on desktop sidebar
    };

    const mapOverlayStyle: React.CSSProperties = {
      position: "fixed", // Covers viewport
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: hexToRgba(theme.colors.neutral[900], 0.4), // Darker overlay
      backdropFilter: "blur(4px)", // Stronger blur
      zIndex: 39, // Below detail panel (40)
      pointerEvents: mapBackgroundOverlay ? "auto" : "none", // Clickable only when visible
      visibility: mapBackgroundOverlay ? "visible" : "hidden",
      opacity: mapBackgroundOverlay ? 1 : 0,
      transition: "opacity 0.3s ease-out, visibility 0.3s ease-out",
    };

    // --- Search/Filter Area Styles ---
    const topSectionContainerStyle: React.CSSProperties = {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.colors.outline}`,
      flexShrink: 0, // Prevent shrinking
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
      marginBottom: theme.spacing(2), // Space below description
    };

    const locationLabelStyle: React.CSSProperties = {
      fontSize: "12px", // Smaller label
      fontWeight: 600, // Bolder
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: theme.spacing(0.5),
      color: theme.colors.neutral[700], // Darker grey
    };

    const searchInputContainerStyle = (
      isFocused = false
    ): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      height: "44px", // Standard height
      border: `1px solid ${
        isFocused ? theme.colors.primary : theme.colors.outline
      }`,
      borderRadius: theme.shape.medium,
      backgroundColor: theme.colors.surface, // Match surface
      overflow: "hidden",
      transition: "border-color 0.2s, box-shadow 0.2s", // Added box-shadow transition
      boxShadow: isFocused
        ? `0 0 0 2px ${hexToRgba(theme.colors.primary, 0.2)}`
        : "none",
      // Removed margin-bottom, handled by parent gap or padding
    });

    const searchInputStyle: React.CSSProperties = {
      flex: 1,
      border: "none",
      outline: "none",
      padding: `0 ${theme.spacing(1.5)}`, // Horizontal padding
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
      gap: theme.spacing(1.5), // Increased gap between filters
      marginTop: theme.spacing(2), // Space above filters
    };

    const filterCheckboxStyle = (isActive: boolean): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(0.75), // Gap between box and label
      fontSize: "14px",
      fontWeight: 400,
      color: theme.colors.onSurfaceVariant, // Default color
      cursor: "pointer",
      userSelect: "none",
      padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`, // Small padding for hover bg
      borderRadius: theme.shape.small,
      transition: "background-color 0.15s ease-in-out",
      // Hover effect
      ":hover": { backgroundColor: theme.colors.neutral[100] },
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
      flexShrink: 0, // Prevent shrinking
      // Add checkmark SVG inside when active
      content: isActive
        ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${encodeURIComponent(
            theme.colors.onPrimary
          )}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>')`
        : '""',
    });

    // --- Dealer List Styles ---
    const dealerListContainerStyle: React.CSSProperties = {
      flex: 1, // Takes remaining vertical space in sidebar
      overflowY: "auto", // Enables scrolling for the list
      WebkitOverflowScrolling: "touch",
      padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`, // Padding around the list items
    };

    const dealerCardStyleBase = (isSelected: boolean): React.CSSProperties => ({
      background: isSelected
        ? theme.colors.surfaceVariant
        : theme.colors.surface,
      borderRadius: theme.shape.medium,
      padding: theme.spacing(1.5), // 12px padding inside card
      cursor: "pointer",
      marginBottom: theme.spacing(1.5), // **** INCREASED MARGIN **** (12px)
      border: `1px solid ${isSelected ? theme.colors.primary : "transparent"}`, // Only border when selected
      borderLeft: `3px solid ${
        isSelected ? theme.colors.primary : "transparent"
      }`, // Accent border left
      boxShadow: isSelected ? theme.shadows[2] : theme.shadows[1], // Subtle shadow always, more when selected
      transition:
        "background-color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s",
      position: "relative", // For potential absolute elements inside
      // Remove transform from base, handle in motion component props
    });

    const dealerCardContentStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start", // Align items to top for better text flow
      justifyContent: "space-between",
      width: "100%",
      gap: theme.spacing(1.5), // Gap between text and arrow
    };

    const dealerCardTextWrapStyle: React.CSSProperties = {
      flex: 1,
      minWidth: 0, // Prevent overflow issues
    };

    const dealerCardTitleStyle: React.CSSProperties = {
      margin: `0 0 ${theme.spacing(0.5)} 0`, // Reduced bottom margin
      fontSize: "16px",
      fontWeight: 600, // Bolder title
      color: theme.colors.onSurface,
      lineHeight: 1.4, // Slightly increased line height
    };

    const dealerCardAddressStyle: React.CSSProperties = {
      margin: `0 0 ${theme.spacing(1)} 0`, // Margin below address
      fontSize: "14px",
      color: theme.colors.neutral[600], // Darker grey for address
      lineHeight: 1.45, // Better line height for multiline addresses
    };

    // Service indicators wrapper (add this if not already defined)
    const dealerCardServicesStyle: React.CSSProperties = {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1), // Add margin below services if distance is present
    };

    // Style for individual service tags (add this if not already defined)
    const dealerCardServiceTagStyle = (
      bgColor: string,
      textColor: string,
      bdColor: string
    ): React.CSSProperties => ({
      fontSize: "10px",
      padding: "3px 6px", // Slightly adjust padding
      backgroundColor: bgColor,
      color: textColor,
      borderRadius: "3px", // Slightly more rounded
      textTransform: "uppercase",
      fontWeight: 700,
      letterSpacing: "0.5px", // More spacing
      outline: `1px solid ${bdColor}`,
      outlineOffset: "-1px",
    });

    const dealerCardDistanceStyle: React.CSSProperties = {
      margin: `${theme.spacing(1)} 0 0 0`, // Consistent top margin
      fontSize: "13px",
      fontWeight: 500,
      color: theme.colors.primary,
    };

    const dealerCardArrowStyle: React.CSSProperties = {
      color: theme.colors.onSurfaceVariant,
      display: "flex",
      alignItems: "center",
      marginTop: theme.spacing(0.5), // Align arrow slightly lower
      flexShrink: 0, // Prevent arrow shrinking
    };

    // --- Pagination Styles --- (Keep if PaginationControls component is used)
    const paginationContainerStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(1.5),
      borderTop: `1px solid ${theme.colors.outline}`,
      backgroundColor: theme.colors.surface,
      flexShrink: 0, // Prevent shrinking
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

    // --- Loading, Error, Placeholder Styles --- (Simplified, assuming defined in Components.tsx)
    const loadingOverlayStyle = {
      /* Defined in Components.tsx */
    };
    const spinnerStyle = (rotation) => ({
      /* Defined in Components.tsx */
    });
    const loadingTextStyle = {
      /* Defined in Components.tsx */
    };
    const errorOverlayStyle = {
      /* Defined in Components.tsx */
    };
    const errorIconStyle = {
      /* Defined in Components.tsx */
    }; // Pass theme.colors.error
    const errorTextStyle = {
      /* Defined in Components.tsx */
    };
    const errorButtonStyle = {
      /* Defined in Components.tsx */
    }; // Pass theme colors
    const mapPlaceholderStyle = {
      /* Defined in Components.tsx */
    };
    const mapPlaceholderTextStyle = {
      /* Defined in Components.tsx */
    };
    const mapPlaceholderSubTextStyle = {
      /* Defined in Components.tsx */
    };

    // --- Button Styles ---
    const textButtonStyle = (isDisabled = false): React.CSSProperties => ({
      // Style for text-based buttons like "Use Location"
      backgroundColor: "transparent",
      color: isDisabled ? theme.colors.neutral[400] : theme.colors.primary,
      border: "none",
      borderRadius: theme.shape.medium,
      padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`, // Adjust padding as needed
      fontSize: "14px",
      fontWeight: 500,
      cursor: isDisabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      transition: "background-color 0.2s, color 0.2s",
      opacity: isDisabled ? 0.6 : 1,
    });

    // --- Detail Panel Styles (Extracted for clarity) ---
    const detailSectionTitleStyle: React.CSSProperties = {
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.72px",
      color: theme.colors.neutral[700],
      margin: `0 0 ${theme.spacing(1.25)} 0`, // 10px bottom margin
    };
    const detailParagraphStyle: React.CSSProperties = {
      fontSize: "16px",
      lineHeight: 1.6, // Increased line height
      color: theme.colors.neutral[700], // Slightly darker text
      margin: `0 0 ${theme.spacing(1)} 0`,
    };
    const detailDistanceStyle: React.CSSProperties = {
      fontSize: "14px",
      color: theme.colors.neutral[500],
      margin: `${theme.spacing(1)} 0 0 0`, // 8px top margin
    };
    const detailContactItemStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1.25), // 10px gap
    };
    const detailLinkStyle: React.CSSProperties = {
      color: theme.colors.primary, // Use primary color for links
      textDecoration: "none",
      fontSize: "16px",
      wordBreak: "break-word", // Break long links
      ":hover": { textDecoration: "underline" },
    };
    const detailHoursGridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "100px 1fr", // Adjusted column width
      gap: theme.spacing(1),
      fontSize: "14px",
    };
    const detailHoursDayStyle: React.CSSProperties = {
      /* Base style in panel */
    };
    const detailHoursTimeStyle: React.CSSProperties = {
      /* Base style in panel */
    };
    const detailServicesListStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing(1), // 8px gap
    };
    const detailServiceItemStyle: React.CSSProperties = {
      fontSize: "16px",
      lineHeight: 1.4,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1), // 8px gap
    };
    const detailActionsFooterStyle: React.CSSProperties = {
      display: "flex",
      padding: theme.spacing(2),
      borderTop: `1px solid ${theme.colors.outline}`,
      gap: theme.spacing(1.5), // 12px gap
      backgroundColor: theme.colors.surface, // Ensure bg color
      flexShrink: 0, // Prevent shrinking
    };
    const detailActionButtonStyle: React.CSSProperties = {
      flex: 1,
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`, // 12px 16px
      backgroundColor: theme.colors.neutral[800], // Darker button background
      color: theme.colors.white,
      fontSize: "16px",
      fontWeight: 600,
      textDecoration: "none",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center", // Center content
      gap: theme.spacing(1), // Gap between text and icon
      borderRadius: theme.shape.medium,
      transition: "filter 0.2s ease-out",
    };

    // Dummy hover handlers if needed by components expecting them
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
      dealerCardServiceTagStyle, // Added service styles
      dealerCardDistanceStyle,
      dealerCardArrowStyle,
      paginationContainerStyle,
      paginationButtonStyleBase,
      paginationInfoStyle,
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
      textButtonStyle,
      handleLinkEnter,
      handleLinkLeave,
      detailPanelWidth,
      // Detail panel specific styles
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
    // No need for totalPages here unless a style depends on it directly
  ]);

  // --- Geocoding Handler ---
  const handleGeocodeSearch = useCallback(
    async (query: string) => {
      if (!query) {
        setSearchLocation(null);
        return;
      }
      if (RenderTarget.current() === RenderTarget.canvas) return; // No geocoding on canvas
      setSearchLocation(null); // Clear previous search location immediately
      // setIsLoading(true); // Use combined loading state instead?
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
            setActiveMapCenter([lng, lat]); // Center map on result
            setActiveMapZoom(13); // Zoom closer on search
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
                setActiveMapCenter(coords); // Center map on result
                setActiveMapZoom(13); // Zoom closer
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
      } finally {
        // Maybe set loading false here if using separate loading state
      }
    },
    [mapProvider, mapboxAccessToken, userLocation, googleApiKey]
  ); // Dependencies

  // --- Event Handlers ---
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query); // Update query state immediately
    handleGeocodeSearch(query); // Perform geocoding
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchLocation(null); // Clear the specific search location coordinates
    setComponentError(null); // Clear any previous search errors
    // Optionally reset map view to user location or default
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
      setActiveMapCenter([dealer.coordinates.lng, dealer.coordinates.lat]); // Pan map to dealer
      setActiveMapZoom(14); // Zoom in slightly on selected dealer
      setIsDetailOpen(true);
      setMapBackgroundOverlay(true); // Show overlay
      if (isMobile) {
        setDrawerExpanded(false); // Start collapsed on mobile
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
  ); // Dependency: isMobile for drawer behavior

  const handleMapClick = useCallback(() => {
    // Close detail panel when clicking map background (if open)
    if (isDetailOpen) {
      console.log("Map click detected, closing detail panel.");
      setIsDetailOpen(false);
      setMapBackgroundOverlay(false);
      setSelectedDealer(null); // Deselect dealer on map click
    }
  }, [isDetailOpen]); // Dependency: isDetailOpen

  const handleUseLocation = useCallback(() => {
    console.log("Attempting to use user location...");
    setComponentError(null); // Clear previous errors
    handleClearSearch(); // Clear any text search
    getUserLocation(); // Trigger geolocation hook
    // Map panning will happen in the effect watching userLocation
  }, [getUserLocation]); // Dependency: getUserLocation

  const handlePageChange = (page: number) => {
    // For pagination component
    if (!useInfiniteScroll) {
      console.log(`Changing page to: ${page}`);
      setCurrentPage(page);
      listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" }); // Scroll list to top
    }
  };

  const handleDetailClose = useCallback(() => {
    console.log("Closing detail panel.");
    setIsDetailOpen(false);
    setMapBackgroundOverlay(false); // Hide overlay
    setSelectedDealer(null); // Deselect dealer when panel closes
  }, []);

  const handleToggleDrawerExpanded = useCallback((expanded: boolean) => {
    console.log(`Toggling mobile drawer expanded state to: ${expanded}`);
    setDrawerExpanded(expanded);
  }, []);

  // --- Render Conditionals ---
  const apiKeyMissing =
    (mapProvider === "mapbox" && !mapboxAccessToken) ||
    (mapProvider === "google" && !googleApiKey);
  const showMapPlaceholder =
    RenderTarget.current() === RenderTarget.canvas || apiKeyMissing;
  const actualMapProvider = showMapPlaceholder ? "none" : mapProvider; // Prevent map render if placeholder shown

  // --- Final Render ---
  return (
    <div style={styles.containerStyle}>
      {/* Overlays - Render on top */}
      {isLocatingCombined && !componentError && (
        <LoadingOverlay
          theme={theme}
          styles={styles}
          loadingText={loadingText}
          spinnerRotation={spinnerRotation}
        />
      )}
      {componentError &&
        !isLocatingCombined && ( // Show error only if not loading
          <ErrorDisplay
            message={componentError}
            onRetry={dealersError ? refetchDealers : undefined} // Allow refetch only for dealer data errors
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
              locationError={geoError} // Pass geoError for potential display in SearchBar
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
          {filteredDealers.length === 0 && !isDealersLoading ? (
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
                  styles={styles} // Pass the generated styles down
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
            googleApiKey={googleApiKey} // Pass even if mapbox, for API state hook
            center={activeMapCenter}
            zoom={activeMapZoom}
            dealers={filteredDealers} // Pass all filtered dealers for markers
            selectedDealer={selectedDealer}
            userLocation={userLocation}
            searchLocation={searchLocation}
            onMarkerClick={handleDealerSelect}
            onMapClick={handleMapClick}
            theme={theme}
            distanceUnit={distanceUnit}
            mapboxMapStyleUrl={mapboxMapStyleUrl}
            googleMapStyleId={googleMapStyleId}
            // Map controls are handled internally by MapWrapper based on its props now
            hideControls={false} // Example: explicitly show controls
            navigationControl={true}
            attributionControl={true}
          />
        )}
      </div>

      {/* Detail Panel (Rendered last for higher z-index conceptually) */}
      <DealerDetailPanel
        dealer={selectedDealer}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        distanceUnit={distanceUnit}
        isMobile={isMobile}
        theme={theme}
        styles={styles} // Pass generated styles
        contactLabel={contactLabel}
        hoursLabel={hoursLabel}
        servicesLabel={servicesLabel}
        getDirectionsText={getDirectionsText}
        mapProvider={actualMapProvider} // Use actual provider
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
  }, // Enabled shadows by default
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
