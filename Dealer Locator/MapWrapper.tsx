// MapWrapper.tsx
import React, { useRef, useEffect, memo, useCallback } from "react";
import { RenderTarget } from "framer";
import mapboxgl, { Marker, Popup } from "mapbox-gl"; // Import specific types

// Import types and utility functions from Lib.tsx
import {
  type Dealer,
  type Location,
  type Coordinates,
  type MapProvider,
  createEnhancedPopupContent, // Using the enhanced popup function
  hexToRgba, // Keep if needed elsewhere, though not used directly here now
} from "https://framer.com/m/Lib-8AS5.js@vS7d5YP2fjGyqMnH5L1D"; // Adjust path if necessary

// --- Helper Functions ---

// Helper to inject CSS rules into the document head if they don't exist
const injectGlobalStyle = (id: string, css: string) => {
  if (typeof document !== "undefined" && !document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
    console.log(`Injected global style: #${id}`);
  }
};

// Determines marker color based on service type and selection state
function getMarkerColor(
  dealer: Dealer,
  isSelected: boolean,
  theme: any
): string {
  const services = dealer.services?.map((s) => s.toLowerCase()) || [];
  const hasStore = services.includes("sales") || services.includes("store");
  const hasService =
    services.includes("service") || services.includes("repair");
  const hasCharging = services.includes("charging");

  // Define target colors (ensure these exist in your theme object)
  const salesColor = theme.colors.skyBlue || "#0284C7"; // Tailwind sky-700
  const serviceColor = theme.colors.redColor || "#DC2626"; // Tailwind red-600
  const chargingColor = theme.colors.greenColor || "#22C55E"; // Tailwind green-500
  const defaultColor = theme.colors.neutral?.[700] || "#4B5563"; // Default greyish
  const selectedColor = theme.colors.primary || "#111827"; // Primary color when selected

  if (isSelected) return selectedColor; // Selected state overrides service color for the pin fill

  // Priority: Sales > Service > Charging > Default
  if (hasStore) return salesColor;
  if (hasService) return serviceColor;
  if (hasCharging) return chargingColor;

  return defaultColor; // Fallback color
}

// Generates the HTML string for the custom SVG marker
const getMarkerSvg = (
  dealer: Dealer,
  isSelected: boolean,
  theme: any
): string => {
  const markerColor = getMarkerColor(dealer, isSelected, theme);
  const innerCircleColor = "#FFFFFF"; // White inner circle

  // Simplified SVG structure for the marker
  return `
       <div style="
           cursor: pointer;
           width: 32px; /* Match SVG width */
           height: 44px; /* Approximate visual height */
           display: flex;
           justify-content: center;
           align-items: flex-end; /* Align to bottom */
       ">
           <svg
               xmlns="http://www.w3.org/2000/svg"
               width="32"
               height="32"
               viewBox="0 0 32 32"
               style="
                   display: block; /* Prevent extra space */
                   width: 32px;
                   height: 32px;
                   transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
                   transform-origin: center bottom;
                   transition: transform 0.2s ease-out;
                   filter: ${
                     isSelected
                       ? `drop-shadow(0 4px 4px rgba(0,0,0,0.3))`
                       : `drop-shadow(0 2px 2px rgba(0,0,0,0.15))`
                   }; /* Add shadow */
                   overflow: visible; /* Allow shadow to show */
               ">
               <path
                   d="M16,2A11.0134,11.0134,0,0,0,5,13a10.8885,10.8885,0,0,0,2.2163,6.6s.3.3945.3482.4517L16,30l8.439-9.9526c.0444-.0533.3447-.4478.3447-.4478l.0015-.0024A10.8846,10.8846,0,0,0,27,13,11.0134,11.0134,0,0,0,16,2Z"
                   fill="${markerColor}"
               />
               <circle cx="16" cy="13" r="4" fill="${innerCircleColor}"/>
           </svg>
       </div>
   `;
};

