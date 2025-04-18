// BookingContext.js - Complete with Debugging Controls
import { createContext, useContext, useState, useEffect } from "react"

// Create context
const BookingContext = createContext(null)

// Context provider component
export function BookingProvider({ children, apiBaseUrl, debug = false }) {
  // Debug config
  const enableLogging = debug || false

  // Log with conditional debug
  const debugLog = (...args) => {
    if (enableLogging) {
      console.log("BookingContext:", ...args)
    }
  }

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

  debugLog("Component rendered")
  debugLog("Current formData state:", formData)

  // Fetch vehicle data on mount
  useEffect(() => {
    debugLog("useEffect triggered for data fetching")
    const loadVehicleData = async () => {
      debugLog("loadVehicleData starting...")
      setLoading(true)
      setApiError(null)
      setVehicleData(null) // Clear previous data on effect run

      try {
        debugLog(
          `Calling fetchVehicleData with apiBaseUrl: ${apiBaseUrl}`
        )

        // Add cache-busting parameter to the URL
        const cacheBuster = `?t=${Date.now()}`
        const url = `${apiBaseUrl}${cacheBuster}`

        // Fetch with explicit headers
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "omit",
        })

        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status}`
          )
        }

        // Get the response text first for more reliable parsing
        const responseText = await response.text()

        if (!responseText || responseText.trim() === "") {
          throw new Error("Empty response received")
        }

        // Then parse the JSON
        let result
        try {
          result = JSON.parse(responseText)
        } catch (parseError) {
          throw new Error(
            `Failed to parse response: ${parseError.message}`
          )
        }

        debugLog("API response:", result)

        // Check for API response shape
        if (result && result.status === "success" && result.data) {
          setVehicleData(result.data)
          debugLog("vehicleData state updated.")

          // Initialize default selected vehicle if available
          if (result.data.models && result.data.models.length > 0) {
            const firstVehicle = result.data.models[0]
            debugLog(
              "Initializing with first vehicle:",
              firstVehicle
            )

            const initialFormData = {
              selectedVehicle: firstVehicle.id,
              vehicleName: firstVehicle.name,
              vehicleCode: firstVehicle.model_code || "",
            }

            // Set initial price if available
            const vehiclePricing = result.data.pricing?.find(
              (p) => p.model_id === firstVehicle.id
            )

            if (vehiclePricing) {
              debugLog(
                "Found pricing for initial vehicle:",
                vehiclePricing
              )
              initialFormData.totalPrice =
                vehiclePricing.base_price || 0
            } else {
              debugLog(
                `No pricing found for initial vehicle ID ${firstVehicle.id}`
              )
            }

            updateFormData(initialFormData) // Use updateFormData to merge
            debugLog("Initial formData updated via updateFormData.")
          } else {
            debugLog(
              "API returned models array but it's empty or missing."
            )
          }
        } else {
          throw new Error("Invalid data format received from API.")
        }
      } catch (err) {
        debugLog("Error during fetch or initialization:", err)
        setApiError(
          `Failed to load vehicle data: ${err.message || String(err)}`
        )
      } finally {
        setLoading(false)
        debugLog("loadVehicleData finished.")
      }
    }

    loadVehicleData()
  }, [apiBaseUrl, enableLogging])

  // Update form data
  const updateFormData = (data) => {
    debugLog("updateFormData called with:", data)

    setFormData((prevData) => {
      const newState = { ...prevData, ...data }
      debugLog("Updated formData state:", newState)
      return newState
    })

    // Clear any errors for updated fields
    const fieldsToClearErrors = Object.keys(data)
    if (fieldsToClearErrors.length > 0) {
      debugLog("Clearing errors for fields:", fieldsToClearErrors)

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
          debugLog("Errors cleared:", clearedErrors)
          return clearedErrors
        }

        return prevErrors // No change needed
      })
    }
  }

  // Calculate total price including all selections
  const calculateTotalPrice = () => {
    debugLog("Calculating total price...")

    let total = 0

    // Base vehicle price
    if (formData.selectedVehicle && vehicleData?.pricing) {
      const vehiclePricing = vehicleData.pricing.find(
        (p) => p.model_id === formData.selectedVehicle
      )

      if (vehiclePricing) {
        total += vehiclePricing.base_price || 0
        debugLog(
          `Added base price for vehicle ${formData.selectedVehicle}: ${vehiclePricing.base_price}`
        )
      }
    }

    // Variant additional price
    if (formData.selectedVariant && vehicleData?.variants) {
      const selectedVariant = vehicleData.variants.find(
        (v) => v.id === formData.selectedVariant
      )

      if (selectedVariant) {
        total += selectedVariant.price_addition || 0
        debugLog(
          `Added variant price for ${formData.selectedVariant}: ${selectedVariant.price_addition}`
        )
      }
    }

    // Components prices
    if (formData.optionalComponents.length > 0 && vehicleData?.components) {
      formData.optionalComponents.forEach((compId) => {
        const component = vehicleData.components.find(
          (c) => c.id === compId
        )

        if (component) {
          total += component.price || 0
          debugLog(
            `Added component price for ${compId}: ${component.price}`
          )
        }
      })
    }

    // Insurance prices
    const allSelectedInsuranceIds = [
      ...(formData.selectedCoreInsurance || []),
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
          debugLog(
            `Added insurance plan price for ${planId}: ${plan.price}`
          )
        }
      })
    }

    debugLog("Final calculated total:", total)
    return total
  }

  // Context value
  const contextValue = {
    formData,
    updateFormData,
    errors,
    setErrors,
    vehicleData,
    loading,
    apiError,
    calculateTotalPrice,

    // Debug info
    debug: enableLogging,
  }

  debugLog("Providing context value:", contextValue)

  return (
    <BookingContext.Provider value={contextValue}>
      {typeof children === "function" ? children(contextValue) : children}
    </BookingContext.Provider>
  )
}

// Custom hook to use the booking context
export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}

// Export the context itself
export default BookingContext
