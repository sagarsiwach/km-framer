// Custom hook for location search functionality
import { useState, useRef, useCallback } from "react";
import { searchLocationFromPricing } from "../utils/api";

/**
 * Helper Function to Format Location
 * @param {object} feature - Location feature object
 * @returns {string} Formatted location string
 */
export const formatLocationString = (feature) => {
  if (!feature) return "";

  let pincode = "";
  let city = "";
  let state = "";
  const country = "India";

  if (feature.context) {
    feature.context.forEach((item) => {
      const type = item.id.split(".")[0];
      switch (type) {
        case "postcode":
          pincode = item.text;
          break;
        case "locality":
          if (!city) city = item.text;
          break;
        case "place":
          city = item.text;
          break;
        case "region":
          state = item.text;
          break;
        default:
          break;
      }
    });
  }

  if (!city && feature.place_type?.includes("place")) {
    city = feature.text;
  }

  // Check if the main feature text itself is the pincode if not found in context
  if (!pincode && /^\d{6}$/.test(feature.text)) {
    pincode = feature.text;
  }

  const parts = [pincode, city, state].filter(Boolean);
  let formatted = parts.join(", ");

  // Ensure pincode from main text is prioritized if context didn't provide one
  if (pincode && !parts.includes(pincode)) {
    formatted = `${pincode}${parts.length > 0 ? ", " + parts.join(", ") : ""}`;
  }

  if (formatted) {
    formatted += ", " + country;
  } else if (feature.place_name?.toLowerCase().includes("india")) {
    formatted = feature.place_name; // Fallback to place_name if formatting fails but it's in India
  } else {
    formatted = feature.place_name
      ? `${feature.place_name}, ${country}`
      : country; // Add India if missing
  }

  // Simple cleanup for potential double commas or leading/trailing commas
  formatted = formatted.replace(/, ,/g, ",").replace(/^,|,$/g, "").trim();

  return formatted;
};

/**
 * Custom hook for location search functionality
 * @param {object} vehicleData - Vehicle data for local search
 * @returns {object} Location search methods and state
 */
export default function useLocationSearch(vehicleData) {
  const [location, setLocation] = useState("");
  const [locationStatus, setLocationStatus] = useState("idle"); // idle, searching, success, error
  const [locationResults, setLocationResults] = useState([]);
  const [showLocationResults, setShowLocationResults] = useState(false);

  const inputRef = useRef(null);

  // Search location by query
  const searchLocation = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setLocationResults([]);
      setShowLocationResults(false);
      return [];
    }

    try {
      setLocationStatus("searching");

      // Use local search function with vehicle data
      const results = searchLocationFromPricing(query, vehicleData);

      setLocationResults(results);
      setShowLocationResults(results.length > 0);
      setLocationStatus(results.length > 0 ? "idle" : "error");

      return results;
    } catch (error) {
      console.error("Error searching location:", error);
      setLocationStatus("error");
      setLocationResults([]);
      setShowLocationResults(false);
      return [];
    }
  }, [vehicleData]);

  // Handle location selection
  const handleLocationSelect = useCallback((feature) => {
    const formattedLocation = formatLocationString(feature);
    setLocation(formattedLocation);
    setLocationResults([]);
    setShowLocationResults(false);
    setLocationStatus("success");
    return formattedLocation;
  }, []);

  // Handle getting current location (mock implementation)
  const getCurrentLocation = useCallback(() => {
    setLocationStatus("searching");

    // Simulate geolocation API
    setTimeout(() => {
      // Mock success
      setLocation("Delhi, India");
      setLocationStatus("success");
      setLocationResults([]);
      setShowLocationResults(false);
    }, 1500);
  }, []);

  return {
    location,
    setLocation,
    locationStatus,
    setLocationStatus,
    locationResults,
    setLocationResults,
    showLocationResults,
    setShowLocationResults,
    searchLocation,
    handleLocationSelect,
    getCurrentLocation,
    inputRef,
  };
}
