// MapWrapper.tsx
// Refined map update logic and added logging.
import React, { useRef, useEffect, memo, useCallback, useState } from "react";
import { RenderTarget } from "framer";
import mapboxgl, { Marker, LngLatLike, LngLatBoundsLike, Map } from "mapbox-gl";

// Import types and utility functions from Lib.tsx (NO VERSION)
import {
  type Dealer,
  type Location,
  type Coordinates,
  type MapProvider,
  hexToRgba,
  isValidCoordinates,
  MAP_MARKER_SVG_BASE,
  MAX_ZOOM,
  MIN_ZOOM,
  DEFAULT_CENTER_MAPBOX,
  DEFAULT_ZOOM,
} from "https://framer.com/m/Lib-8AS5.js";

// --- Helper Functions ---
const injectGlobalStyle = (id: string, css: string) => {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
};
const getMarkerColor = (
  dealer: Dealer,
  isSelected: boolean,
  theme: any
): string => {
  const services = dealer.services?.map((s) => s.toLowerCase()) || [];
  const hasStore = services.includes("sales") || services.includes("store");
  const hasService =
    services.includes("service") || services.includes("repair");
  const hasCharging = services.includes("charging");
  const salesColor = theme.colors.sales || "#0284C7";
  const serviceColor = theme.colors.service || "#DC2626";
  const chargingColor = theme.colors.accent || "#22C55E";
  const defaultColor = theme.colors.neutral?.[700] || "#4B5563";
  const selectedColor = theme.colors.primary || "#111827";
  if (isSelected) return selectedColor;
  if (hasStore) return salesColor;
  if (hasService) return serviceColor;
  if (hasCharging) return chargingColor;
  return defaultColor;
};
const getMarkerSvg = (
  dealer: Dealer,
  isSelected: boolean,
  theme: any
): string => {
  const markerColor = getMarkerColor(dealer, isSelected, theme);
  // Updated SVG structure slightly for better centering/scaling visual
  return `
        <div style="cursor: pointer; width: 32px; height: 32px; display: flex; justify-content: center; align-items: flex-end; transform: ${
          isSelected ? "scale(1.2)" : "scale(1)"
        }; transform-origin: center bottom; transition: transform 0.2s ease-out; filter: ${
    isSelected
      ? `drop-shadow(0 4px 6px rgba(0,0,0,0.25))`
      : `drop-shadow(0 2px 3px rgba(0,0,0,0.15))`
  };">
            <div style="color: ${markerColor}; width: 100%; height: 100%; position: relative;">
                ${MAP_MARKER_SVG_BASE}
            </div>
        </div>
    `;
};

interface MapWrapperProps {
  mapProvider: MapProvider;
  mapboxAccessToken?: string;
  googleApiKey?: string; // Added for completeness, though not used in this Mapbox version
  initialCenter: LngLatLike | Coordinates; // Accept both formats
  initialZoom: number;
  dealers: Dealer[];
  selectedDealer: Dealer | null;
  userLocation: Location;
  // Ref containing the desired map state update
  mapUpdateTrigger: React.MutableRefObject<{
    center?: Location | null; // null indicates reset
    zoom?: number;
    type: "fly" | "jump";
  } | null>;
  onMarkerClick: (dealer: Dealer) => void; // Should be memoized in parent
  onMapClick: () => void; // Should be memoized in parent
  onMarkersReady?: () => void; // Should be memoized in parent
  theme: any;
  distanceUnit: string;
  mapboxMapStyleUrl?: string;
  style?: React.CSSProperties;
}

