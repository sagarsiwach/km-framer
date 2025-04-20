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
  const isRenderedRef = useRef(false);
  const markersReadyFiredRef = useRef(false);

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
        mapboxPopupRef.current?.remove(); // Close popup on map click
      }
    },
    [onMapClick]
  );

  // --- Cleanup function ---
  const cleanupMap = useCallback(() => {
    console.log("Cleaning up Mapbox instance...");
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
    isRenderedRef.current = false;
    markersReadyFiredRef.current = false;
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
      return cleanupMap; // Ensure cleanup if conditions change
    }

    // Cleanup existing map before reinitializing
    if (mapboxMapRef.current) {
      cleanupMap();
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

      map.on("load", () => {
        console.log("Mapbox map loaded.");
        isRenderedRef.current = true;
        map.on("click", handleMapInteraction); // Attach click listener here

        // Notify on first load that map is ready
        if (
          !markersReadyFiredRef.current &&
          typeof onMarkersReady === "function"
        ) {
          setTimeout(() => {
            onMarkersReady();
            markersReadyFiredRef.current = true;
          }, 500); // Short delay to ensure map is fully rendered
        }
      });

      map.on("error", (e) => {
        console.error("Mapbox GL Error:", e.error?.message || e);
      });
    } catch (error) {
      console.error("Failed to initialize Mapbox Map:", error);
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
    onMarkersReady,
    // center and zoom are handled separately to prevent re-init
  ]);

  // --- Mapbox Marker Update Effect ---
  useEffect(() => {
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) {
      console.log("Skipping marker update: Map not ready or not Mapbox.");
      return;
    }

    console.log(`Updating ${dealers.length} markers...`);
    const currentMap = mapboxMapRef.current;
    const newMarkers: { [id: string]: Marker } = {};

    // 1. Add or Update Markers
    dealers.forEach((dealer) => {
      if (
        !dealer.coordinates ||
        !dealer.coordinates.lat ||
        !dealer.coordinates.lng
      ) {
        console.warn(
          `Invalid coordinates for dealer ${dealer.name || dealer.id}`,
          dealer.coordinates
        );
        return; // Skip this dealer
      }

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
          // Update existing marker element
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

            newMarkers[dealerId] = existingMarker;
          } catch (err) {
            console.error("Error updating marker:", err);
            existingMarker.remove(); // Remove problematic marker
            // We'll create a new one below
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
        console.error("Failed to create/update Mapbox Marker:", error, dealer);
      }
    });

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
        ? { "user-location": mapboxMarkersRef.current["user-location"] }
        : {}),
    };

    // 4. Notify parent component that markers are rendered
    if (!markersReadyFiredRef.current && typeof onMarkersReady === "function") {
      console.log("Notifying that markers are now ready");
      onMarkersReady();
      markersReadyFiredRef.current = true;
    }
  }, [isMapbox, dealers, selectedDealer, onMarkerClick, theme, onMarkersReady]);

  // --- Mapbox Popup Update Effect ---
  useEffect(() => {
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) return;
    const currentMap = mapboxMapRef.current;

    if (mapboxPopupRef.current) {
      mapboxPopupRef.current.remove();
      mapboxPopupRef.current = null;
    }

    if (selectedDealer) {
      console.log(`Showing popup for: ${selectedDealer.name}`);
      try {
        const popupOffset = 35; // Adjust based on marker height for better positioning
        mapboxPopupRef.current = new mapboxgl.Popup({
          offset: [0, -popupOffset], // Negative vertical offset moves it up
          closeButton: false,
          closeOnClick: false,
          maxWidth: "240px",
          className: "dealer-popup",
          anchor: "bottom", // Anchor relative to marker's bottom
        })
          .setLngLat([
            selectedDealer.coordinates.lng,
            selectedDealer.coordinates.lat,
          ])
          .setHTML(
            createEnhancedPopupContent(selectedDealer, theme, distanceUnit)
          )
          .addTo(currentMap);
      } catch (error) {
        console.error("Failed to create Mapbox Popup:", error);
      }
    }
  }, [isMapbox, selectedDealer, theme, distanceUnit]); // Dependencies

  // --- Map Panning & Zooming Effects ---
  useEffect(() => {
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) return;
    const targetLocation = searchLocation || userLocation;
    if (!targetLocation) return;
    console.log("Panning map to target location:", targetLocation);
    mapboxMapRef.current.flyTo({
      center: [targetLocation.lng, targetLocation.lat],
      zoom: searchLocation ? 13 : 12,
      duration: 1000,
      essential: true,
    });
  }, [isMapbox, searchLocation, userLocation]); // Dependencies

  useEffect(() => {
    if (!mapboxMapRef.current || !isRenderedRef.current || !isMapbox) return;
    const currentMap = mapboxMapRef.current;
    const targetCenter = Array.isArray(center)
      ? center
      : [center.lng, center.lat];
    const currentCenter = currentMap.getCenter();
    const centerDiff =
      Math.abs(currentCenter.lng - targetCenter[0]) +
      Math.abs(currentCenter.lat - targetCenter[1]);
    if (centerDiff > 0.0001) {
      currentMap.panTo(targetCenter, { duration: 300, essential: true });
    }
    if (Math.abs(currentMap.getZoom() - zoom) > 0.1) {
      currentMap.setZoom(zoom);
    }
  }, [isMapbox, center, zoom]); // Dependencies

  // --- User location marker ---
  useEffect(() => {
    if (
      !mapboxMapRef.current ||
      !userLocation ||
      !isRenderedRef.current ||
      !isMapbox
    )
      return;

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
          <style> @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } } </style>
        `;

    const userMarker = new mapboxgl.Marker({
      element: userMarkerEl,
      anchor: "center",
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapboxMapRef.current);

    mapboxMarkersRef.current["user-location"] = userMarker; // Store with specific ID

    // No return cleanup needed here as the main cleanupMap handles it
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
