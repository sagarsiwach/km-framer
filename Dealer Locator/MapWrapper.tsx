// MapWrapper.tsx
import React, { useRef, useEffect, memo, useCallback } from "react";
import { RenderTarget } from "framer";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl, { Marker, Popup } from "mapbox-gl"; // Import specific types
import {
  useDealerData,
  useGeolocation,
  useMapApiState,
} from "https://framer.com/m/Hooks-ZmUS.js@2ecUl320qKIztH19IQLd";

// IMPORTANT: Make sure Mapbox CSS is added via CDN in Framer Site Settings -> Head Content:
// <link href='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css' rel='stylesheet' />
// Or import it if your setup allows: import 'mapbox-gl/dist/mapbox-gl.css';

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

// --- Custom MapMarker Component ---
const CustomMapMarker = ({ dealer, isSelected, onClick, theme }) => {
  // Check if dealer has charging service
  const hasCharging = dealer.services?.some((s) =>
    s.toLowerCase().includes("charging")
  );

  // Generate marker colors based on status
  const primaryColor = isSelected
    ? theme.colors.primary
    : theme.colors.neutral[700];
  const secondaryColor = hasCharging
    ? theme.colors.success
    : theme.colors.neutral[500];

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        width: "34px",
        height: "48px",
        position: "relative",
        transform: isSelected ? "scale(1.15)" : "scale(1)",
        transition: "transform 0.2s ease-out",
        transformOrigin: "bottom center",
        filter: isSelected ? `drop-shadow(0 3px 3px rgba(0,0,0,0.25))` : "none",
      }}
    >
      {/* Pin base */}
      <svg
        width="34"
        height="48"
        viewBox="0 0 34 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <path
          d="M17 0C7.611 0 0 7.597 0 16.966C0 27.447 14.976 46.642 15.618 47.308C16.302 48 17.698 48 18.382 47.308C19.024 46.642 34 27.447 34 16.966C34 7.597 26.389 0 17 0Z"
          fill={primaryColor}
        />
      </svg>

      {/* Central dot/icon */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: theme.colors.white,
        }}
      ></div>

      {/* Charging indicator if available */}
      {hasCharging && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: secondaryColor,
            border: `1px solid ${theme.colors.white}`,
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: secondaryColor,
            }}
          />
        </div>
      )}
    </div>
  );
};

// Define the props for the MapWrapper component
interface MapWrapperProps {
  mapProvider: MapProvider | "none"; // Allow "none" for cases where map shouldn't render
  googleApiKey?: string; // Keep for potential future use
  mapboxAccessToken?: string; // Required for Mapbox
  center: Coordinates | [number, number]; // Current map center [lng, lat] for mapbox
  zoom: number; // Current map zoom level
  dealers: Dealer[]; // Array of dealers to display markers for
  selectedDealer: Dealer | null; // Currently selected dealer for highlighting/popup
  userLocation: Location; // User's current location (optional)
  searchLocation: Location; // Location result from search (optional)
  onMarkerClick: (dealer: Dealer) => void; // Callback when a marker is clicked
  onMapClick: () => void; // Callback when the map background is clicked
  theme: any; // Theme object passed down for styling markers/popups
  distanceUnit: "km" | "miles"; // Unit for displaying distance in popups
  googleMapStyleId?: string | null; // Keep for potential future use
  mapboxMapStyleUrl?: string; // URL for the Mapbox style (e.g., light-v11)
  style?: React.CSSProperties; // General style prop from Framer
}

// --- Popup Content Creation Helper (Minimalist Style) ---
const createMapboxPopupContent = (
  dealer: Dealer,
  theme: any,
  distanceUnit: string
): string => `
 <div style="font-family: ${
   theme.typography.fontFamily || "Geist, sans-serif"
 }; font-size: 12px; color: ${
  theme.colors.onSurface
}; max-width: 180px; padding: 8px 12px;">
    <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 500; line-height: 1.3;">${
      dealer.name
    }</h3>
    <p style="margin: 0; font-size: 12px; color: ${
      theme.colors.neutral[600]
    }; line-height: 1.3;">${dealer.address.formatted}</p>
     ${
       dealer.distance !== undefined && dealer.distance >= 0
         ? `<p style="margin: 4px 0 0; font-size: 12px; color: ${theme.colors.neutral[600]}; font-weight: 400;">${dealer.distance} ${distanceUnit}</p>`
         : ""
     }
  </div>`;