// Separate component to handle Mapbox logic
const MapboxMap: React.FC<MapWrapperProps> = ({
  mapboxAccessToken,
  initialCenter,
  initialZoom,
  dealers = [],
  selectedDealer,
  userLocation,
  mapUpdateTrigger,
  onMarkerClick,
  onMapClick,
  onMarkersReady,
  theme,
  mapboxMapStyleUrl = "mapbox://styles/mapbox/light-v11",
  style,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapboxMapRef = useRef<Map | null>(null);
  const mapboxDealerMarkersRef = useRef<{ [key: string]: Marker }>({});
  const mapboxUserMarkerRef = useRef<Marker | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const markersReadyFiredRef = useRef<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const isAnimatingRef = useRef<boolean>(false); // Flag to track if map is currently moving

  // --- CSS Injection ---
  useEffect(() => {
    // Inject Mapbox GL CSS
    if (!document.getElementById("mapbox-gl-css")) {
      const link = document.createElement("link");
      link.id = "mapbox-gl-css";
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css"; // Use a specific version
      document.head.appendChild(link);
    }
    // Inject overrides and animations
    injectGlobalStyle(
      "mapbox-controls-override",
      `.mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo, .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left { display: none !important; }`
    );
    injectGlobalStyle(
      "ripple-keyframes",
      `@keyframes map-ripple { 0% { transform: scale(0.8); opacity: 0.7; } 100% { transform: scale(2.5); opacity: 0; } }`
    );
  }, []); // Run once on mount

  // --- Map Cleanup ---
  const cleanupMap = useCallback(() => {
    console.log("MapWrapper: Cleaning up Mapbox instance...");
    mapInitializedRef.current = false;
    markersReadyFiredRef.current = false;
    setIsMapLoaded(false);
    isAnimatingRef.current = false;
    // Remove markers safely
    Object.values(mapboxDealerMarkersRef.current).forEach((marker) => {
      try {
        marker.remove();
      } catch (e) {
        /* ignore errors during cleanup */
      }
    });
    mapboxDealerMarkersRef.current = {};
    if (mapboxUserMarkerRef.current) {
      try {
        mapboxUserMarkerRef.current.remove();
      } catch (e) {
        /* ignore errors */
      }
      mapboxUserMarkerRef.current = null;
    }
    // Remove map instance safely
    if (mapboxMapRef.current) {
      try {
        // Remove event listeners manually before removing map instance
        mapboxMapRef.current.off("load", () => {});
        mapboxMapRef.current.off("click", () => {});
        mapboxMapRef.current.off("movestart", () => {});
        mapboxMapRef.current.off("moveend", () => {});
        mapboxMapRef.current.off("zoomstart", () => {});
        mapboxMapRef.current.off("zoomend", () => {});
        mapboxMapRef.current.off("rotatestart", () => {});
        mapboxMapRef.current.off("rotateend", () => {});
        mapboxMapRef.current.off("dragstart", () => {});
        mapboxMapRef.current.off("dragend", () => {});
        mapboxMapRef.current.off("error", () => {});

        mapboxMapRef.current.remove();
      } catch (e) {
        console.warn("Mapbox cleanup error:", e);
      } finally {
        mapboxMapRef.current = null;
      }
    }
    console.log("MapWrapper: Mapbox cleanup complete.");
  }, []);

  // --- Map Initialization ---
  useEffect(() => {
    if (
      mapInitializedRef.current || // Already initialized
      RenderTarget.current() === RenderTarget.canvas // Skip on canvas
    ) {
      return;
    }

    const container = mapContainerRef.current;
    if (!container || !mapboxAccessToken) {
      console.warn(
        "MapWrapper: Map container or Mapbox token missing. Cannot initialize."
      );
      // Signal readiness immediately if map cannot load, so parent loader hides
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function"
      ) {
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }
      return;
    }

    let rafId: number | null = null;
    // Function to initialize map only when container has dimensions
    const initMapWhenReady = () => {
      if (!container || mapInitializedRef.current) {
        if (rafId) cancelAnimationFrame(rafId);
        return;
      }

      const { clientWidth, clientHeight } = container;
      if (clientWidth > 0 && clientHeight > 0) {
        console.log(
          `%cMapWrapper: Initializing Mapbox map (Size: ${clientWidth}x${clientHeight})...`,
          "color: green;"
        );
        mapboxgl.accessToken = mapboxAccessToken;
        try {
          const map = new mapboxgl.Map({
            container: container,
            style: mapboxMapStyleUrl,
            center: Array.isArray(initialCenter)
              ? initialCenter // [lng, lat]
              : [initialCenter.lng, initialCenter.lat], // Convert {lat, lng}
            zoom: initialZoom,
            maxZoom: MAX_ZOOM,
            minZoom: MIN_ZOOM,
            renderWorldCopies: false, // Don't repeat world
            attributionControl: false, // Hidden by CSS override
            logoPosition: "bottom-left", // Hidden by CSS override
          });

          // --- Attach Event Listeners ONCE after map loads ---
          map.once("load", () => {
            console.log(
              "%cMapWrapper: Mapbox map 'load' event fired.",
              "color: green; font-weight: bold;"
            );
            mapboxMapRef.current = map;
            mapInitializedRef.current = true;
            setIsMapLoaded(true); // Signal map instance is ready

            // Click listener for closing detail panel
            map.on("click", (e) => {
              // Check if click was directly on map canvas vs marker/popup
              const target = e.originalEvent.target as HTMLElement;
              if (target && target.classList.contains("mapboxgl-canvas")) {
                console.log("MapWrapper: Map canvas click detected.");
                onMapClick();
              }
            });

            // Listeners to track map animation state
            const setAnimatingTrue = () => {
              isAnimatingRef.current = true;
            };
            const setAnimatingFalse = () => {
              isAnimatingRef.current = false;
            };
            map.on("movestart", setAnimatingTrue);
            map.on("moveend", setAnimatingFalse);
            map.on("zoomstart", setAnimatingTrue);
            map.on("zoomend", setAnimatingFalse);
            map.on("rotatestart", setAnimatingTrue);
            map.on("rotateend", setAnimatingFalse);
            map.on("dragstart", setAnimatingTrue);
            map.on("dragend", setAnimatingFalse);
          });

          map.on("error", (e) => {
            console.error("Mapbox GL Error:", e.error?.message || e);
            // Signal readiness even on error, so parent loader hides
            if (
              !markersReadyFiredRef.current &&
              typeof onMarkersReady === "function"
            ) {
              onMarkersReady();
              markersReadyFiredRef.current = true;
            }
          });
        } catch (error) {
          console.error("MapWrapper: Failed to initialize Mapbox Map:", error);
          // Signal readiness on error
          if (
            !markersReadyFiredRef.current &&
            typeof onMarkersReady === "function"
          ) {
            onMarkersReady();
            markersReadyFiredRef.current = true;
          }
        }
      } else {
        // Container not ready, retry on next frame
        console.log("MapWrapper: Waiting for container dimensions...");
        rafId = requestAnimationFrame(initMapWhenReady);
      }
    };

    initMapWhenReady(); // Start the check

    // Cleanup function runs ONLY when the component unmounts
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      cleanupMap();
    };
    // Dependencies: Only things that truly require re-initializing the map instance itself.
    // Callbacks (onMapClick, onMarkersReady) should be memoized by parent.
    // Initial center/zoom are unlikely to change after first render in Framer context.
  }, [
    mapboxAccessToken,
    mapboxMapStyleUrl,
    cleanupMap,
    // Assuming these are memoized in parent:
    onMarkersReady,
    onMapClick,
    // These usually don't change after initial mount:
    initialCenter,
    initialZoom,
  ]);

  // --- Effect to Handle External Map Update Triggers ---
  // This effect runs on *every render* to check the ref.
  useEffect(() => {
    // Conditions to check before attempting map update:
    // 1. Map instance must be loaded.
    // 2. Map should not be currently animating (moving/zooming).
    // 3. There must be an update request in the ref.
    // 4. The map reference itself must exist.
    if (
      isMapLoaded &&
      !isAnimatingRef.current &&
      mapUpdateTrigger.current &&
      mapboxMapRef.current
    ) {
      const update = mapUpdateTrigger.current;
      const currentMap = mapboxMapRef.current;
      console.log(
        `%cMapWrapper: Consuming map update trigger:`,
        "color: magenta",
        update
      );

      let targetCenter: LngLatLike | undefined = undefined;

      // Determine target center coordinates [lng, lat]
      if (update.center && isValidCoordinates(update.center)) {
        targetCenter = [update.center.lng, update.center.lat];
      } else if (update.center === null) {
        // Handle explicit reset request (e.g., clear search)
        console.log(
          "%cMapWrapper: Trigger includes explicit reset (center: null)",
          "color: orange;"
        );
        // Determine reset target (use initial props)
        targetCenter = Array.isArray(initialCenter)
          ? initialCenter // [lng, lat]
          : [initialCenter.lng, initialCenter.lat]; // Convert {lat, lng}
      }

      // Determine target zoom level
      // Use zoom from update if provided, otherwise keep current zoom unless resetting
      const targetZoom =
        typeof update.zoom === "number"
          ? update.zoom
          : update.center === null // If resetting center, also reset zoom to initial
          ? initialZoom
          : currentMap.getZoom(); // Otherwise, keep current zoom

      // Only proceed if we have a valid target center
      if (targetCenter) {
        const options = {
          center: targetCenter,
          zoom: targetZoom,
          duration: update.type === "fly" ? 1200 : 0, // Animation duration
          essential: true, // Ensures animation completes even if interrupted by user interaction
        };

        try {
          // Set animating flag *before* calling map action
          isAnimatingRef.current = true;
          console.log(
            `%cMapWrapper: ${update.type === "fly" ? "Flying" : "Jumping"} to`,
            "color: magenta; font-weight: bold;",
            options
          );

          if (update.type === "fly") {
            currentMap.flyTo(options);
          } else {
            currentMap.jumpTo(options);
          }
          // Note: isAnimatingRef will be set back to false by the 'moveend'/'zoomend' listeners
        } catch (e) {
          console.error("MapWrapper: Error during map view update:", e);
          isAnimatingRef.current = false; // Reset flag on error just in case
        }
      } else {
        console.log(
          "%cMapWrapper: Update trigger consumed, but no valid target center found. No map action taken.",
          "color: orange;"
        );
      }

      // Consume the trigger *after* initiating (or deciding not to initiate) the map action
      mapUpdateTrigger.current = null;
    }
    // No dependency array - intentionally checks ref on each render
  });

  // --- Dealer Marker Management ---
  useEffect(() => {
    if (!isMapLoaded || !mapboxMapRef.current) {
      // console.log("Dealer Marker Effect: Skipping - Map not ready.");
      return;
    }
    // console.log(`%cDealer Marker Effect - Updating ${dealers.length} dealers. Selected: ${selectedDealer?.id}`, "color: blue;");

    const currentMap = mapboxMapRef.current;
    const newDealerMarkers: { [key: string]: Marker } = {};
    const currentDealerMarkerIds = Object.keys(mapboxDealerMarkersRef.current);
    const activeDealerIds = new Set<string>();
    let markersAddedOrUpdated = false; // Track if any markers were actually placed/updated

    dealers.forEach((dealer) => {
      // Ensure dealer and coordinates are valid before processing
      if (!dealer || !dealer.id || !isValidCoordinates(dealer.coordinates)) {
        // console.warn(`Dealer Marker Effect: Skipping invalid dealer data`, dealer);
        return;
      }

      const dealerCoords = dealer.coordinates!; // We know it's valid here
      const dealerId = String(dealer.id); // Ensure ID is string
      activeDealerIds.add(dealerId); // Keep track of dealers that should be on the map
      const isSelected = selectedDealer?.id === dealerId;
      const existingMarker = mapboxDealerMarkersRef.current[dealerId];

      if (existingMarker) {
        // Marker already exists, update its state (position, appearance)
        try {
          // Check if position needs update (optional optimization)
          const currentPos = existingMarker.getLngLat();
          if (
            currentPos.lng !== dealerCoords.lng ||
            currentPos.lat !== dealerCoords.lat
          ) {
            existingMarker.setLngLat([dealerCoords.lng, dealerCoords.lat]);
          }
          // Update appearance (color, scale based on selection)
          const markerElement = existingMarker.getElement();
          if (markerElement) {
            // Check if element still exists
            markerElement.innerHTML = getMarkerSvg(dealer, isSelected, theme);
          } else {
            console.warn(
              `Marker element missing for dealer ${dealerId} during update.`
            );
          }

          newDealerMarkers[dealerId] = existingMarker; // Keep track of the updated marker
          markersAddedOrUpdated = true;
        } catch (err) {
          console.error(`Error updating marker ${dealerId}:`, err);
          // If update fails, try removing the broken marker
          try {
            existingMarker.remove();
          } catch (removeErr) {
            /* ignore */
          }
        }
      } else {
        // Marker doesn't exist, create a new one
        try {
          const markerEl = document.createElement("div");
          markerEl.className = `dealer-marker dealer-marker-${dealerId}`; // Add class for potential styling/debugging
          markerEl.innerHTML = getMarkerSvg(dealer, isSelected, theme);

          const marker = new mapboxgl.Marker({
            element: markerEl,
            anchor: "bottom", // Anchor point of the SVG marker
            offset: [0, 0], // Adjust if SVG base requires offset
          })
            .setLngLat([dealerCoords.lng, dealerCoords.lat])
            .addTo(currentMap);

          // Add click listener directly to the marker element
          marker.getElement().addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent map click event when marker is clicked
            onMarkerClick(dealer); // Call the handler passed from parent
          });

          newDealerMarkers[dealerId] = marker; // Store the new marker instance
          markersAddedOrUpdated = true;
        } catch (createErr) {
          console.error(`Failed to create marker for ${dealerId}:`, createErr);
        }
      }
    });

    // Remove stale markers (markers for dealers no longer in the `dealers` prop list)
    let removedCount = 0;
    currentDealerMarkerIds.forEach((id) => {
      if (!activeDealerIds.has(id)) {
        try {
          // console.log(`%cDealer Marker Effect - Removing stale marker: ${id}`, "color: orange");
          mapboxDealerMarkersRef.current[id].remove();
          removedCount++;
        } catch (removeErr) {
          console.warn(`Failed remove stale marker ${id}:`, removeErr);
        }
      }
    });
    // if (removedCount > 0) console.log(`%cDealer Marker Effect - Removed ${removedCount} stale markers.`, "color: orange;");

    // Update the ref with the current set of active markers
    mapboxDealerMarkersRef.current = newDealerMarkers;

    // Signal readiness *after* the first pass where markers were potentially added/updated
    if (
      markersAddedOrUpdated &&
      !markersReadyFiredRef.current &&
      typeof onMarkersReady === "function"
    ) {
      console.log(
        "%cMapWrapper: Calling onMarkersReady after first marker pass.",
        "color: green; font-weight: bold;"
      );
      onMarkersReady();
      markersReadyFiredRef.current = true; // Ensure it's only called once
    }
  }, [
    isMapLoaded,
    dealers,
    selectedDealer,
    theme,
    onMarkerClick,
    onMarkersReady,
  ]); // Dependencies trigger marker updates

  // --- User Location Marker ---
  useEffect(() => {
    if (!isMapLoaded || !mapboxMapRef.current) {
      // console.log("User Marker Effect: Skipping - Map not ready.");
      return;
    }
    // console.log(`%cUser Marker Effect - Location:`, "color: purple;", userLocation);

    const currentMap = mapboxMapRef.current;

    // Remove previous user marker if it exists
    if (mapboxUserMarkerRef.current) {
      try {
        mapboxUserMarkerRef.current.remove();
      } catch (e) {
        /* ignore */
      }
      mapboxUserMarkerRef.current = null;
    }

    // Add new marker if location is valid
    if (userLocation && isValidCoordinates(userLocation)) {
      // console.log("%cUser Marker Effect - Adding/Updating user marker.", "color: purple;");
      try {
        const userMarkerEl = document.createElement("div");
        userMarkerEl.className = "user-location-marker";
        // Simple pulsating dot style
        userMarkerEl.style.cssText = `
                    width: 16px; height: 16px; border-radius: 50%;
                    background-color: ${theme.colors.primary || "#007AFF"};
                    border: 2px solid white;
                    box-shadow: 0 0 0 3px ${hexToRgba(
                      theme.colors.primary || "#007AFF",
                      0.3
                    )};
                    position: relative; z-index: 5; /* Ensure above dealer markers */
                    cursor: default; /* No interaction */
                `;
        // Pulsating ripple effect
        const rippleEl = document.createElement("div");
        rippleEl.style.cssText = `
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 100%; height: 100%; border-radius: 50%;
                    border: 2px solid ${hexToRgba(
                      theme.colors.primary || "#007AFF",
                      0.5
                    )};
                    animation: map-ripple 1.5s infinite ease-out;
                    pointer-events: none; z-index: -1; /* Behind the dot */
                `;
        userMarkerEl.appendChild(rippleEl);

        const userMarker = new mapboxgl.Marker({
          element: userMarkerEl,
          anchor: "center", // Center the dot on the coordinates
        })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(currentMap);
        mapboxUserMarkerRef.current = userMarker; // Store reference
      } catch (error) {
        console.error("Error creating user location marker:", error);
      }
    }
  }, [isMapLoaded, userLocation, theme]); // Update only when map loaded state or user location changes

  // --- Render the Map Container Div ---
  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme?.colors?.surfaceVariant || "#f0f0f0", // BG shown before map tiles load
        overflow: "hidden", // Crucial for Mapbox GL JS
        position: "relative", // Needed for absolute positioning inside if any
        ...style, // Allow external style overrides
      }}
      data-mapbox-loaded={isMapLoaded} // For debugging/styling
      aria-label="Map of dealer locations"
      role="application" // Appropriate role for interactive map
    />
  );
};

// Main MapWrapper component chooses which implementation to render
const MapWrapperInternal: React.FC<MapWrapperProps> = (props) => {
  const { mapProvider } = props;

  // Currently only supports Mapbox, add Google Maps logic here if needed
  if (mapProvider === "mapbox") {
    return <MapboxMap {...props} />;
  }

  // Placeholder or Google Maps component would go here
  console.warn(
    `MapProvider '${mapProvider}' is not fully supported yet in MapWrapper.`
  );
  // Render the container div even if the provider isn't supported,
  // so the placeholder from DealerLocator can show.
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: props.theme?.colors?.surfaceVariant || "#f0f0f0",
        overflow: "hidden",
        position: "relative",
        ...props.style,
      }}
      aria-label="Map area unavailable"
    />
  );
};

// Memoize the final component to prevent unnecessary re-renders
// if the props passed from DealerLocator haven't changed.
export default memo(MapWrapperInternal);
