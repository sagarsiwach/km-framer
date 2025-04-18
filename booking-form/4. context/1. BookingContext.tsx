// context/BookingContext.jsx
// Replace imports with:
import { createContext, useContext, useState, useEffect } from "react"
import { fetchVehicleData } from "https://framer.com/m/api-A6AK.js"

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

  // Fetch vehicle data on mount
  useEffect(() => {
    const loadVehicleData = async () => {
      setLoading(true)
      setApiError(null)

      try {
        const data = await fetchVehicleData(apiBaseUrl)
        setVehicleData(data)

        // Initialize default selected vehicle if available
        if (data?.models && data.models.length > 0) {
          const firstVehicle = data.models[0]
          updateFormData({
            selectedVehicle: firstVehicle.id,
            vehicleName: firstVehicle.name,
            vehicleCode: firstVehicle.model_code,
          })

          // Set initial price if available
          const vehiclePricing = data.pricing?.find(
            (p) => p.model_id === firstVehicle.id
          )

          if (vehiclePricing) {
            updateFormData({
              totalPrice: vehiclePricing.base_price || 0,
            })
          }
        }
      } catch (err) {
        console.error("Error fetching vehicle data:", err)
        setApiError(
          "Failed to load vehicle data. Please try refreshing the page."
        )
      } finally {
        setLoading(false)
      }
    }

    loadVehicleData()
  }, [apiBaseUrl])

  // Update form data
  const updateFormData = (data) => {
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }))

    // Clear any errors for updated fields
    const clearedErrors = { ...errors }
    Object.keys(data).forEach((key) => {
      if (clearedErrors[key]) {
        delete clearedErrors[key]
      }
    })

    setErrors(clearedErrors)
  }

  // Get vehicle name from ID
  const getVehicleName = (vehicleId) => {
    if (!vehicleData?.models) return ""
    const vehicle = vehicleData.models.find((v) => v.id === vehicleId)
    return vehicle ? vehicle.name : ""
  }

  // Get vehicle price from ID
  const getVehiclePrice = (vehicleId) => {
    if (!vehicleData || !vehicleData.pricing) return 0

    const pricing = vehicleData.pricing.find(
      (p) => p.model_id === vehicleId
    )
    return pricing ? pricing.base_price : 0
  }

  // Calculate total price including all selections
  const calculateTotalPrice = () => {
    let total = 0

    // Base vehicle price
    if (formData.selectedVehicle && vehicleData?.pricing) {
      const vehiclePricing = vehicleData.pricing.find(
        (p) => p.model_id === formData.selectedVehicle
      )
      if (vehiclePricing) total += vehiclePricing.base_price || 0
    }

    // Variant additional price
    if (formData.selectedVariant && vehicleData?.variants) {
      const selectedVariant = vehicleData.variants.find(
        (v) => v.id === formData.selectedVariant
      )
      if (selectedVariant) total += selectedVariant.price_addition || 0
    }

    // Components prices
    if (formData.optionalComponents.length > 0 && vehicleData?.components) {
      formData.optionalComponents.forEach((compId) => {
        const component = vehicleData.components.find(
          (c) => c.id === compId
        )
        if (component) total += component.price || 0
      })
    }

    // Insurance prices
    if (
      formData.selectedCoreInsurance.length > 0 &&
      vehicleData?.insurance_plans
    ) {
      formData.selectedCoreInsurance.forEach((id) => {
        const plan = vehicleData.insurance_plans.find(
          (p) => p.id === id
        )
        if (plan) total += plan.price || 0
      })
    }

    if (
      formData.selectedAdditionalCoverage.length > 0 &&
      vehicleData?.insurance_plans
    ) {
      formData.selectedAdditionalCoverage.forEach((id) => {
        const plan = vehicleData.insurance_plans.find(
          (p) => p.id === id
        )
        if (plan) total += plan.price || 0
      })
    }

    return total
  }

  // Get variants for a vehicle
  const getVariantsForVehicle = (vehicleId) => {
    if (!vehicleData?.variants) return []
    return vehicleData.variants.filter((v) => v.model_id === vehicleId)
  }

  // Get colors for a vehicle
  const getColorsForVehicle = (vehicleId) => {
    if (!vehicleData?.colors) return []
    return vehicleData.colors.filter((c) => c.model_id === vehicleId)
  }

  // Get components for a vehicle
  const getComponentsForVehicle = (vehicleId) => {
    if (!vehicleData?.components) return []
    return vehicleData.components.filter((c) => c.model_id === vehicleId)
  }

  // Get insurance plans
  const getInsurancePlans = (type = null) => {
    if (!vehicleData?.insurance_plans) return []
    if (type) {
      return vehicleData.insurance_plans.filter(
        (plan) => plan.plan_type === type
      )
    }
    return vehicleData.insurance_plans
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
    getVehicleName,
    getVehiclePrice,
    calculateTotalPrice,
    getVariantsForVehicle,
    getColorsForVehicle,
    getComponentsForVehicle,
    getInsurancePlans,
  }

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
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

export default BookingContext
