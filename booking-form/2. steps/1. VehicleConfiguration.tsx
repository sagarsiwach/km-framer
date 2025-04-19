// Modified VehicleConfiguration.tsx
import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useRef } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import { LocationField } from "https://framer.com/m/LocationSearch-VHyR.js"
import SectionTitle from "https://framer.com/m/SectionTitle-OVrp.js"
import ErrorDisplay from "https://framer.com/m/ErrorDisplay-PmC2.js"
import LoadingIndicator from "https://framer.com/m/LoadingIndicator-7vLo.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
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

    // Update form data on any field change
    useEffect(() => {
        if (onFormDataChange) {
            onFormDataChange({
                location: locationValue,
                selectedVehicle: vehicleValue,
                selectedVariant: variantValue,
                selectedColor: colorValue,
                optionalComponents: componentValues,
            })
        }
    }, [locationValue, vehicleValue, variantValue, colorValue, componentValues])

    // Processed data for display
    const vehicles = vehicleData.models || []

    // Get the currently selected vehicle object
    const selectedVehicle = vehicles.find((v) => v.id === vehicleValue) || null

    // Get vehicle name and code for the form data update
    useEffect(() => {
        if (selectedVehicle) {
            onFormDataChange({
                vehicleName: selectedVehicle.name,
                vehicleCode: selectedVehicle.model_code || "",
            })
        }
    }, [selectedVehicle])

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

    // Group components by type
    const groupedComponents = selectedVehicleComponents.reduce(
        (acc, component) => {
            const type = component.component_type || "Other"
            if (!acc[type]) acc[type] = []
            acc[type].push(component)
            return acc
        },
        {}
    )

    // Handle location input change
    const handleLocationChange = (value) => {
        if (typeof value === "object" && value.target) {
            setLocationValue(value.target.value)
            if (onLocationChange) onLocationChange(value.target.value)
        } else {
            setLocationValue(value)
            if (onLocationChange) onLocationChange(value)
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

    // Get price for a vehicle
    const getVehiclePrice = (vehicleId) => {
        if (!vehicleData.pricing) return null

        // Find matching price
        const pricing = vehicleData.pricing.find(
            (p) => p.model_id === vehicleId
        )
        return pricing ? `₹${pricing.base_price.toLocaleString("en-IN")}` : null
    }

    // Container styling
    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        ...style,
    }

    const sectionStyle = {
        marginBottom: tokens.spacing[8],
        scrollMarginTop: "20px",
    }

    // Vehicle card styling
    const vehicleCardStyle = {
        border: `1px solid ${borderColor}`,
        borderRadius: tokens.borderRadius.md,
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
        cursor: "pointer",
    }

    const selectedVehicleCardStyle = {
        ...vehicleCardStyle,
        borderColor: "#212121",
        backgroundColor: "transparent",
    }

    // Component card styling
    const componentCardStyle = {
        border: `1px solid ${borderColor}`,
        borderRadius: tokens.borderRadius.md,
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    }

    const selectedComponentCardStyle = {
        ...componentCardStyle,
        borderColor: primaryColor,
        backgroundColor: tokens.colors.blue[50],
    }

    const componentTitleStyle = {
        fontSize: tokens.fontSize.base,
        fontWeight: tokens.fontWeight.medium,
    }

    const componentPriceStyle = {
        fontSize: tokens.fontSize.base,
        color: tokens.colors.neutral[600],
    }

    const componentCheckboxStyle = {
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        border: `2px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: tokens.spacing[2],
    }

    const selectedComponentCheckboxStyle = {
        ...componentCheckboxStyle,
        backgroundColor: primaryColor,
        borderColor: primaryColor,
    }

    // Variant card styling
    const variantCardStyle = {
        border: `1px solid ${borderColor}`,
        borderRadius: tokens.borderRadius.md,
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
        cursor: "pointer",
    }

    const selectedVariantCardStyle = {
        ...variantCardStyle,
        borderColor: primaryColor,
        backgroundColor: tokens.colors.blue[50],
    }

    // Color option styling
    const colorOptionsContainerStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: tokens.spacing[3],
        marginTop: tokens.spacing[4],
    }

    const colorOptionStyle = {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        cursor: "pointer",
        border: `2px solid ${borderColor}`,
        transition: "transform 0.2s ease",
    }

    const selectedColorOptionStyle = {
        transform: "scale(1.1)",
        boxShadow: tokens.boxShadow.md,
        border: `2px solid ${primaryColor}`,
    }

    // Loading state display
    if (loading) {
        return (
            <div style={containerStyle}>
                <LoadingIndicator
                    text="Loading vehicle information..."
                    size="large"
                />
            </div>
        )
    }

    // Error state display
    if (error && typeof error === "string") {
        return (
            <div style={containerStyle}>
                <ErrorDisplay
                    error={error}
                    showRetry={true}
                    retryText="Retry"
                    onRetry={() => window.location.reload()}
                />
            </div>
        )
    }

    return (
        <div style={containerStyle} {...rest}>
            {/* Location Section */}
            <div ref={locationSectionRef} style={sectionStyle}>
                <SectionTitle title="LOCATION" />
                <LocationField
                    value={locationValue}
                    onChange={handleLocationChange}
                    onFocus={() => setFocusedField("location")}
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
            <div ref={vehicleSectionRef} style={sectionStyle}>
                <SectionTitle title="CHOOSE YOUR VEHICLE" />
                <div>
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            style={
                                vehicleValue === vehicle.id
                                    ? selectedVehicleCardStyle
                                    : vehicleCardStyle
                            }
                            onClick={() => handleVehicleSelect(vehicle.id)}
                        >
                            <div style={{ fontWeight: "bold" }}>
                                {vehicle.name}
                            </div>
                            <div
                                style={{ fontSize: "0.8rem", color: "#737373" }}
                            >
                                {vehicle.model_code || ""}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Variant Selection Section - only show if a vehicle is selected */}
            {vehicleValue && selectedVehicleVariants.length > 0 && (
                <div ref={variantSectionRef} style={sectionStyle}>
                    <SectionTitle title="CHOOSE VARIANT" />
                    <div>
                        {selectedVehicleVariants.map((variant) => (
                            <div
                                key={variant.id}
                                style={
                                    variantValue === variant.id
                                        ? selectedVariantCardStyle
                                        : variantCardStyle
                                }
                                onClick={() => handleVariantSelect(variant.id)}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: "bold" }}>
                                            {variant.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "#737373",
                                            }}
                                        >
                                            {variant.description}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            color: primaryColor,
                                        }}
                                    >
                                        {variant.price_addition
                                            ? `+₹${variant.price_addition.toLocaleString(
                                                  "en-IN"
                                              )}`
                                            : "Included"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Color Selection Section - only show if a vehicle is selected */}
            {vehicleValue && selectedVehicleColors.length > 0 && (
                <div ref={colorSectionRef} style={sectionStyle}>
                    <SectionTitle title="FINISH" />
                    <div>
                        {/* Color selection UI */}
                        <div style={colorOptionsContainerStyle}>
                            {selectedVehicleColors.map((color) => (
                                <div
                                    key={color.id}
                                    onClick={() => handleColorSelect(color.id)}
                                    style={{
                                        ...colorOptionStyle,
                                        backgroundColor:
                                            color.hex_code || "#000000",
                                        ...(colorValue === color.id
                                            ? selectedColorOptionStyle
                                            : {}),
                                    }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                        <div
                            style={{
                                marginTop: tokens.spacing[4],
                                fontSize: tokens.fontSize.sm,
                                color: tokens.colors.neutral[600],
                            }}
                        >
                            Selected:{" "}
                            {selectedVehicleColors.find(
                                (c) => c.id === colorValue
                            )?.name || "None"}
                        </div>
                    </div>
                </div>
            )}

            {/* Optional Components Section - grouped by component_type */}
            {vehicleValue && Object.keys(groupedComponents).length > 0 && (
                <div ref={componentSectionRef} style={sectionStyle}>
                    <SectionTitle title="ADD COMPONENTS" />

                    {Object.entries(groupedComponents).map(
                        ([type, components]) => (
                            <div
                                key={type}
                                style={{ marginBottom: tokens.spacing[6] }}
                            >
                                <div
                                    style={{
                                        fontSize: tokens.fontSize.lg,
                                        fontWeight: tokens.fontWeight.bold,
                                        marginBottom: tokens.spacing[3],
                                        color: tokens.colors.neutral[800],
                                    }}
                                >
                                    {type}
                                </div>

                                {components.map((component) => {
                                    const isSelected = componentValues.includes(
                                        component.id
                                    )
                                    const isRequired = component.is_required

                                    return (
                                        <div
                                            key={component.id}
                                            style={
                                                isSelected
                                                    ? selectedComponentCardStyle
                                                    : componentCardStyle
                                            }
                                            onClick={() =>
                                                handleComponentSelect(
                                                    component.id,
                                                    !isSelected
                                                )
                                            }
                                        >
                                            <div>
                                                <div
                                                    style={componentTitleStyle}
                                                >
                                                    {component.name}
                                                    {isRequired && (
                                                        <span
                                                            style={{
                                                                color: tokens
                                                                    .colors
                                                                    .red[600],
                                                                marginLeft:
                                                                    tokens
                                                                        .spacing[1],
                                                            }}
                                                        >
                                                            *
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.8rem",
                                                        color: "#737373",
                                                        marginBottom: 0,
                                                    }}
                                                >
                                                    {component.description}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <div
                                                    style={componentPriceStyle}
                                                >
                                                    {component.price
                                                        ? `+₹${component.price.toLocaleString("en-IN")}`
                                                        : "Included"}
                                                </div>
                                                <div
                                                    style={
                                                        isSelected
                                                            ? selectedComponentCheckboxStyle
                                                            : componentCheckboxStyle
                                                    }
                                                >
                                                    {isSelected && (
                                                        <svg
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 12 12"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M3 6L5 8L9 4"
                                                                stroke="white"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    )}
                </div>
            )}
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