// --- Main Map Component ---
const MapWrapper: React.FC<MapWrapperProps> = ({
  mapProvider, // Should be 'mapbox' for this focused version
  googleApiKey,
  mapboxAccessToken,
  center, // Expected as [lng, lat] for Mapbox
  zoom,
  dealers,
  selectedDealer,
  userLocation,
  searchLocation,
  onMarkerClick,
  onMapClick,
  theme,
  distanceUnit,
  googleMapStyleId, // Unused in Mapbox focus
  mapboxMapStyleUrl = "mapbox://styles/mapbox/light-v11", // Default minimal style
  style,
}) => {
  // Refs for map container and Mapbox instances
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapboxMapRef = useRef<mapboxgl.Map | null>(null);
  const mapboxMarkersRef = useRef<{ [id: string]: Marker }>({}); // Store markers by dealer ID
  const mapboxPopupRef = useRef<Popup | null>(null);
  const isRenderedRef = useRef(false); // Track if map has rendered once
  const mapMarkerElsRef = useRef<{ [id: string]: HTMLDivElement }>({});

  const isMapbox = mapProvider === "mapbox";

  // --- Cleanup function ---
  const cleanupMap = useCallback(() => {
    console.log("Cleaning up Mapbox instance...");
    // Close and remove popup
    if (mapboxPopupRef.current) {
      mapboxPopupRef.current.remove();
      mapboxPopupRef.current = null;
    }
    // Remove markers
    Object.values(mapboxMarkersRef.current).forEach((marker) =>
      marker.remove()
    );
    mapboxMarkersRef.current = {};

    // Remove map instance
    if (mapboxMapRef.current) {
      try {
        // Unbind events manually if needed, although remove() should handle most
        mapboxMapRef.current.off("click", handleMapInteraction);
        mapboxMapRef.current.remove();
      } catch (e) {
        console.warn("Mapbox cleanup error:", e);
      } finally {
        mapboxMapRef.current = null;
      }
    }
    isRenderedRef.current = false;
    console.log("Mapbox cleanup complete.");
  }, []); // No dependencies needed

  // --- Map Interaction Handler ---
  const handleMapInteraction = useCallback(
    (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      // Check if the click occurred on a feature layer (like default POIs if style shows them)
      // If you add custom layers (like for markers), include them here.
      const features = mapboxMapRef.current?.queryRenderedFeatures(e.point, {
        layers: [], // Specify layers if you use symbol layers for markers instead of DOM markers
      });

      // If click wasn't on a known feature (or marker which stops propagation below),
      // trigger the onMapClick callback (e.g., to close detail panel)
      if (!features || features.length === 0) {
        console.log("Map background clicked");
        onMapClick();
        mapboxPopupRef.current?.remove(); // Close popup on map click
      }
    },
    [onMapClick]
  );

  // --- Mapbox Initialization Effect ---
  useEffect(() => {
    // Ensure this runs only for Mapbox, not on canvas, and container exists
    if (
      !isMapbox ||
      RenderTarget.current() === RenderTarget.canvas ||
      !mapContainerRef.current ||
      !mapboxAccessToken
    ) {
      console.log("Mapbox initialization skipped:", {
        isMapbox,
        isCanvas: RenderTarget.current() === RenderTarget.canvas,
        hasToken: !!mapboxAccessToken,
      });
      return cleanupMap; // Ensure cleanup if conditions change
    }

    // Prevent re-initialization if map already exists
    if (mapboxMapRef.current) {
      console.log("Mapbox already initialized.");
      return;
    }

    console.log("Initializing Mapbox Map...");
    mapboxgl.accessToken = mapboxAccessToken;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current!, // Non-null assertion okay after check
        style: mapboxMapStyleUrl,
        center: center as [number, number], // Assert tuple type
        zoom: zoom,
        maxZoom: 18,
        minZoom: 4,
        renderWorldCopies: false, // Avoid repeating world at low zooms
        attributionControl: false, // Remove default Mapbox attribution if needed
      });

      // Add minimal controls
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }), // No compass
        "top-right"
      );
      // Add attribution control separately for customization if desired
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      // Store map instance
      mapboxMapRef.current = map;

      // Add map click listener after map loads
      map.on("load", () => {
        console.log("Mapbox map loaded.");
        isRenderedRef.current = true;
        // Add click listener *after* load
        map.on("click", handleMapInteraction);
      });

      // Error handling
      map.on("error", (e) => {
        console.error("Mapbox GL Error:", e.error?.message || e);
        // Handle map loading errors (e.g., invalid style URL, token issues)
      });
    } catch (error) {
      console.error("Failed to initialize Mapbox Map:", error);
      // Set an error state in the parent component if needed
    }

    // Return cleanup function to run on unmount or when dependencies change
    return cleanupMap;
  }, [
    isMapbox,
    mapboxAccessToken,
    mapboxMapStyleUrl,
    // Center/Zoom are handled in separate effects to avoid re-init
    cleanupMap, // Include memoized cleanup function
    handleMapInteraction, // Include memoized handler
  ]);

  // --- Mapbox Marker Update Effect ---
  useEffect(() => {
    // Ensure map instance exists and is ready
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) {
      console.log("Skipping marker update: Map not ready or not Mapbox.");
      return;
    }

    console.log(`Updating ${dealers.length} markers...`);
    const currentMap = mapboxMapRef.current;
    const newMarkers = {}; // Keep track of markers added in this update

    // 1. Add or Update Markers
    dealers.forEach((dealer) => {
      const dealerId = dealer.id;
      const existingMarker = mapboxMarkersRef.current[dealerId];
      const isSelected = selectedDealer?.id === dealerId;

      // Create or update marker element using our custom component
      const markerEl = document.createElement("div");
      markerEl.className = "dealer-marker";

      // Instead of directly rendering React component,
      // create a DOM structure that mimics our custom marker
      const hasCharging = dealer.services?.some((s) =>
        s.toLowerCase().includes("charging")
      );

      // Set up SVG and styling inline for the marker
      markerEl.innerHTML = `
        <div style="
          cursor: pointer;
          width: 34px;
          height: 48px;
          position: relative;
          transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
          transition: transform 0.2s ease-out;
          transform-origin: bottom center;
          filter: ${
            isSelected ? "drop-shadow(0 3px 3px rgba(0,0,0,0.25))" : "none"
          };
        ">
          <svg 
            width="34" 
            height="48" 
            viewBox="0 0 34 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style="position: absolute; top: 0; left: 0;">
            <path 
              d="M17 0C7.611 0 0 7.597 0 16.966C0 27.447 14.976 46.642 15.618 47.308C16.302 48 17.698 48 18.382 47.308C19.024 46.642 34 27.447 34 16.966C34 7.597 26.389 0 17 0Z" 
              fill="${
                isSelected ? theme.colors.primary : theme.colors.neutral[700]
              }"
            />
          </svg>
          <div style="
            position: absolute; 
            top: 10px; 
            left: 10px; 
            width: 14px; 
            height: 14px; 
            border-radius: 50%; 
            background-color: white;">
          </div>
          ${
            hasCharging
              ? `
            <div style="
              position: absolute;
              top: 5px;
              right: 5px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background-color: ${theme.colors.success};
              border: 1px solid white;">
              <div class="pulse-animation" style="
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: ${theme.colors.success};
                animation: pulse 2s infinite ease-in-out;
              "></div>
            </div>
          `
              : ""
          }
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.7; }
          }
        </style>
      `;

      if (existingMarker) {
        // Replace existing marker element
        existingMarker.getElement().replaceWith(markerEl);

        // Set up event listener for marker click
        markerEl.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClick(dealer);
        });

        // Keep existing marker instance with updated element
        newMarkers[dealerId] = existingMarker;
        delete mapboxMarkersRef.current[dealerId];
      } else {
        // Create new marker
        try {
          const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([dealer.coordinates.lng, dealer.coordinates.lat])
            .addTo(currentMap);

          // Add click listener
          markerEl.addEventListener("click", (e) => {
            e.stopPropagation();
            onMarkerClick(dealer);
          });

          newMarkers[dealerId] = marker;
        } catch (error) {
          console.error("Failed to create Mapbox Marker:", error, dealer);
        }
      }
    });

    // Remove old markers
    Object.keys(mapboxMarkersRef.current).forEach((oldDealerId) => {
      mapboxMarkersRef.current[oldDealerId].remove();
    });

    // Update marker reference
    mapboxMarkersRef.current = newMarkers;
  }, [isMapbox, dealers, selectedDealer, onMarkerClick, theme]);

  // --- Mapbox Popup Update Effect ---
  useEffect(() => {
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) return;
    const currentMap = mapboxMapRef.current;

    // Remove existing popup if dealer deselected or changes
    if (mapboxPopupRef.current) {
      mapboxPopupRef.current.remove();
      mapboxPopupRef.current = null;
    }

    // If a dealer is selected, create and show a new popup
    if (selectedDealer) {
      console.log(`Showing popup for: ${selectedDealer.name}`);
      try {
        mapboxPopupRef.current = new mapboxgl.Popup({
          offset: 25, // Offset from marker center
          closeButton: false,
          closeOnClick: false, // Prevent closing when map is clicked (handled elsewhere)
          maxWidth: "240px",
          className: "dealer-popup", // For custom styling
        })
          .setLngLat([
            selectedDealer.coordinates.lng,
            selectedDealer.coordinates.lat,
          ])
          .setHTML(
            createEnhancedPopupContent(selectedDealer, theme, distanceUnit) // Use enhanced popup content
          )
          .addTo(currentMap);
      } catch (error) {
        console.error("Failed to create Mapbox Popup:", error);
      }
    }
  }, [isMapbox, selectedDealer, theme, distanceUnit]);

  // --- Map Panning & Zooming Effects ---

  // Effect to pan map to searchLocation or userLocation when they change
  useEffect(() => {
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) return;

    const targetLocation = searchLocation || userLocation;
    if (!targetLocation) return;

    console.log("Panning map to target location:", targetLocation);
    const options: mapboxgl.FlyToOptions = {
      // Use FlyTo for smoother transition
      center: [targetLocation.lng, targetLocation.lat],
      zoom: searchLocation ? 13 : 12, // Zoom closer for search results
      duration: 1000, // Animation duration in ms
      essential: true, // Ensures animation runs
    };
    mapboxMapRef.current.flyTo(options);
  }, [isMapbox, searchLocation, userLocation]); // Depend on location state

  // Effect to update map center/zoom if props change externally (less common)
  useEffect(() => {
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) return;

    const currentMap = mapboxMapRef.current;
    const targetCenter = center as [number, number]; // Expect [lng, lat]

    // Check if center differs significantly
    const currentCenter = currentMap.getCenter();
    const centerDiff =
      Math.abs(currentCenter.lng - targetCenter[0]) +
      Math.abs(currentCenter.lat - targetCenter[1]);

    if (centerDiff > 0.0001) {
      console.log("Updating map center from props:", targetCenter);
      currentMap.panTo(targetCenter, { duration: 300, essential: true });
    }

    // Check if zoom differs
    if (Math.abs(currentMap.getZoom() - zoom) > 0.1) {
      console.log("Updating map zoom from props:", zoom);
      currentMap.setZoom(zoom);
    }
  }, [isMapbox, center, zoom]); // Depend on external center/zoom props

  // --- User location marker ---
  useEffect(() => {
    if (
      !mapboxMapRef.current ||
      !userLocation ||
      !isRenderedRef.current ||
      !isMapbox
    )
      return;

    // Create a unique marker for user location
    const userMarkerEl = document.createElement("div");
    userMarkerEl.className = "user-location-marker";
    userMarkerEl.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${theme.colors.primary};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
      ">
        <div style="
          position: absolute;
          top: -3px;
          left: -3px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: transparent;
          border: 2px solid ${theme.colors.primary};
          opacity: 0.5;
          animation: ripple 2s infinite ease-out;
        "></div>
      </div>
      <style>
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `;

    // Remove existing user marker if any
    if (mapboxMarkersRef.current["user-location"]) {
      mapboxMarkersRef.current["user-location"].remove();
    }

    // Add new user marker
    const userMarker = new mapboxgl.Marker(userMarkerEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapboxMapRef.current);

    // Store for cleanup
    mapboxMarkersRef.current["user-location"] = userMarker;

    return () => {
      // Will be cleaned up in the main cleanup function
    };
  }, [isMapbox, userLocation, theme]);

  // --- Render the Map Container ---
  // This div is where Mapbox GL JS will render the map.
  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.surfaceVariant, // Background while map loads
        overflow: "hidden",
        position: "relative", // Ensure container has position context
        ...style, // Apply Framer's style prop
      }}
    />
  );
};

export default memo(MapWrapper); // Memoize to prevent unnecessary re-renders
