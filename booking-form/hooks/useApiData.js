// Custom hook for API data fetching
import { useState, useEffect } from "react";
import { fetchVehicleData } from "../utils/api";

/**
 * Custom hook to fetch and manage API data
 * @param {string} apiUrl - Optional API URL override
 * @returns {object} API data state and utility functions
 */
export default function useApiData(apiUrl) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const vehicleData = await fetchVehicleData(apiUrl);
      setData(vehicleData);
    } catch (err) {
      console.error("Error in useApiData hook:", err);
      setError(err.message || "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Retry function
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Initial fetch and retry effect
  useEffect(() => {
    fetchData();
  }, [apiUrl, retryCount]);

  // Utility function to get vehicle price
  const getVehiclePrice = (vehicleId) => {
    if (!data || !data.pricing) return 0;
    const pricing = data.pricing.find(p => p.model_id === vehicleId);
    return pricing ? pricing.base_price : 0;
  };

  // Utility function to get variants for a vehicle
  const getVariantsForVehicle = (vehicleId) => {
    if (!data || !data.variants) return [];
    return data.variants.filter(v => v.model_id === vehicleId);
  };

  // Utility function to get colors for a vehicle
  const getColorsForVehicle = (vehicleId) => {
    if (!data || !data.colors) return [];
    return data.colors.filter(c => c.model_id === vehicleId);
  };

  // Utility function to get components for a vehicle
  const getComponentsForVehicle = (vehicleId) => {
    if (!data || !data.components) return [];
    return data.components.filter(c => c.model_id === vehicleId);
  };

  return {
    loading,
    error,
    data,
    retry,
    getVehiclePrice,
    getVariantsForVehicle,
    getColorsForVehicle,
    getComponentsForVehicle,
  };
}
