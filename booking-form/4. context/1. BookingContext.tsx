// context/BookingContext.jsx - Step 2.1: Add Logging
import { createContext, useContext, useState, useEffect } from "react"
import {
  fetchVehicleData,
  processPayment,
  searchLocationFromPricing,
  sendOTP,
  submitBooking,
  verifyOTP,
} from "https://framer.com/m/api-A6AK.js"

// Create context
const BookingContext = createContext(null)

// Context provider component
export function BookingProvider({ children, apiBaseUrl }) {
  // State for form data
  const [formData, setFormData] = useState({
    // Vehicle Configuration data
    location: "",
    selectedVehicle: "",
    selectedVariant: "",
    selectedColor: "",
    optionalComponents: [],

    // Insurance data
    selectedTenure: "",
    selectedProvider: "",
    selectedCoreInsurance: [],
    selectedAdditionalCoverage: [],

    // Financing data
    paymentMethod: "full-payment",
    loanTenure: 36,
    downPaymentAmount: 0,

    // User information
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // Vehicle summary data
    totalPrice: 0,
    vehicleName: "",
    vehicleCode: "",
  })

  // State for errors
  const [errors, setErrors] = useState({})

  // State for vehicle data
  const [vehicleData, setVehicleData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  console.log("BookingContext: Component rendered")
  console.log("BookingContext: Current formData state:", formData)

  // Fetch vehicle data on mount
  useEffect(() => {
    console.log("BookingContext: useEffect triggered")
    const loadVehicleData = async () => {
      console.log("BookingContext: loadVehicleData starting...")
      setLoading(true)
      setApiError(null)
      setVehicleData(null) // Clear previous data on effect run

      try {
        console.log(
          `BookingContext: Calling fetchVehicleData with apiBaseUrl: ${apiBaseUrl}`
        )
        // **NOTE:** The API.js you provided has a hardcoded API_BASE_URL inside fetchApi.
        // The `apiBaseUrl` prop passed here is likely ignored by the fetchApi function itself.
        // We will test if fetchVehicleData *is called* and what it returns.
        const data = await fetchVehicleData(apiBaseUrl) // Pass prop, though API might ignore it

        console.log("BookingContext: fetchVehicleData returned:", data)

        // Expecting 'data' to be the object { models: [...], variants: [...], ... }
        if (data && data.models) {
          setVehicleData(data)
          console.log("BookingContext: vehicleData state updated.")

          // Initialize default selected vehicle if available
          if (data.models.length > 0) {
            const firstVehicle = data.models[0]
            console.log(
              "BookingContext: Initializing with first vehicle:",
              firstVehicle
            )
            const initialFormData = {
              selectedVehicle: firstVehicle.id,
              vehicleName: firstVehicle.name,
              vehicleCode: firstVehicle.model_code,
            }

            // Set initial price if available
            const vehiclePricing = data.pricing?.find(
              (p) => p.model_id === firstVehicle.id
            )

            if (vehiclePricing) {
              console.log(
                "BookingContext: Found pricing for initial vehicle:",
                vehiclePricing
              )
              initialFormData.totalPrice =
                vehiclePricing.base_price || 0
            } else {
              console.warn(
                `BookingContext: No pricing found for initial vehicle ID ${firstVehicle.id}`
              )
            }

            updateFormData(initialFormData) // Use updateFormData to merge
            console.log(
              "BookingContext: Initial formData updated via updateFormData."
            )
          } else {
            console.warn(
              "BookingContext: API returned models array but it's empty."
            )
            setApiError("No vehicle models available.")
          }
        } else if (data && data.status === "success" && data.data) {
          // This case handles if fetchVehicleData returned the outer { status, data } structure
          console.warn(
            "BookingContext: fetchVehicleData returned outer structure. Using data.data"
          )
          setVehicleData(data.data) // Use the nested data
          // Re-run initialization with nested data structure
          const innerData = data.data
          if (innerData?.models && innerData.models.length > 0) {
            const firstVehicle = innerData.models[0]
            console.log(
              "BookingContext: Initializing with first vehicle from data.data:",
              firstVehicle
            )
            const initialFormData = {
              selectedVehicle: firstVehicle.id,
              vehicleName: firstVehicle.name,
              vehicleCode: firstVehicle.model_code,
            }
            const vehiclePricing = innerData.pricing?.find(
              (p) => p.model_id === firstVehicle.id
            )

            if (vehiclePricing) {
              console.log(
                "BookingContext: Found pricing for initial vehicle (data.data):",
                vehiclePricing
              )
              initialFormData.totalPrice =
                vehiclePricing.base_price || 0
            } else {
              console.warn(
                `BookingContext: No pricing found for initial vehicle ID ${firstVehicle.id} (data.data)`
              )
            }
            updateFormData(initialFormData)
            console.log(
              "BookingContext: Initial formData updated via updateFormData (data.data)."
            )
          } else {
            console.warn(
              "BookingContext: API returned data.data but models array is empty or missing."
            )
            setApiError("No vehicle models available in data.data.")
          }
        } else {
          console.error(
            "BookingContext: API response missing expected 'data' or 'models' property or success status:",
            data
          )
          setApiError("Invalid data format received from API.")
        }
      } catch (err) {
        console.error(
          "BookingContext: Error during fetch or initialization:",
          err
        )
        setApiError(
          `Failed to load vehicle data: ${err.message || err}`
        )
      } finally {
        setLoading(false)
        console.log("BookingContext: loadVehicleData finished.")
      }
    }

    loadVehicleData()
    // Note: dependency array includes apiBaseUrl as it's used in the effect
    // and it's a prop, so if it changes, we should refetch.
  }, [apiBaseUrl]) // Add apiBaseUrl to dependencies

  // Use a separate effect or memoization for total price calculation
  // to avoid re-running it on every formData change unless relevant properties change
  useEffect(() => {
    console.log(
      "BookingContext: formData changed, recalculating total price..."
    )
    const newTotalPrice = calculateTotalPrice()
    console.log("BookingContext: New total price:", newTotalPrice)
    // Only update state if price actually changed to avoid infinite loops
    if (formData.totalPrice !== newTotalPrice) {
      // Use setFormData directly here to avoid triggering the price calculation effect again
      // Be careful: this approach requires manually merging if you only want to update totalPrice
      setFormData((prevData) => ({
        ...prevData,
        totalPrice: newTotalPrice,
      }))
      console.log("BookingContext: totalPrice updated in formData.")
    }
  }, [
    formData.selectedVehicle,
    formData.selectedVariant,
    formData.optionalComponents,
    formData.selectedCoreInsurance,
    formData.selectedAdditionalCoverage,
    vehicleData, // Recalculate if vehicle data itself changes (e.g., after initial load)
    // Also need to include other relevant data from vehicleData like pricing, variants, components
    // This dependency array can get complex. A simpler approach might be to calculate price
    // directly in the component that *displays* it or call calculateTotalPrice
    // whenever formData or vehicleData updates that affect price occur.
    // For now, keeping it simple and recalculating whenever price-relevant formData changes
    // and when vehicleData initially loads. Adding vehicleData, vehicleData.pricing, etc.
    // to the dependency array is safer if those values can change after initial fetch.
    // Let's add the specific vehicleData parts needed for calculation.
    vehicleData?.pricing,
    vehicleData?.variants,
    vehicleData?.components,
    vehicleData?.insurance_plans,
  ])

  // Update form data
  const updateFormData = (data) => {
    console.log("BookingContext: updateFormData called with:", data)
    setFormData((prevData) => {
      console.log(
        "BookingContext: setFormData updating from",
        prevData,
        "with",
        data
      )
      const newState = {
        ...prevData,
        ...data,
      }
      console.log("BookingContext: new formData state will be", newState)
      return newState
    })

    // Clear any errors for updated fields
    const fieldsToClearErrors = Object.keys(data)
    if (fieldsToClearErrors.length > 0) {
      console.log(
        "BookingContext: Clearing errors for fields:",
        fieldsToClearErrors
      )
      setErrors((prevErrors) => {
        const clearedErrors = { ...prevErrors }
        let errorsCleared = false
        fieldsToClearErrors.forEach((key) => {
          if (clearedErrors[key]) {
            delete clearedErrors[key]
            errorsCleared = true
          }
        })
        // Only update state if errors were actually cleared
        if (errorsCleared) {
          console.log(
            "BookingContext: Errors cleared:",
            clearedErrors
          )
          return clearedErrors
        }
        console.log(
          "BookingContext: No errors to clear for these fields."
        )
        return prevErrors // No change needed
      })
    } else {
      console.log(
        "BookingContext: updateFormData called with empty data, no errors cleared."
      )
    }
  }

  // Get vehicle name from ID
  const getVehicleName = (vehicleId) => {
    // Added logging and safety checks
    if (!vehicleData?.models) {
      console.warn(
        `BookingContext: getVehicleName called before vehicleData.models is available or is not an array for ID: ${vehicleId}`
      )
      return ""
    }
    console.log(
      `BookingContext: Searching for vehicle ID ${vehicleId} in vehicleData.models`
    )
    const vehicle = vehicleData.models.find((v) => v.id === vehicleId)
    console.log(
      `BookingContext: Found vehicle: ${vehicle ? vehicle.name : "None"}`
    )
    return vehicle ? vehicle.name : ""
  }

  // Get vehicle price from ID (Base price only)
  const getVehiclePrice = (vehicleId) => {
    // Added logging and safety checks
    if (!vehicleData || !vehicleData.pricing) {
      console.warn(
        `BookingContext: getVehiclePrice called before vehicleData or vehicleData.pricing is available for ID: ${vehicleId}`
      )
      return 0
    }
    console.log(
      `BookingContext: Searching for pricing for model ID ${vehicleId} in vehicleData.pricing`
    )

    const pricing = vehicleData.pricing.find(
      (p) => p.model_id === vehicleId
    )
    console.log(
      `BookingContext: Found pricing: ${pricing ? pricing.base_price : "None"}`
    )
    return pricing ? pricing.base_price : 0
  }

  // Calculate total price including all selections
  const calculateTotalPrice = () => {
    console.log("BookingContext: Calculating total price...")
    console.log(
      "BookingContext: Current formData for calculation:",
      formData
    )
    console.log(
      "BookingContext: Current vehicleData for calculation:",
      vehicleData
    )

    let total = 0

    // Base vehicle price
    if (formData.selectedVehicle && vehicleData?.pricing) {
      const vehiclePricing = vehicleData.pricing.find(
        (p) => p.model_id === formData.selectedVehicle
      )
      if (vehiclePricing) {
        total += vehiclePricing.base_price || 0
        console.log(
          `BookingContext: Added base price for vehicle ${formData.selectedVehicle}: ${vehiclePricing.base_price}`
        )
      } else {
        console.warn(
          `BookingContext: Pricing not found for selected vehicle ID ${formData.selectedVehicle} during calculation.`
        )
      }
    } else {
      console.log(
        "BookingContext: No selected vehicle or pricing data for base price calculation."
      )
    }

    // Variant additional price
    if (formData.selectedVariant && vehicleData?.variants) {
      const selectedVariant = vehicleData.variants.find(
        (v) => v.id === formData.selectedVariant
      )
      if (selectedVariant) {
        total += selectedVariant.price_addition || 0
        console.log(
          `BookingContext: Added variant price addition for variant ${formData.selectedVariant}: ${selectedVariant.price_addition}`
        )
      } else {
        console.warn(
          `BookingContext: Selected variant ID ${formData.selectedVariant} not found in vehicleData.variants during calculation.`
        )
      }
    } else {
      console.log(
        "BookingContext: No selected variant or variant data for price addition calculation."
      )
    }

    // Components prices
    if (formData.optionalComponents.length > 0 && vehicleData?.components) {
      formData.optionalComponents.forEach((compId) => {
        const component = vehicleData.components.find(
          (c) => c.id === compId
        )
        if (component) {
          total += component.price || 0
          console.log(
            `BookingContext: Added component price for ID ${compId}: ${component.price}`
          )
        } else {
          console.warn(
            `BookingContext: Selected component ID ${compId} not found in vehicleData.components during calculation.`
          )
        }
      })
    } else {
      console.log(
        "BookingContext: No selected components or component data for price calculation."
      )
    }

    // Insurance prices (Core and Additional - assuming they have 'price' and are in vehicleData.insurance_plans)
    // NOTE: Your API response shows insurance_plans. Need to verify if CORE/ADDITIONAL separation exists there
    // based on 'plan_type'. Let's calculate based on the IDs selected in formData
    // by looking up in the main vehicleData.insurance_plans array.

    const allSelectedInsuranceIds = [
      ...(formData.selectedCoreInsurance || []), // Ensure they are arrays
      ...(formData.selectedAdditionalCoverage || []),
    ]

    if (
      allSelectedInsuranceIds.length > 0 &&
      vehicleData?.insurance_plans
    ) {
      allSelectedInsuranceIds.forEach((planId) => {
        const plan = vehicleData.insurance_plans.find(
          (p) => p.id === planId
        )
        if (plan) {
          total += plan.price || 0
          console.log(
            `BookingContext: Added insurance plan price for ID ${planId} (${plan.title}): ${plan.price}`
          )
        } else {
          console.warn(
            `BookingContext: Selected insurance plan ID ${planId} not found in vehicleData.insurance_plans during calculation.`
          )
        }
      })
    } else {
      console.log(
        "BookingContext: No selected insurance plans or insurance plan data for price calculation."
      )
    }

    console.log("BookingContext: Final calculated total:", total)
    return total
  }

  // Get variants for a vehicle
  const getVariantsForVehicle = (vehicleId) => {
    if (!vehicleData?.variants) {
      console.warn(
        `BookingContext: getVariantsForVehicle called before vehicleData.variants is available or is not an array for vehicle ID: ${vehicleId}`
      )
      return []
    }
    console.log(
      `BookingContext: Filtering variants for vehicle ID: ${vehicleId}`
    )
    const variants = vehicleData.variants.filter(
      (v) => v.model_id === vehicleId
    )
    console.log(
      `BookingContext: Found ${variants.length} variants for vehicle ID ${vehicleId}.`
    )
    return variants
  }

  // Get colors for a vehicle
  const getColorsForVehicle = (vehicleId) => {
    if (!vehicleData?.colors) {
      console.warn(
        `BookingContext: getColorsForVehicle called before vehicleData.colors is available or is not an array for vehicle ID: ${vehicleId}`
      )
      return []
    }
    console.log(
      `BookingContext: Filtering colors for vehicle ID: ${vehicleId}`
    )
    const colors = vehicleData.colors.filter(
      (c) => c.model_id === vehicleId
    )
    console.log(
      `BookingContext: Found ${colors.length} colors for vehicle ID ${vehicleId}.`
    )
    return colors
  }

  // Get components for a vehicle
  const getComponentsForVehicle = (vehicleId) => {
    if (!vehicleData?.components) {
      console.warn(
        `BookingContext: getComponentsForVehicle called before vehicleData.components is available or is not an array for vehicle ID: ${vehicleId}`
      )
      return []
    }
    console.log(
      `BookingContext: Filtering components for vehicle ID: ${vehicleId}`
    )
    const components = vehicleData.components.filter(
      (c) => c.model_id === vehicleId
    )
    console.log(
      `BookingContext: Found ${components.length} components for vehicle ID ${vehicleId}.`
    )
    return components
  }

  // Get insurance plans
  const getInsurancePlans = (type = null) => {
    if (!vehicleData?.insurance_plans) {
      console.warn(
        `BookingContext: getInsurancePlans called before vehicleData.insurance_plans is available or is not an array.`
      )
      return []
    }
    console.log(
      `BookingContext: Filtering insurance plans by type: ${type}`
    )
    if (type) {
      const plans = vehicleData.insurance_plans.filter(
        (plan) => plan.plan_type === type
      )
      console.log(
        `BookingContext: Found ${plans.length} plans for type ${type}.`
      )
      return plans
    }
    console.log(
      `BookingContext: Returning all ${vehicleData.insurance_plans.length} insurance plans.`
    )
    return vehicleData.insurance_plans
  }

  // Context value
  const contextValue = {
    formData,
    updateFormData, // Function to update form data
    errors,
    setErrors, // Function to set errors
    vehicleData, // Raw fetched data
    loading, // Is context loading initial data?
    apiError, // Any API error during initial fetch
    getVehicleName, // Helper to get vehicle name by ID
    getVehiclePrice, // Helper to get base vehicle price by ID
    calculateTotalPrice, // Helper to calculate current total price
    getVariantsForVehicle, // Helper to get variants by vehicle ID
    getColorsForVehicle, // Helper to get colors by vehicle ID
    getComponentsForVehicle, // Helper to get components by vehicle ID
    getInsurancePlans, // Helper to get insurance plans (optionally filtered by type)
    // Add other helper functions if needed by steps
    // e.g., getPricingByLocation, getFinanceOptions, etc.
  }

  console.log("BookingContext: Providing context value:", contextValue)

  return (
    <BookingContext.Provider value={contextValue}>
      {/* The children prop is the content inside <BookingProvider> in BookingForm.jsx */}
      {children}
    </BookingContext.Provider>
  )
}

// Custom hook to use the booking context
export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    // This error occurs if useBooking is called outside of a component
    // that is rendered *inside* the BookingProvider.
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}

// Export the context itself (less common to use directly than the hook)
export default BookingContext
