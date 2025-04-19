// Adapted from booking-form/4. context/1. BookingContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { staticData } from "../data/staticData"; // Import static data

// Create context
const BookingContext = createContext(null);

// Context provider component
export function BookingProvider({ children, debug = false }) {
  const enableLogging = debug;

  const debugLog = useCallback((...args) => {
    if (enableLogging) {
      console.log("BookingContext:", ...args);
    }
  }, [enableLogging]);

  // State for form data
  const [formData, setFormData] = useState({
    location: "",
    selectedVehicle: "",
    selectedVariant: "",
    selectedColor: "",
    optionalComponents: [],
    selectedTenure: "1year", // Default insurance tenure
    selectedProvider: "", // Insurance provider
    selectedCoreInsurance: [],
    selectedAdditionalCoverage: [],
    paymentMethod: "full-payment",
    loanTenure: 36,
    downPaymentAmount: 0,
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    termsAccepted: false,
    // Summary data (derived or set)
    totalPrice: 0,
    vehicleName: "",
    vehicleCode: "",
    bookingId: null, // To store booking ID on success
  });

  // State for errors
  const [errors, setErrors] = useState({});

  // State for vehicle data (loaded from static file)
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading
  const [apiError, setApiError] = useState(null); // Keep error state

  debugLog("Provider rendered. Initial formData:", formData);

  // Load static data on mount
  useEffect(() => {
    debugLog("useEffect: Loading static data...");
    setLoading(true);
    setApiError(null);
    try {
      setVehicleData(staticData);
      debugLog("Static data loaded:", staticData);

      // Initialize defaults after data is loaded
      if (staticData.models && staticData.models.length > 0) {
        const firstVehicle = staticData.models[0];
        const initialUpdates = {
          selectedVehicle: firstVehicle.id,
          vehicleName: firstVehicle.name,
          vehicleCode: firstVehicle.model_code || "",
        };

        // Set default variant, color, components, provider, insurance
        const defaultVariant = staticData.variants?.find(v => v.model_id === firstVehicle.id && v.is_default) || staticData.variants?.find(v => v.model_id === firstVehicle.id);
        if (defaultVariant) initialUpdates.selectedVariant = defaultVariant.id;

        const defaultColor = staticData.colors?.find(c => c.model_id === firstVehicle.id && c.is_default) || staticData.colors?.find(c => c.model_id === firstVehicle.id);
        if (defaultColor) initialUpdates.selectedColor = defaultColor.id;

        const requiredComponents = staticData.components?.filter(comp => comp.model_id === firstVehicle.id && comp.is_required).map(comp => comp.id) || [];
        initialUpdates.optionalComponents = requiredComponents;

        if (staticData.insurance_providers?.length > 0) initialUpdates.selectedProvider = staticData.insurance_providers[0].id;

        const requiredInsurance = staticData.insurance_plans?.filter(plan => plan.plan_type === "CORE" && plan.is_required).map(plan => plan.id) || [];
        initialUpdates.selectedCoreInsurance = requiredInsurance;

        // Update form data with all initial values
        setFormData(prev => ({ ...prev, ...initialUpdates }));
        debugLog("Initial formData defaults set:", initialUpdates);

      } else {
        debugLog("No models found in static data to set defaults.");
      }

    } catch (err) {
      debugLog("Error processing static data:", err);
      setApiError("Failed to load vehicle data.");
    } finally {
      setTimeout(() => { setLoading(false); debugLog("Loading finished."); }, 500); // Short delay
    }
  }, [debugLog]); // Run only once on mount

  // Update form data function
  const updateFormData = useCallback((data) => {
    debugLog("updateFormData called with:", data);
    setFormData((prevData) => {
      const newState = { ...prevData, ...data };
      // If vehicle changes, reset variant, color, components and set new defaults
      if (data.selectedVehicle && data.selectedVehicle !== prevData.selectedVehicle) {
          debugLog("Vehicle changed, resetting variant, color, components");
          const newVehicleId = data.selectedVehicle;
          const defaultVariant = staticData.variants?.find(v => v.model_id === newVehicleId && v.is_default) || staticData.variants?.find(v => v.model_id === newVehicleId);
          const defaultColor = staticData.colors?.find(c => c.model_id === newVehicleId && c.is_default) || staticData.colors?.find(c => c.model_id === newVehicleId);
          const requiredComponents = staticData.components?.filter(comp => comp.model_id === newVehicleId && comp.is_required).map(comp => comp.id) || [];
          const selectedVehicleData = staticData.models.find(m => m.id === newVehicleId);

          newState.selectedVariant = defaultVariant ? defaultVariant.id : "";
          newState.selectedColor = defaultColor ? defaultColor.id : "";
          newState.optionalComponents = requiredComponents;
          newState.vehicleName = selectedVehicleData ? selectedVehicleData.name : "";
          newState.vehicleCode = selectedVehicleData ? selectedVehicleData.model_code : "";
          // Also reset insurance selections? Maybe not, depends on requirements.
          // newState.selectedCoreInsurance = [];
          // newState.selectedAdditionalCoverage = [];
      }
      debugLog("Updated formData state:", newState);
      return newState;
    });

    // Clear errors for updated fields
    const fieldsToClearErrors = Object.keys(data);
    if (fieldsToClearErrors.length > 0) {
      setErrors((prevErrors) => {
        const clearedErrors = { ...prevErrors };
        let errorsCleared = false;
        fieldsToClearErrors.forEach((key) => {
          if (clearedErrors[key]) {
            delete clearedErrors[key];
            errorsCleared = true;
          }
        });
        if (errorsCleared) {
          debugLog("Errors cleared for fields:", fieldsToClearErrors);
          return clearedErrors;
        }
        return prevErrors;
      });
    }
  }, [debugLog]);

  // Calculate total price based on selections
  const calculateTotalPrice = useCallback(() => {
    if (!vehicleData) return 0;
    // debugLog("Calculating total price..."); // Reduce logging frequency

    let total = 0;
    const {
      selectedVehicle,
      selectedVariant,
      optionalComponents,
      selectedCoreInsurance,
      selectedAdditionalCoverage,
    } = formData;

    // Base vehicle price
    if (selectedVehicle && vehicleData.pricing) {
      const vehiclePricing = vehicleData.pricing.find(p => p.model_id === selectedVehicle);
      if (vehiclePricing) total += vehiclePricing.base_price || 0;
    }

    // Variant additional price
    if (selectedVariant && vehicleData.variants) {
      const variantData = vehicleData.variants.find(v => v.id === selectedVariant);
      if (variantData) total += variantData.price_addition || 0;
    }

    // Components prices
    if (optionalComponents?.length > 0 && vehicleData.components) {
      optionalComponents.forEach((compId) => {
        const component = vehicleData.components.find(c => c.id === compId);
        if (component) total += component.price || 0;
      });
    }

    // Insurance prices
    const allSelectedInsuranceIds = [
      ...(selectedCoreInsurance || []),
      ...(selectedAdditionalCoverage || []),
    ];
    if (allSelectedInsuranceIds.length > 0 && vehicleData.insurance_plans) {
      allSelectedInsuranceIds.forEach((planId) => {
        const plan = vehicleData.insurance_plans.find(p => p.id === planId);
        if (plan) total += plan.price || 0;
      });
    }

    // debugLog("Final calculated total:", total); // Reduce logging frequency
    return total;
  }, [formData, vehicleData]); // Removed debugLog dependency

   // Update total price in formData whenever dependencies change
   useEffect(() => {
    const newTotalPrice = calculateTotalPrice();
    if (newTotalPrice !== formData.totalPrice) {
      setFormData(prev => ({ ...prev, totalPrice: newTotalPrice }));
      // debugLog("Updated total price in formData:", newTotalPrice); // Reduce logging
    }
  }, [calculateTotalPrice, formData.totalPrice, formData.selectedVehicle, formData.selectedVariant, formData.optionalComponents, formData.selectedCoreInsurance, formData.selectedAdditionalCoverage]); // Added all dependencies


  // Context value
  const contextValue = {
    formData,
    updateFormData,
    errors,
    setErrors, // Expose setErrors for components to update validation state
    vehicleData,
    loading,
    apiError,
    calculateTotalPrice,
    debug: enableLogging,
  };

  // debugLog("Providing context value:", contextValue); // Reduce logging

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

// Custom hook to use the booking context
export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