// --- Prop Interface ---
interface MapWrapperProps {
  mapProvider: MapProvider | "none";
  googleApiKey?: string;
  mapboxAccessToken?: string;
  center: Coordinates | [number, number]; // [lng, lat] for mapbox
  zoom: number;
  dealers: Dealer[];
  selectedDealer: Dealer | null;
  userLocation: Location;
  searchLocation: Location;
  onMarkerClick: (dealer: Dealer) => void;
  onMapClick: () => void;
  theme: any;
  distanceUnit: "km" | "miles";
  googleMapStyleId?: string | null;
  mapboxMapStyleUrl?: string;
  style?: React.CSSProperties;
  // Add props for controls if needed, currently handled internally
  hideControls?: boolean;
  navigationControl?: boolean;
  attributionControl?: boolean;
  onMarkersReady?: () => void; // New callback for marker rendering readiness
}

// --- Main Map Component ---
const MapWrapper: React.FC<MapWrapperProps> = ({
  mapProvider,
  googleApiKey,
  mapboxAccessToken,
  center,
  zoom,
  dealers,
  selectedDealer,
  userLocation,
  searchLocation,
  onMarkerClick,
  onMapClick,
  theme,
  distanceUnit,
  googleMapStyleId,
  mapboxMapStyleUrl = "mapbox://styles/mapbox/light-v11",
  style,
  hideControls = false, // Default to showing controls unless specified
  navigationControl = true, // Default to show navigation
  attributionControl = true, // Default to show attribution
  onMarkersReady,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapboxMapRef = useRef<mapboxgl.Map | null>(null);
  const mapboxMarkersRef = useRef<{ [id: string]: Marker }>({});
  const mapboxPopupRef = useRef<Popup | null>(null);
  const mapInitializedRef = useRef(false); // Track if map instance is created
  const markersReadyFiredRef = useRef(false); // Track if onMarkersReady was called
  const markersInitializedRef = useRef(false); // Track if markers were initialized
  const mapLoadTimeoutRef = useRef<number | null>(null); // Use standard 'number' for setTimeout ID

  const isMapbox = mapProvider === "mapbox";

  // Add Mapbox CSS if not already present
  useEffect(() => {
    if (!document.getElementById("mapbox-gl-css")) {
      const link = document.createElement("link");
      link.id = "mapbox-gl-css";
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css";
      document.head.appendChild(link);

      console.log("Added Mapbox CSS to document head");
    }
    return () => {
      // Don't remove CSS on unmount as other components might need it
    };
  }, []);

  // Inject keyframes for user marker ripple effect
  useEffect(() => {
    const rippleKeyframes = `
        @keyframes ripple {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
        }
    `;
    injectGlobalStyle("ripple-keyframes", rippleKeyframes);
  }, []); // Run only once on mount

  // --- Map Interaction Handler ---
  const handleMapInteraction = useCallback(
    (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      // Check if click occurred on a specific layer if using symbol layers
      const features = mapboxMapRef.current?.queryRenderedFeatures(e.point, {
        layers: [],
      });

      // If click wasn't on a known feature/marker, trigger onMapClick
      if (!features || features.length === 0) {
        console.log("Map background clicked");
        onMapClick();
        if (mapboxPopupRef.current) {
          mapboxPopupRef.current.remove(); // Close popup on map click
        }
      }
    },
    [onMapClick]
  );

  // --- Main initialization method for markers ---
  const initializeMarkers = useCallback(() => {
    if (!mapboxMapRef.current || !isMapbox) {
      console.log("Cannot initialize markers yet: Map not ready");
      return false;
    }

    console.log("Initializing markers for the first time:", dealers.length);
    markersInitializedRef.current = true;

    const currentMap = mapboxMapRef.current;
    const newMarkers: { [id: string]: Marker } = {};
    let validDealersCount = 0;

    try {
      // Process each dealer (assuming coordinates are valid from DealerLocator)
      dealers.forEach((dealer) => {
        // Skip dealers with invalid coordinates
        if (
          !dealer.coordinates ||
          typeof dealer.coordinates.lat !== "number" ||
          typeof dealer.coordinates.lng !== "number" ||
          isNaN(dealer.coordinates.lat) ||
          isNaN(dealer.coordinates.lng)
        ) {
          console.warn(
            `Skipping dealer with invalid coordinates: ${
              dealer.name || dealer.id
            }`
          );
          return;
        }

        validDealersCount++;
        const dealerId = dealer.id;
        const isSelected = selectedDealer?.id === dealerId;

        // Create marker element using the SVG function
        const markerEl = document.createElement("div");
        markerEl.className = `dealer-marker dealer-marker-${dealerId}`;
        markerEl.innerHTML = getMarkerSvg(dealer, isSelected, theme);

        // Create and add the marker
        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: "bottom", // Anchor at the tip of the pin
        })
          .setLngLat([dealer.coordinates.lng, dealer.coordinates.lat])
          .addTo(currentMap);

        // Add click handler to the marker
        marker.getElement().addEventListener("click", () => {
          console.log(`Marker clicked: ${dealer.name}`);
          onMarkerClick(dealer);
        });

        newMarkers[dealerId] = marker;
      });

      console.log(
        `Created ${validDealersCount} valid markers out of ${dealers.length} dealers`
      );

      // Update markers ref
      mapboxMarkersRef.current = {
        ...newMarkers,
        ...(mapboxMarkersRef.current["user-location"]
          ? {
              "user-location": mapboxMarkersRef.current["user-location"],
            }
          : {}),
      };

      // Notify parent that markers are now rendered
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function"
      ) {
        console.log("Notifying parent that markers are ready");
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }

      return true;
    } catch (error) {
      console.error("Error initializing markers:", error);
      // Still notify parent even if there was an error
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function"
      ) {
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }
      return false;
    }
  }, [isMapbox, dealers, selectedDealer, onMarkerClick, theme, onMarkersReady]);

  // --- Cleanup function ---
  const cleanupMap = useCallback(() => {
    console.log("Cleaning up Mapbox instance...");
    if (mapLoadTimeoutRef.current) {
      clearTimeout(mapLoadTimeoutRef.current);
      mapLoadTimeoutRef.current = null;
    }

    if (mapboxPopupRef.current) {
      mapboxPopupRef.current.remove();
      mapboxPopupRef.current = null;
    }

    Object.values(mapboxMarkersRef.current).forEach((marker) =>
      marker.remove()
    );

    mapboxMarkersRef.current = {};

    if (mapboxMapRef.current) {
      try {
        // Unbind events manually if necessary, although remove() should handle most
        mapboxMapRef.current.off("click", handleMapInteraction);
        mapboxMapRef.current.remove();
      } catch (e) {
        console.warn("Mapbox cleanup error:", e);
      } finally {
        mapboxMapRef.current = null;
      }
    }

    markersReadyFiredRef.current = false;
    markersInitializedRef.current = false;
    mapInitializedRef.current = false; // Reset map initialized flag
    console.log("Mapbox cleanup complete.");
  }, [handleMapInteraction]); // Include handleMapInteraction in dependencies

  // --- Mapbox Initialization Effect ---
  useEffect(() => {
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

      // Make sure we notify markers ready even if skipping map init
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function"
      ) {
        console.log("Notifying markers ready (map init skipped)");
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }

      return cleanupMap; // Ensure cleanup if conditions change
    }

    // Prevent re-initialization if map already exists and essential props haven't changed
    if (mapInitializedRef.current && mapboxMapRef.current) {
      console.log("Map already initialized, skipping re-init.");
      return cleanupMap; // Still return cleanup in case props change later
    }

    console.log("Initializing Mapbox Map...");
    mapboxgl.accessToken = mapboxAccessToken;

    try {
      // Ensure the container has proper dimensions
      if (
        mapContainerRef.current.clientWidth === 0 ||
        mapContainerRef.current.clientHeight === 0
      ) {
        console.error("Map container has zero width or height", {
          width: mapContainerRef.current.clientWidth,
          height: mapContainerRef.current.clientHeight,
        });
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapboxMapStyleUrl,
        center: Array.isArray(center) ? center : [center.lng, center.lat],
        zoom: zoom,
        maxZoom: 18,
        minZoom: 4,
        renderWorldCopies: false,
        attributionControl: false, // Manually add later if needed
      });

      // Add controls based on props
      if (!hideControls) {
        if (navigationControl) {
          map.addControl(
            new mapboxgl.NavigationControl({ showCompass: false }),
            "top-right"
          );
        }
        if (attributionControl) {
          map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            "bottom-right"
          );
        }
      }

      mapboxMapRef.current = map;
      mapInitializedRef.current = true; // Mark map as initialized

      map.on("load", () => {
        console.log("Mapbox map loaded.");
        map.on("click", handleMapInteraction); // Attach click listener here

        // Ensure map resizes if container size changes after load
        map.resize();

        // Initialize markers after map load
        if (!markersInitializedRef.current && dealers.length > 0) {
          setTimeout(() => {
            initializeMarkers();
          }, 100);
        }
        // Ensure onMarkersReady is called if no dealers exist
        else if (
          dealers.length === 0 &&
          !markersReadyFiredRef.current &&
          typeof onMarkersReady === "function"
        ) {
          console.log(
            "Map loaded, no dealers, ensuring onMarkersReady is called."
          );
          onMarkersReady();
          markersReadyFiredRef.current = true;
        }
      });

      map.on("error", (e) => {
        console.error("Mapbox GL Error:", e.error?.message || e);
      });

      // Set a fallback timeout to ensure markers get initialized
      mapLoadTimeoutRef.current = window.setTimeout(() => {
        if (
          !markersReadyFiredRef.current &&
          typeof onMarkersReady === "function"
        ) {
          console.log("Fallback timer: ensuring markers ready is fired");
          onMarkersReady();
          markersReadyFiredRef.current = true;
        }
      }, 5000);
    } catch (error) {
      console.error("Failed to initialize Mapbox Map:", error);

      // Notify ready even if there was an error
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function"
      ) {
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }
    }

    return cleanupMap;
  }, [
    isMapbox,
    mapboxAccessToken,
    mapboxMapStyleUrl,
    hideControls,
    navigationControl,
    attributionControl,
    cleanupMap,
    handleMapInteraction,
    dealers.length,
    initializeMarkers,
    onMarkersReady,
  ]);

  // --- Mapbox Marker Creation/Update Effect ---
  useEffect(() => {
    if (!mapboxMapRef.current || !isMapbox) {
      // If map isn't ready, we can't manage markers.
      // Ensure onMarkersReady is called if it hasn't been, especially if there are no dealers.
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function" &&
        dealers.length === 0
      ) {
        console.log(
          "Map not ready or no dealers, ensuring onMarkersReady is called."
        );
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }
      return;
    }

    // If markers not initialized yet and this is the first run, initialize them now
    if (!markersInitializedRef.current) {
      initializeMarkers();
      return;
    }

    console.log(
      `Updating ${dealers.length} markers. Selected: ${selectedDealer?.id}`
    );
    const currentMap = mapboxMapRef.current;
    const newMarkers: { [id: string]: Marker } = {}; // Track markers for this update cycle
    let validDealersCount = 0;

    try {
      // 1. Create/Update Dealer Markers
      dealers.forEach((dealer) => {
        // Skip dealers with invalid coordinates
        if (
          !dealer.coordinates ||
          typeof dealer.coordinates.lat !== "number" ||
          typeof dealer.coordinates.lng !== "number" ||
          isNaN(dealer.coordinates.lat) ||
          isNaN(dealer.coordinates.lng)
        ) {
          console.warn(
            `Skipping dealer with invalid coordinates: ${
              dealer.name || dealer.id
            }`
          );
          return;
        }

        validDealersCount++;
        const dealerId = dealer.id;
        const isSelected = selectedDealer?.id === dealerId;

        try {
          // Create marker element using the SVG function
          const markerEl = document.createElement("div");
          markerEl.className = `dealer-marker dealer-marker-${dealerId}`;
          markerEl.innerHTML = getMarkerSvg(dealer, isSelected, theme);

          // Find the existing marker if any
          const existingMarker = mapboxMarkersRef.current[dealerId];

          if (existingMarker) {
            // First store the existing marker in newMarkers to ensure it's not removed
            newMarkers[dealerId] = existingMarker;

            // Then update the marker properties
            try {
              existingMarker.getElement().innerHTML = markerEl.innerHTML;

              // Update position if needed
              const currentPos = existingMarker.getLngLat();
              if (
                currentPos.lng !== dealer.coordinates.lng ||
                currentPos.lat !== dealer.coordinates.lat
              ) {
                existingMarker.setLngLat([
                  dealer.coordinates.lng,
                  dealer.coordinates.lat,
                ]);
              }
            } catch (err) {
              console.error("Error updating marker:", err);
              existingMarker.remove(); // Remove problematic marker
              // We'll create a new one below
              delete newMarkers[dealerId]; // Remove from newMarkers since it failed
            }
          }

          // If no existing marker or update failed, create a new one
          if (!newMarkers[dealerId]) {
            const marker = new mapboxgl.Marker({
              element: markerEl,
              anchor: "bottom", // Anchor at the tip of the pin
            })
              .setLngLat([dealer.coordinates.lng, dealer.coordinates.lat])
              .addTo(currentMap);

            // Add click handler to the marker
            marker.getElement().addEventListener("click", () => {
              console.log(`Marker clicked: ${dealer.name}`);
              onMarkerClick(dealer);
            });

            newMarkers[dealerId] = marker;
          }
        } catch (error) {
          console.error(
            "Failed to create/update Mapbox Marker:",
            error,
            dealer
          );
        }
      });

      console.log(
        `Updated ${validDealersCount} valid markers out of ${dealers.length} dealers`
      );

      // 2. Remove Old Markers (excluding user marker)
      Object.keys(mapboxMarkersRef.current).forEach((oldDealerId) => {
        if (oldDealerId !== "user-location" && !newMarkers[oldDealerId]) {
          console.log(`Removing old marker: ${oldDealerId}`);
          mapboxMarkersRef.current[oldDealerId].remove();
        }
      });

      // 3. Update the marker ref, preserving user marker if it exists
      mapboxMarkersRef.current = {
        ...newMarkers,
        ...(mapboxMarkersRef.current["user-location"]
          ? {
              "user-location": mapboxMarkersRef.current["user-location"],
            }
          : {}),
      };

      // 4. Notify parent component that markers are rendered
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function"
      ) {
        console.log("Notifying that markers are now ready");
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }
    } catch (error) {
      console.error("Error processing markers:", error);
      // Still notify parent even if there was an error
      if (
        !markersReadyFiredRef.current &&
        typeof onMarkersReady === "function"
      ) {
        console.log(
          "Notifying that markers processing is complete (with errors)"
        );
        onMarkersReady();
        markersReadyFiredRef.current = true;
      }
    }
  }, [
    isMapbox,
    dealers,
    selectedDealer,
    onMarkerClick,
    theme,
    onMarkersReady,
    initializeMarkers,
  ]);

  // --- Mapbox Popup Update Effect (Simplified) ---
  useEffect(() => {
    // This effect is now primarily for cleanup, as popups aren't used directly
    if (!mapboxMapRef.current || !isMapbox) return;

    // Just make sure any existing popup is removed
    if (mapboxPopupRef.current) {
      mapboxPopupRef.current.remove();
      mapboxPopupRef.current = null;
    }

    // We don't need to create a new popup since we're using the drawer
  }, [isMapbox, selectedDealer]);

  // --- Map Panning & Zooming Effects ---
  useEffect(() => {
    if (!mapboxMapRef.current || !isMapbox) return;

    // Only respond to explicit location searches, not just any userLocation change
    const targetLocation = searchLocation;
    if (!targetLocation) return;

    console.log("Panning map to search location:", targetLocation);
    try {
      mapboxMapRef.current.flyTo({
        center: [targetLocation.lng, targetLocation.lat],
        zoom: 13, // Use a consistent zoom for search results
        duration: 1000,
        essential: true,
      });
    } catch (error) {
      console.error("Error during map flyTo:", error);
    }
  }, [isMapbox, searchLocation]); // Only depend on searchLocation

  // Handle direct centering of map on user location
  useEffect(() => {
    if (!mapboxMapRef.current || !isMapbox || !userLocation) return;

    // Only center if there's no search location active
    if (searchLocation) return;

    // Check if this is the initial userLocation appearance
    if (userLocation && !mapboxMarkersRef.current["user-location"]) {
      console.log("Centering map on initial user location");
      try {
        mapboxMapRef.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 13,
          duration: 1000,
          essential: true,
        });
      } catch (error) {
        console.error("Error centering on user location:", error);
      }
    }
  }, [isMapbox, userLocation, searchLocation]);

  // Handle center/zoom changes directly
  useEffect(() => {
    if (!mapboxMapRef.current || !isMapbox) return;
    const currentMap = mapboxMapRef.current;

    try {
      const targetCenter = Array.isArray(center)
        ? center
        : [center.lng, center.lat];
      const currentCenter = currentMap.getCenter();

      // Only pan if there's a significant difference
      const centerDiff =
        Math.abs(currentCenter.lng - targetCenter[0]) +
        Math.abs(currentCenter.lat - targetCenter[1]);

      if (centerDiff > 0.0001) {
        console.log("Panning to new center:", targetCenter);
        currentMap.panTo(targetCenter, {
          duration: 300,
          essential: true,
        });
      }

      // Set zoom if different
      if (Math.abs(currentMap.getZoom() - zoom) > 0.1) {
        console.log("Setting new zoom:", zoom);
        currentMap.setZoom(zoom);
      }
    } catch (error) {
      console.error("Error updating map position:", error);
    }
  }, [isMapbox, center, zoom]); // Depend on center and zoom

  // --- User location marker ---
  useEffect(() => {
    if (!mapboxMapRef.current || !userLocation || !isMapbox) return;

    console.log("Adding/updating user location marker");

    try {
      // Remove existing user marker if it exists
      if (mapboxMarkersRef.current["user-location"]) {
        mapboxMarkersRef.current["user-location"].remove();
        delete mapboxMarkersRef.current["user-location"]; // Clean up ref
      }

      const userMarkerEl = document.createElement("div");
      userMarkerEl.className = "user-location-marker";
      userMarkerEl.innerHTML = `
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${
              theme.colors.primary || "#007AFF"
            }; border: 2px solid white; box-shadow: 0 0 0 2px rgba(0,0,0,0.1);">
              <div style="position: absolute; top: -4px; left: -4px; width: 24px; height: 24px; border-radius: 50%; background: transparent; border: 1px solid ${
                theme.colors.primary || "#007AFF"
              }; opacity: 0.5; animation: ripple 1.5s infinite ease-out;"></div>
            </div>
          `; // Removed inline <style> tag

      const userMarker = new mapboxgl.Marker({
        element: userMarkerEl,
        anchor: "center",
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapboxMapRef.current);

      mapboxMarkersRef.current["user-location"] = userMarker; // Store with specific ID
    } catch (error) {
      console.error("Error creating user location marker:", error);
    }
  }, [isMapbox, userLocation, theme]); // Dependencies

  // --- Render the Map Container ---
  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.surfaceVariant, // Fallback background
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    />
  );
};

export default memo(MapWrapper); // Memoize for performance
