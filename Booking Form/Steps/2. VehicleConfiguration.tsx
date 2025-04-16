// VehicleConfiguration.tsx
// Updated to fetch real data from the API

import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import InputField from "https://framer.com/m/InputField-d7w7.js"
import VehicleCards from "https://framer.com/m/VehicleCards-mBlt.js"
import Button from "https://framer.com/m/Button-SLtw.js"
import VariantCard from "https://framer.com/m/VariantCard-5sVx.js"
import ColorSelector from "https://framer.com/m/ColorSelector-jPny.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
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
  })

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
  // Fetch vehicle data on mount
  useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Add a cache-busting parameter to the URL
        const cacheBuster = `?t=${Date.now()}`
        const url = `${dataEndpoint}${cacheBuster}`
        console.log("Fetching from URL:", url)

        // Fetch with explicit headers
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          // Ensure credentials are not sent
          credentials: "omit",
        })

        console.log(
          "VehicleConfiguration API Response Status:",
          response.status,
          response.statusText
        )

        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status}`
          )
        }

        // Get the response text first and log it
        const responseText = await response.text()
        console.log(
          "VehicleConfiguration API Response Text Length:",
          responseText.length
        )
        console.log(
          "VehicleConfiguration API Response Text Preview:",
          responseText.substring(0, 100) + "..."
        )

        if (!responseText || responseText.trim() === "") {
          throw new Error("Empty response received")
        }

        // Then parse the JSON
        let result
        try {
          result = JSON.parse(responseText)
          console.log("VehicleConfiguration Parsed Result:", result)
        } catch (parseError) {
          console.error(
            "VehicleConfiguration JSON Parse Error:",
            parseError
          )
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
      setVariantValue(selectedVehicleVariants[0].id)
      if (onVariantSelect) onVariantSelect(selectedVehicleVariants[0].id)
    }

    // If we have a vehicle selected but no color, select the first color
    if (vehicleValue && !colorValue && selectedVehicleColors.length > 0) {
      setColorValue(selectedVehicleColors[0].id)
      if (onColorSelect) onColorSelect(selectedVehicleColors[0].id)
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

  // Handle location input change
  const handleLocationChange = (value) => {
    setLocationValue(value)
    if (onLocationChange) onLocationChange(value)
  }

  // Handle vehicle selection
  const handleVehicleSelect = (id) => {
    setVehicleValue(id)

    // Reset dependent selections when vehicle changes
    setVariantValue("")
    setColorValue("")
    setComponentValues([])

    if (onVehicleSelect) onVehicleSelect(id)
  }

  // Handle variant selection
  const handleVariantSelect = (id) => {
    setVariantValue(id)
    if (onVariantSelect) onVariantSelect(id)
  }

  // Handle color selection
  const handleColorSelect = (id) => {
    setColorValue(id)
    if (onColorSelect) onColorSelect(id)
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

  // Handle next button click
  const handleNext = () => {
    // Additional validation could be done here
    if (onNextStep) onNextStep()
  }

  // Container styling
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    ...style,
  }

  const sectionStyle = {
    marginBottom: tokens.spacing[6],
  }

  const sectionTitleStyle = {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.neutral[600],
    textTransform: "uppercase",
    marginBottom: tokens.spacing[3],
  }

  const buttonContainerStyle = {
    marginTop: tokens.spacing[8],
  }

  // Determine if next button should be enabled
  const isNextEnabled =
    locationValue && vehicleValue && variantValue && colorValue

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
  if (error) {
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
  const colorOptions = selectedVehicleColors.map((color) => ({
    id: color.id,
    name: color.name,
    value: color.color_value
      ? JSON.parse(color.color_value).colorStart
      : "#f00027",
  }))

  return (
    <div style={containerStyle} {...rest}>
      {/* Location Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Location</div>
        <InputField
          label=""
          placeholder="Area / Pincode"
          value={locationValue}
          onChange={handleLocationChange}
          error={errors.location || ""}
          required={true}
          borderColor={borderColor}
          focusBorderColor={primaryColor}
          errorBorderColor={tokens.colors.red[600]}
        />
      </div>

      {/* Vehicle Selection Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Choose your Vehicle</div>
        {vehicles.map((vehicle) => (
          <VehicleCards
            key={vehicle.id}
            vehicleName={vehicle.name}
            vehicleImage={vehicle.image_url}
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
      {selectedVehicleVariants.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Choose Variant</div>
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
              includedText={variant.is_default ? "Default" : ""}
              isSelected={variant.id === variantValue}
              onClick={() => handleVariantSelect(variant.id)}
              borderColor={borderColor}
              selectedBorderColor={primaryColor}
            />
          ))}
        </div>
      )}

      {/* Color Selection Section - only show if a vehicle is selected */}
      {selectedVehicleColors.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Choose Color</div>
          <ColorSelector
            colors={colorOptions}
            selectedColorId={colorValue}
            onChange={handleColorSelect}
          />
        </div>
      )}

      {/* Optional Components Section - only show if a vehicle is selected */}
      {selectedVehicleComponents.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Optional Component</div>
          {selectedVehicleComponents.map((component) => (
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
              isSelected={componentValues.includes(component.id)}
              onClick={() => {
                handleComponentSelect(
                  component.id,
                  !componentValues.includes(component.id)
                )
              }}
              borderColor={borderColor}
              selectedBorderColor={primaryColor}
              style={{
                opacity: component.is_required ? 0.8 : 1,
              }}
            />
          ))}
        </div>
      )}

      {/* Next Button */}
      <div style={buttonContainerStyle}>
        <Button
          text="Select Insurance"
          rightIcon={true}
          onClick={handleNext}
          disabled={!isNextEnabled}
          primaryColor={primaryColor}
          variant="primary"
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
