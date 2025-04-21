// Hooks.tsx
import { useState, useEffect, useCallback } from "react";
import { RenderTarget } from "framer";

// Import types and constants from Lib.tsx
import {
  SAMPLE_DEALERS, // Used for canvas preview and fallback
  type Dealer,
  type Location,
  type MapProvider,
  type Coordinates,
  isValidCoordinates, // Import validator
} from "https://framer.com/m/Lib-8AS5.js"; // Use the updated Lib import path

// --- Hook to manage dealer data fetching and state ---
export const useDealerData = (
  apiEndpoint?: string,
  staticData: Dealer[] = SAMPLE_DEALERS
) => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log("Fetching dealer data..."); // Log start

    // Use static data on the Framer canvas or if no endpoint provided
    if (RenderTarget.current() === RenderTarget.canvas || !apiEndpoint) {
      console.log(
        !apiEndpoint
          ? "No API endpoint provided, using static data."
          : "Canvas detected, using static data."
      );
      // Ensure static data coordinates are valid, set to null if not
      const formattedStaticData = staticData.map((d) => ({
        ...d,
        coordinates: isValidCoordinates(d.coordinates) ? d.coordinates : null,
        services: d.services || [],
        hours: d.hours || [],
      }));
      setDealers(formattedStaticData);
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Fetching from: ${apiEndpoint}`);
      const response = await fetch(apiEndpoint);
      console.log(`API Response Status: ${response.status}`);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      // Updated API format checking
      if (data.status === "success" && Array.isArray(data.dealers)) {
        console.log(`Received ${data.dealers.length} dealers from API`);
        // Validate coordinates for each dealer from API
        const validatedDealers = data.dealers.map((d: any) => ({
          ...d,
          id: String(d.id || `dealer-${Math.random()}`), // Ensure ID is string
          coordinates: isValidCoordinates(d.coordinates) ? d.coordinates : null, // Set invalid coords to null
          services: d.services || [],
          hours: d.hours || [],
          address: d.address || { formatted: "Address unknown" }, // Ensure address exists
          name: d.name || "Unnamed Dealer", // Ensure name exists
        }));
        setDealers(validatedDealers);
      } else {
        // Handle unexpected data format
        console.error("Invalid API response format:", data);
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error fetching or processing dealer data:", errorMsg, err);
      setError(`Failed to fetch dealers: ${errorMsg}`);
      // Fallback to static data on error if available
      if (staticData && staticData.length > 0) {
        console.log("Falling back to static data due to API error.");
        const formattedStaticData = staticData.map((d) => ({
          ...d,
          coordinates: isValidCoordinates(d.coordinates) ? d.coordinates : null,
          services: d.services || [],
          hours: d.hours || [],
        }));
        setDealers(formattedStaticData);
      } else {
        setDealers([]);
      }
    } finally {
      setIsLoading(false);
      console.log("Finished fetching dealer data.");
    }
  }, [apiEndpoint, staticData]); // Dependencies for the fetch callback

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is memoized by useCallback

  // Return state and refetch function
  return { dealers, isLoading, error, refetch: fetchData };
};

// --- Hook to manage geolocation ---
// Keep this hook as it is, seems robust.
export const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState<Location>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getUserLocation = useCallback(() => {
    // Geolocation doesn't work on canvas
    if (RenderTarget.current() === RenderTarget.canvas) {
      console.log("Geolocation skipped on canvas.");
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      console.warn("Geolocation not supported.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    console.log("Attempting to get user location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log("Geolocation successful:", coords);
        setUserLocation(coords);
        setIsLocating(false);
      },
      (error) => {
        let message = "Could not retrieve location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        console.error("Geolocation error:", error.message, error.code);
        setLocationError(message);
        setIsLocating(false);
        setUserLocation(null); // Clear location on error
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 60000, // Allow cached position up to 1 minute old
      }
    );
  }, []); // No dependencies, useCallback ensures stable function reference

  return { userLocation, isLocating, locationError, getUserLocation };
};

// --- Hook to manage API loading state (Google Maps Script) ---
// Keep this hook as is for potential Google Maps usage.
export const useMapApiState = (provider: MapProvider, apiKey?: string) => {
  const [isLoaded, setIsLoaded] = useState(provider === "mapbox"); // Mapbox assumed loaded via CDN/import
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state on provider change
    setIsLoaded(provider === "mapbox");
    setLoadError(null);

    if (provider === "mapbox") {
      console.log("Mapbox selected, API assumed loaded.");
      return; // No script loading needed for Mapbox GL JS
    }

    // --- Google Maps Loading Logic ---
    if (RenderTarget.current() === RenderTarget.canvas) {
      console.log("Google Maps API loading skipped on canvas.");
      setIsLoaded(true); // Assume loaded for canvas preview
      return;
    }

    if (provider === "google" && !apiKey) {
      console.error("Google Maps API key is required but not provided.");
      setLoadError(new Error("Google Maps API key is required."));
      setIsLoaded(false);
      return;
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.marker) {
      console.log("Google Maps API already loaded.");
      setIsLoaded(true);
      setLoadError(null);
      return;
    }

    const scriptId = "google-maps-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const callbackName = `__framerMapCallback_${Date.now()}`;

    // Cleanup function for the callback
    const cleanup = () => {
      delete window[callbackName]; // Remove callback from global scope
    };

    // If script tag exists, but API not ready, wait (handle potential race conditions)
    if (script && !window.google?.maps?.marker) {
      console.log("Google Maps script tag exists, waiting for load...");
      let checkIntervalId: number | null = null;
      let waitTimeoutId: number | null = null;

      const clearTimers = () => {
        if (checkIntervalId !== null) clearInterval(checkIntervalId);
        if (waitTimeoutId !== null) clearTimeout(waitTimeoutId);
      };

      checkIntervalId = window.setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.marker) {
          console.log("Google Maps API loaded after waiting.");
          setIsLoaded(true);
          setLoadError(null);
          clearTimers();
          cleanup();
        }
      }, 100);

      // Timeout check
      waitTimeoutId = window.setTimeout(() => {
        clearTimers();
        if (!isLoaded) {
          console.error(
            "Timeout waiting for existing Google Maps script to load."
          );
          setLoadError(new Error("Timeout waiting for Google Maps script."));
          setIsLoaded(false);
          cleanup();
        }
      }, 10000); // 10 second timeout

      return () => {
        clearTimers();
        cleanup();
      };
    } else if (!script && provider === "google" && apiKey) {
      // Create and load the script
      console.log("Creating Google Maps script tag...");
      script = document.createElement("script");
      script.id = scriptId;
      // Ensure 'marker' library is loaded for AdvancedMarkerElement
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=${callbackName}&loading=async`; // Use async loading attribute
      script.async = true;
      script.defer = true; // Keep defer as well
      script.onerror = (error) => {
        console.error("Google Maps script loading error:", error);
        setLoadError(new Error("Failed to load Google Maps script."));
        setIsLoaded(false);
        cleanup();
        script?.remove(); // Remove failed script tag
      };

      window[callbackName] = () => {
        console.log("Google Maps API loaded via callback.");
        setIsLoaded(true);
        setLoadError(null);
        cleanup();
      };

      document.body.appendChild(script);

      return () => {
        cleanup();
        // Don't remove the script on unmount if it loaded successfully,
        // as it might be used by other components.
      };
    }
    // If script exists and API is loaded, this point shouldn't be reached due to early return.
  }, [provider, apiKey]); // Removed isLoaded from dependencies to avoid potential loops

  return { isLoaded, loadError };
};
