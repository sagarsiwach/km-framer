// MapWrapper.tsx
import React, { useRef, useEffect, memo, useCallback } from "react";
import { RenderTarget } from "framer";
import mapboxgl, { Marker, Popup } from "mapbox-gl"; // Import specific types

// IMPORTANT: Make sure Mapbox CSS is added via CDN in Framer Site Settings -> Head Content:
// <link href='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css' rel='stylesheet' />
// Or import it if your setup allows: import 'mapbox-gl/dist/mapbox-gl.css';

// Import types and utility functions from Lib.tsx
import {
  getInitialCenter,
  type Dealer,
  type Location,
  type MapProvider,
  type Coordinates,
} from "https://framer.com/m/Lib-8AS5.js@OT7MrLyxrSeMBPdmFx17"; // <-- Make sure this URL points to your Lib.tsx file

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
// Creates the HTML content for the Mapbox popup
const createMapboxPopupContent = (
  dealer: Dealer,
  theme: any,
  distanceUnit: string,
): string => `
 <div style="font-family: ${theme.typography.fontFamily || "Inter, sans-serif"}; font-size: 12px; color: ${theme.colors.onSurface}; max-width: 180px; padding: 2px 4px;">
    <h3 style="margin: 0 0 2px; font-size: 13px; font-weight: 500; line-height: 1.3;">${dealer.name}</h3>
    <p style="margin: 0; font-size: 11px; color: ${theme.colors.onSurfaceVariant}; line-height: 1.3;">${dealer.address.formatted}</p>
     ${dealer.distance !== undefined && dealer.distance >= 0 ? `<p style="margin: 3px 0 0; font-size: 11px; color: ${theme.colors.onSurfaceVariant}; font-weight: 400;">${dealer.distance} ${distanceUnit}</p>` : ""}
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

  const isMapbox = mapProvider === "mapbox";

  // --- Cleanup function ---
  // Safely removes the map instance, markers, and popup
  const cleanupMap = useCallback(() => {
    console.log("Cleaning up Mapbox instance...");
    // Close and remove popup
    if (mapboxPopupRef.current) {
      mapboxPopupRef.current.remove();
      mapboxPopupRef.current = null;
    }
    // Remove markers
    Object.values(mapboxMarkersRef.current).forEach((marker) =>
      marker.remove(),
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
  // Handles clicks on the map, distinguishing between map background and markers
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
    [onMapClick],
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
        "top-right",
      );
      // Add attribution control separately for customization if desired
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right",
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
  // Updates markers based on the 'dealers' prop
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

      // Create marker DOM element
      const el = document.createElement("div");
      el.style.width = isSelected ? "12px" : "10px";
      el.style.height = isSelected ? "12px" : "10px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = theme.colors.onSurface; // Use theme color (black/dark)
      el.style.border = `1.5px solid ${theme.colors.surface}`; // Use theme color (white border)
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.1)"; // Subtle shadow for visibility
      el.style.transform = isSelected ? "scale(1.15)" : "scale(1)";
      el.style.transition =
        "transform 0.15s ease-out, background-color 0.15s ease-out";
      // Ensure selected marker stays prominent
      el.style.zIndex = isSelected ? "10" : "1";

      if (existingMarker) {
        // Update existing marker's element & position (Mapbox doesn't have easy element update)
        // It's often easier to remove and re-add, but let's try updating the element
        existingMarker.getElement().replaceWith(el); // Replace DOM element directly
        // Re-attach event listener to the new element
        el.addEventListener("click", (e) => {
          e.stopPropagation(); // Prevent map click
          onMarkerClick(dealer);
        });
        // Update z-index if needed (though CSS might handle it)

        newMarkers[dealerId] = existingMarker; // Keep track
        delete mapboxMarkersRef.current[dealerId]; // Remove from old set
      } else {
        // Create new marker
        try {
          const marker = new mapboxgl.Marker(el)
            .setLngLat([dealer.coordinates.lng, dealer.coordinates.lat])
            .addTo(currentMap);

          // Add click listener for new marker
          el.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent map click
            console.log(`Marker clicked: ${dealer.name}`);
            onMarkerClick(dealer);
          });
          newMarkers[dealerId] = marker; // Add to new set
        } catch (error) {
          console.error("Failed to create Mapbox Marker:", error, dealer);
        }
      }
    });

    // 2. Remove Old Markers (those not in the current 'dealers' list)
    Object.keys(mapboxMarkersRef.current).forEach((oldDealerId) => {
      console.log(`Removing stale marker: ${oldDealerId}`);
      mapboxMarkersRef.current[oldDealerId].remove();
    });

    // 3. Update marker ref with the current set
    mapboxMarkersRef.current = newMarkers;

    console.log("Marker update complete.");
  }, [isMapbox, dealers, selectedDealer, onMarkerClick, theme]); // Depend on dealers, selection, and theme

  // --- Mapbox Popup Update Effect ---
  // Handles showing/hiding the popup for the selectedDealer
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
          offset: 15, // Offset from marker center
          closeButton: false,
          closeOnClick: false, // Prevent closing when map is clicked (handled elsewhere)
          maxWidth: "200px",
          anchor: "bottom", // Anchor below the marker
        })
          .setLngLat([
            selectedDealer.coordinates.lng,
            selectedDealer.coordinates.lat,
          ])
          .setHTML(
            createMapboxPopupContent(selectedDealer, theme, distanceUnit),
          )
          .addTo(currentMap);
      } catch (error) {
        console.error("Failed to create Mapbox Popup:", error);
      }
    }
  }, [isMapbox, selectedDealer, theme, distanceUnit]); // Depend on selection and theme

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
      currentMap.setZoom(zoom); // Consider easing zoom if needed: currentMap.zoomTo(zoom, { duration: 300 });
    }
  }, [isMapbox, center, zoom]); // Depend on external center/zoom props

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
      // Add a key to potentially help React re-render on provider change, though cleanup should handle it.
      // key={mapProvider}
    />
  );
};

export default memo(MapWrapper); // Memoize to prevent unnecessary re-renders
