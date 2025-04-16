// VehicleConfiguration.tsx - Improved version

import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useRef } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import {
  LocationField,
  getLocationIcon,
} from "https://framer.com/m/LocationSearch-hr1w.js"
import VehicleCards from "https://framer.com/m/VehicleCards-mBlt.js"
import Button from "https://framer.com/m/Button-SLtw.js"
import VariantCard from "https://framer.com/m/VariantCard-5sVx.js"
import ColorSelector from "https://framer.com/m/ColorSelector-jPny.js"

export default function VehicleConfiguration(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],

    // API endpoint for data
    dataEndpoint = "https://booking-engine.sagarsiwach.workers.dev/",

    // Initial values
    location = "",
    selectedVehicleId = "",
    selectedVariantId = "",
    selectedColorId = "",
    selectedComponents = [],

    // Event handlers
    onNextStep,
    onLocationChange,
    onVehicleSelect,
    onVariantSelect,
    onColorSelect,
    onComponentSelect,
    onFormDataChange,

    // Form validation
    errors = {},

    // Component styling
    style,
    ...rest
  } = props

  // Local state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [locationValue, setLocationValue] = useState(location)
  const [vehicleValue, setVehicleValue] = useState(selectedVehicleId)
  const [variantValue, setVariantValue] = useState(selectedVariantId)
  const [colorValue, setColorValue] = useState(selectedColorId)
  const [componentValues, setComponentValues] = useState(selectedComponents)
  const [vehicleData, setVehicleData] = useState({
    models: [],
    variants: [],
    colors: [],
    components: [],
    pricing: [],
  })

  // Track active section
  const [activeSection, setActiveSection] = useState("location")

  // State for location search functionality
  const [locationStatus, setLocationStatus] = useState("idle")
  const [showLocationResults, setShowLocationResults] = useState(false)
  const [locationResults, setLocationResults] = useState([])
  const [focusedField, setFocusedField] = useState(null)
  const locationInputRef = useRef(null)

  // Refs for each section for scrolling
  const locationSectionRef = useRef(null)
  const vehicleSectionRef = useRef(null)
  const variantSectionRef = useRef(null)
  const colorSectionRef = useRef(null)
  const componentSectionRef = useRef(null)
  const summarySectionRef = useRef(null)

  // Processed data for display
  const vehicles = vehicleData.models || []

  // Get the currently selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.id === vehicleValue) || null

  // Get variants for selected vehicle
  const selectedVehicleVariants = vehicleData.variants
    ? vehicleData.variants.filter((v) => v.model_id === vehicleValue)
    : []

  // Get colors for selected vehicle
  const selectedVehicleColors = vehicleData.colors
    ? vehicleData.colors.filter((c) => c.model_id === vehicleValue)
    : []

  // Get components for selected vehicle
  const selectedVehicleComponents = vehicleData.components
    ? vehicleData.components.filter((c) => c.model_id === vehicleValue)
    : []

  // Fetch vehicle data on mount
  useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Add a cache-busting parameter to the URL
        const cacheBuster = `?t=${Date.now()}`
        const url = `${dataEndpoint}${cacheBuster}`

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

        // Get the response text first and log it
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

        if (result && result.status === "success" && result.data) {
          setVehicleData(result.data)
        } else {
          throw new Error("Invalid data format received from API")
        }
      } catch (err) {
        console.error("Error fetching vehicle data:", err)
        setError("Failed to load vehicle data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchVehicleData()
  }, [dataEndpoint])

  // Set default selection when vehicles load or change
  useEffect(() => {
    // If no vehicle is selected but we have vehicles, select the first one
    if (!vehicleValue && vehicles.length > 0) {
      setVehicleValue(vehicles[0].id)

      // Also notify parent component
      if (onVehicleSelect) {
        onVehicleSelect(vehicles[0].id)
      }
    }

    // If we have a vehicle selected but no variant, select the first variant
    if (
      vehicleValue &&
      !variantValue &&
      selectedVehicleVariants.length > 0
    ) {
      // Find default variant if available
      const defaultVariant =
        selectedVehicleVariants.find((v) => v.is_default) ||
        selectedVehicleVariants[0]
      setVariantValue(defaultVariant.id)
      if (onVariantSelect) onVariantSelect(defaultVariant.id)
    }

    // If we have a vehicle selected but no color, select the first color
    if (vehicleValue && !colorValue && selectedVehicleColors.length > 0) {
      // Find default color if available
      const defaultColor =
        selectedVehicleColors.find((c) => c.is_default) ||
        selectedVehicleColors[0]
      setColorValue(defaultColor.id)
      if (onColorSelect) onColorSelect(defaultColor.id)
    }
  }, [
    vehicleData,
    vehicleValue,
    selectedVehicleVariants,
    selectedVehicleColors,
  ])

  // Update form data on any field change
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        location: locationValue,
        vehicle: vehicleValue,
        variant: variantValue,
        color: colorValue,
        components: componentValues,
      })
    }
  }, [locationValue, vehicleValue, variantValue, colorValue, componentValues])

  // Effect to scroll to active section
  useEffect(() => {
    if (activeSection === "location" && locationSectionRef.current) {
      locationSectionRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (activeSection === "vehicle" && vehicleSectionRef.current) {
      vehicleSectionRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (activeSection === "variant" && variantSectionRef.current) {
      variantSectionRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (activeSection === "color" && colorSectionRef.current) {
      colorSectionRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (
      activeSection === "components" &&
      componentSectionRef.current
    ) {
      componentSectionRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (activeSection === "summary" && summarySectionRef.current) {
      summarySectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [activeSection])

  // Advance to next section
  const goToNextSection = () => {
    if (activeSection === "location") {
      if (locationValue) setActiveSection("vehicle")
    } else if (activeSection === "vehicle") {
      if (vehicleValue) setActiveSection("variant")
    } else if (activeSection === "variant") {
      if (variantValue) setActiveSection("color")
    } else if (activeSection === "color") {
      if (colorValue) setActiveSection("components")
    } else if (activeSection === "components") {
      setActiveSection("summary")
    }
  }

  // Handle location input change
  const handleLocationChange = (value) => {
    if (typeof value === "object" && value.target) {
      setLocationValue(value.target.value)
      if (onLocationChange) onLocationChange(value.target.value)
    } else {
      setLocationValue(value)
      if (onLocationChange) onLocationChange(value)
    }

    // Automatically move to next section when location is set
    if (value && typeof value === "string" && value.length > 0) {
      setTimeout(() => {
        setActiveSection("vehicle")
      }, 500)
    }
  }

  // Location search function for the LocationField component
  const searchLocation = async (query) => {
    try {
      // In a real implementation, this would call a geocoding API
      // For this demo, we'll simulate by searching through pricing data
      if (/^\d{6}$/.test(query)) {
        // If it's a 6-digit pincode, find matching locations
        const matchingLocations =
          vehicleData.pricing?.filter(
            (p) =>
              p.pincode_start <= parseInt(query) &&
              p.pincode_end >= parseInt(query)
          ) || []

        // Format results like Mapbox features for compatibility
        return matchingLocations.map((loc) => ({
          id: `loc-${loc.id}`,
          place_name: `${query}, ${loc.city || ""}, ${loc.state}, India`,
          place_type: ["postcode"],
          context: [
            { id: "postcode.123", text: query },
            { id: "place.123", text: loc.city || "" },
            { id: "region.123", text: loc.state },
          ],
          text: query,
        }))
      } else if (query.length >= 3) {
        // Simulate search based on city/state
        const matchingLocations =
          vehicleData.pricing?.filter(
            (p) =>
              (p.city &&
                p.city
                  .toLowerCase()
                  .includes(query.toLowerCase())) ||
              (p.state &&
                p.state
                  .toLowerCase()
                  .includes(query.toLowerCase()))
          ) || []

        return matchingLocations.map((loc) => ({
          id: `loc-${loc.id}`,
          place_name: `${loc.city || ""}, ${loc.state}, India`,
          place_type: ["place"],
          context: [
            { id: "place.123", text: loc.city || "" },
            { id: "region.123", text: loc.state },
          ],
          text: loc.city || loc.state,
        }))
      }

      return []
    } catch (error) {
      console.error("Error searching for location:", error)
      return null
    }
  }

  // Get current location (mock implementation)
  const getCurrentLocation = () => {
    setLocationStatus("searching")

    // Simulate geolocation API
    setTimeout(() => {
      // Mock success - set a default location
      setLocationValue("Delhi, India")
      setLocationStatus("success")

      // Move to next section after location is set
      setTimeout(() => {
        setActiveSection("vehicle")
      }, 500)
    }, 1500)
  }

  // Handle vehicle selection
  const handleVehicleSelect = (id) => {
    setVehicleValue(id)

    // Reset dependent selections when vehicle changes
    setVariantValue("")
    setColorValue("")
    setComponentValues([])

    if (onVehicleSelect) onVehicleSelect(id)

    // Automatically advance to variant section
    setTimeout(() => {
      setActiveSection("variant")
    }, 300)
  }

  // Handle variant selection
  const handleVariantSelect = (id) => {
    setVariantValue(id)
    if (onVariantSelect) onVariantSelect(id)

    // Automatically advance to color section
    setTimeout(() => {
      setActiveSection("color")
    }, 300)
  }

  // Handle color selection
  const handleColorSelect = (id) => {
    setColorValue(id)
    if (onColorSelect) onColorSelect(id)

    // Automatically advance to components section
    setTimeout(() => {
      setActiveSection("components")
    }, 300)
  }

  // Handle component selection
  const handleComponentSelect = (id, isSelected) => {
    // Get the component item
    const componentItem = selectedVehicleComponents.find(
      (item) => item.id === id
    )

    // If required, don't allow deselection
    if (componentItem && componentItem.is_required && !isSelected) {
      return
    }

    let newComponents

    if (isSelected) {
      newComponents = [...componentValues, id]
    } else {
      newComponents = componentValues.filter((cId) => cId !== id)
    }

    setComponentValues(newComponents)
    if (onComponentSelect) onComponentSelect(newComponents)
  }

  // Get price for a vehicle
  const getVehiclePrice = (vehicleId) => {
    if (!vehicleData.pricing) return null

    // Find matching price
    const pricing = vehicleData.pricing.find(
      (p) => p.model_id === vehicleId
    )
    return pricing ? `₹${pricing.base_price.toLocaleString("en-IN")}` : null
  }

  // Get total price for current selections
  const getTotalPrice = () => {
    let total = 0

    // Base vehicle price
    if (vehicleValue && vehicleData.pricing) {
      const vehiclePricing = vehicleData.pricing.find(
        (p) => p.model_id === vehicleValue
      )
      if (vehiclePricing) total += vehiclePricing.base_price || 0
    }

    // Variant additional price
    if (variantValue && selectedVehicleVariants) {
      const selectedVariant = selectedVehicleVariants.find(
        (v) => v.id === variantValue
      )
      if (selectedVariant) total += selectedVariant.price_addition || 0
    }

    // Components prices
    if (componentValues.length > 0 && selectedVehicleComponents) {
      componentValues.forEach((compId) => {
        const component = selectedVehicleComponents.find(
          (c) => c.id === compId
        )
        if (component) total += component.price || 0
      })
    }

    return total
  }

  // Handle next button click
  const handleNext = () => {
    setSubmitted(true)

    // Validation
    if (!locationValue) {
      setError({ ...error, location: "Please enter a location" })
      setActiveSection("location")
      return
    }

    if (!vehicleValue) {
      setActiveSection("vehicle")
      return
    }

    if (!variantValue) {
      setActiveSection("variant")
      return
    }

    if (!colorValue) {
      setActiveSection("color")
      return
    }

    // All validated, continue to next step
    if (onNextStep) onNextStep()
  }

  // Ensure required components are selected
  useEffect(() => {
    if (selectedVehicleComponents && selectedVehicleComponents.length > 0) {
      const requiredComponents = selectedVehicleComponents
        .filter((comp) => comp.is_required)
        .map((comp) => comp.id)

      // Add any missing required components
      if (requiredComponents.length > 0) {
        const newComponents = [...componentValues]
        let changed = false

        requiredComponents.forEach((compId) => {
          if (!componentValues.includes(compId)) {
            newComponents.push(compId)
            changed = true
          }
        })

        if (changed) {
          setComponentValues(newComponents)
        }
      }
    }
  }, [selectedVehicleComponents, componentValues])

  // Container styling
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflow: "auto",
    paddingBottom: "80px", // Add padding for bottom bar
    ...style,
  }

  const sectionStyle = {
    marginBottom: tokens.spacing[12],
    scrollMarginTop: "20px",
  }

  const sectionTitleStyle = {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.neutral[600],
    textTransform: "uppercase",
    marginBottom: tokens.spacing[3],
  }

  const buttonContainerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing[4],
    backgroundColor: "white",
    borderTop: `1px solid ${borderColor}`,
    zIndex: 100,
    width: "100%",
  }

  // Format price
  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`
  }

  // Determine if next button should be enabled
  const isNextEnabled =
    locationValue && vehicleValue && variantValue && colorValue

  // Loading state display
  if (loading) {
    return (
      <div style={containerStyle}>
        <div
          style={{ textAlign: "center", padding: tokens.spacing[8] }}
        >
          Loading vehicle information...
        </div>
      </div>
    )
  }

  // Error state display
  if (error && typeof error === "string") {
    return (
      <div style={containerStyle}>
        <div
          style={{
            padding: tokens.spacing[4],
            marginBottom: tokens.spacing[4],
            backgroundColor: tokens.colors.red[50],
            color: tokens.colors.red[700],
            borderRadius: tokens.borderRadius.DEFAULT,
            fontSize: tokens.fontSize.sm,
          }}
        >
          {error}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: tokens.spacing[4],
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: primaryColor,
              color: "white",
              border: "none",
              borderRadius: tokens.borderRadius.DEFAULT,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Map colors to the format expected by ColorSelector
  const colorOptions = selectedVehicleColors.map((color) => {
    let colorValue = "#f00027" // Default fallback

    try {
      if (color.color_value) {
        const parsed = JSON.parse(color.color_value)
        colorValue = parsed.colorStart || colorValue
      }
    } catch (e) {
      console.error("Error parsing color value:", e)
    }

    return {
      id: color.id,
      name: color.name,
      value: colorValue,
    }
  })

  // Group components by type
  const componentTypes = [
    ...new Set(selectedVehicleComponents.map((c) => c.component_type)),
  ]

  // Map component types to human-readable names
  const getComponentTypeName = (type) => {
    switch (type) {
      case "ACCESSORY":
        return "Accessories"
      case "PACKAGE":
        return "Packages"
      case "WARRANTY":
        return "Warranty"
      case "SERVICE":
        return "Servicing"
      default:
        return "Optional Components"
    }
  }

  // Get selected vehicle model code
  const getSelectedVehicleCode = () => {
    if (!selectedVehicle) return ""
    return selectedVehicle.model_code || ""
  }

  return (
    <div style={containerStyle} {...rest}>
      {/* Location Section */}
      <div
        ref={locationSectionRef}
        style={{
          ...sectionStyle,
          display: activeSection === "location" ? "block" : "none",
          height: activeSection === "location" ? "auto" : "0",
        }}
      >
        <div style={sectionTitleStyle}>LOCATION</div>
        <LocationField
          value={locationValue}
          onChange={handleLocationChange}
          onFocus={() => {
            setFocusedField("location")
            setActiveSection("location")
          }}
          onBlur={() => setFocusedField(null)}
          error={errors.location || ""}
          showError={submitted && !!errors.location}
          focusedField={focusedField}
          inputRef={locationInputRef}
          locationStatus={locationStatus}
          setLocationStatus={setLocationStatus}
          setLocationResults={setLocationResults}
          setShowLocationResults={setShowLocationResults}
          searchLocation={searchLocation}
          getCurrentLocation={getCurrentLocation}
          enableLocationServices={true}
          debugMode={false}
        />
      </div>

      {/* Vehicle Selection Section */}
      <div
        ref={vehicleSectionRef}
        style={{
          ...sectionStyle,
          display: activeSection === "vehicle" ? "block" : "none",
          height: activeSection === "vehicle" ? "auto" : "0",
        }}
      >
        <div style={sectionTitleStyle}>CHOOSE YOUR VEHICLE</div>
        {vehicles.map((vehicle) => (
          <VehicleCards
            key={vehicle.id}
            vehicleName={vehicle.name}
            vehicleImage={
              vehicle.image_url ||
              "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png"
            }
            price={
              getVehiclePrice(vehicle.id) || "Price on request"
            }
            isSelected={vehicle.id === vehicleValue}
            onClick={() => handleVehicleSelect(vehicle.id)}
            borderColor={borderColor}
            selectedBorderColor={primaryColor}
          />
        ))}
      </div>

      {/* Variant Selection Section - only show if a vehicle is selected */}
      <div
        ref={variantSectionRef}
        style={{
          ...sectionStyle,
          display:
            activeSection === "variant" &&
              selectedVehicleVariants.length > 0
              ? "block"
              : "none",
          height:
            activeSection === "variant" &&
              selectedVehicleVariants.length > 0
              ? "auto"
              : "0",
        }}
      >
        <div style={sectionTitleStyle}>CHOOSE VARIANT</div>
        {selectedVehicleVariants.map((variant) => (
          <VariantCard
            key={variant.id}
            title={variant.title}
            subtitle={variant.subtitle}
            description={variant.description}
            price={
              variant.price_addition > 0
                ? `₹${variant.price_addition.toLocaleString("en-IN")}`
                : ""
            }
            includedText={variant.is_default ? "Included" : ""}
            isSelected={variant.id === variantValue}
            onClick={() => handleVariantSelect(variant.id)}
            borderColor={borderColor}
            selectedBorderColor={primaryColor}
          />
        ))}
      </div>

      {/* Color Selection Section - only show if a vehicle is selected */}
      <div
        ref={colorSectionRef}
        style={{
          ...sectionStyle,
          display:
            activeSection === "color" &&
              selectedVehicleColors.length > 0
              ? "block"
              : "none",
          height:
            activeSection === "color" &&
              selectedVehicleColors.length > 0
              ? "auto"
              : "0",
        }}
      >
        <div style={sectionTitleStyle}>FINISH</div>
        {/* Display selected color name if any */}
        {colorValue && (
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: tokens.spacing[3],
              color: tokens.colors.neutral[900],
            }}
          >
            {selectedVehicleColors.find((c) => c.id === colorValue)
              ?.name || ""}
          </div>
        )}
        <ColorSelector
          colors={colorOptions}
          selectedColorId={colorValue}
          onChange={handleColorSelect}
        />
      </div>

      {/* Optional Components Section - grouped by component_type */}
      <div
        ref={componentSectionRef}
        style={{
          ...sectionStyle,
          display:
            activeSection === "components" &&
              componentTypes.length > 0
              ? "block"
              : "none",
          height:
            activeSection === "components" &&
              componentTypes.length > 0
              ? "auto"
              : "0",
        }}
      >
        {componentTypes.map((componentType) => {
          // Filter components for this type
          const componentsOfType = selectedVehicleComponents.filter(
            (c) => c.component_type === componentType
          )

          if (componentsOfType.length === 0) return null

          return (
            <div
              key={componentType}
              style={{ marginBottom: tokens.spacing[8] }}
            >
              <div style={sectionTitleStyle}>
                {getComponentTypeName(componentType)}
              </div>
              {componentsOfType.map((component) => (
                <VariantCard
                  key={component.id}
                  title={component.title}
                  subtitle={component.subtitle}
                  description={component.description}
                  price={
                    component.price > 0
                      ? `₹${component.price.toLocaleString("en-IN")}`
                      : ""
                  }
                  includedText={
                    component.is_required ? "Mandatory" : ""
                  }
                  isSelected={componentValues.includes(
                    component.id
                  )}
                  onClick={() => {
                    handleComponentSelect(
                      component.id,
                      !componentValues.includes(
                        component.id
                      )
                    )
                  }}
                  borderColor={borderColor}
                  selectedBorderColor={primaryColor}
                  style={{
                    opacity: component.is_required
                      ? 0.8
                      : 1,
                  }}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Summary Section */}
      <div
        ref={summarySectionRef}
        style={{
          ...sectionStyle,
          marginTop: tokens.spacing[12],
          marginBottom: tokens.spacing[12],
          display: activeSection === "summary" ? "block" : "none",
          height: activeSection === "summary" ? "auto" : "0",
        }}
      >
        <div
          style={{
            backgroundColor: tokens.colors.neutral[50],
            padding: tokens.spacing[6],
            borderRadius: tokens.borderRadius.md,
            marginBottom: tokens.spacing[8],
          }}
        >
          <div
            style={{
              fontSize: tokens.fontSize.xl,
              fontWeight: tokens.fontWeight.bold,
              marginBottom: tokens.spacing[4],
            }}
          >
            {selectedVehicle?.name || "Selected Vehicle"}
          </div>

          <div
            style={{
              fontSize: tokens.fontSize.sm,
              color: tokens.colors.neutral[600],
              marginBottom: tokens.spacing[1],
            }}
          >
            {getSelectedVehicleCode()}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: tokens.spacing[4],
            }}
          >
            <div>
              <div
                style={{
                  fontSize: tokens.fontSize.sm,
                  color: tokens.colors.neutral[600],
                }}
              >
                Delivery Location
              </div>
              <div
                style={{
                  fontSize: tokens.fontSize.base,
                  fontWeight: tokens.fontWeight.medium,
                }}
              >
                {locationValue || "Select Location"}
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: tokens.fontSize.xl,
                  fontWeight: tokens.fontWeight.bold,
                }}
              >
                {formatPrice(getTotalPrice())}
              </div>
              <div
                style={{
                  fontSize: tokens.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                EMI Starting from ₹499/mo
              </div>
              <div
                style={{
                  fontSize: tokens.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                Available with Zero Downpayment
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Next Button */}
      <div style={buttonContainerStyle}>
        <Button
          text="Select Insurance"
          rightIcon={true}
          onClick={handleNext}
          disabled={!isNextEnabled}
          primaryColor={primaryColor}
          variant="primary"
          width="100%"
        />
      </div>
    </div>
  )
}

addPropertyControls(VehicleConfiguration, {
  primaryColor: {
    type: ControlType.Color,
    title: "Primary Color",
    defaultValue: tokens.colors.blue[600],
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background Color",
    defaultValue: tokens.colors.neutral[50],
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: tokens.colors.neutral[200],
  },
  dataEndpoint: {
    type: ControlType.String,
    title: "Data Endpoint",
    defaultValue: "https://booking-engine.sagarsiwach.workers.dev/",
  },
  location: {
    type: ControlType.String,
    title: "Location",
    defaultValue: "",
  },
  selectedVehicleId: {
    type: ControlType.String,
    title: "Selected Vehicle",
    defaultValue: "",
  },
  selectedVariantId: {
    type: ControlType.String,
    title: "Selected Variant",
    defaultValue: "",
  },
  selectedColorId: {
    type: ControlType.String,
    title: "Selected Color",
    defaultValue: "",
  },
  selectedComponents: {
    type: ControlType.Array,
    title: "Selected Components",
    control: { type: ControlType.String },
    defaultValue: [],
  },
  errors: {
    type: ControlType.Object,
    title: "Errors",
    defaultValue: {},
  },
})
