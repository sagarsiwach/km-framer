// TestRideForm.tsx
import React, { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/designTokens-42aq.js"

// Import our component modules with the provided URLs
import {
    InputField,
    PhoneField,
    SubmitButton,
    PrivacyPolicyText,
} from "https://framer.com/m/FormFields-3AX8.js"
import {
    LocationField,
    getLocationIcon,
} from "https://framer.com/m/LocationSearch-nwb4.js"
import { SuccessState } from "https://framer.com/m/SuccessState-Y7Nd.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function TestRideForm({
    title = "Book a Test Ride",
    subtitle = "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.",
    backgroundImage = "https://framer.com/m/assets/D0NsXFHhf2xIJEp47nKBRqKA.jpg",
    apiEndpoint = "https://api.kabiramobility.com/test-ride/register",
    mapboxApiKey = "",
    enableLocationServices = true,
    showSubtitle = true,
    buttonColor = tokens.colors.neutral[700],
    buttonTextColor = tokens.colors.white,
    formBackgroundColor = tokens.colors.white,
    onSubmitSuccess,
    onSubmitError,
    ...props
}) {
    // Form state
    const [formData, setFormData] = useState({
        location: "",
        fullName: "",
        phoneNumber: "",
    })

    // Input focus state
    const [focusedField, setFocusedField] = useState(null)

    // Validation state
    const [errors, setErrors] = useState({})

    // Location search state
    const [locationStatus, setLocationStatus] = useState("idle") // idle, searching, success, error
    const [locationResults, setLocationResults] = useState([])
    const [showLocationResults, setShowLocationResults] = useState(false)

    // Form submission state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // null, success, error

    // References
    const fullNameInputRef = useRef(null)
    const locationInputRef = useRef(null)
    const phoneInputRef = useRef(null)

    // Check if we're running in mobile viewport
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Check if window is available (client-side)
        if (typeof window !== "undefined") {
            const checkMobile = () => {
                setIsMobile(window.innerWidth < 768)
            }

            checkMobile()
            window.addEventListener("resize", checkMobile)

            return () => {
                window.removeEventListener("resize", checkMobile)
            }
        }
    }, [])

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            })
        }
    }

    // Location search function
    const searchLocation = async (query) => {
        if (!query || query.length < 3) {
            setLocationResults([])
            setShowLocationResults(false)
            return
        }

        setLocationStatus("searching")
        setShowLocationResults(true)

        try {
            // Use Mapbox Geocoding API if API key is provided
            if (mapboxApiKey) {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                        query
                    )}.json?access_token=${mapboxApiKey}&country=in&types=postcode,place,locality,neighborhood`
                )

                const data = await response.json()

                if (data.features) {
                    setLocationResults(
                        data.features.map((feature) => ({
                            id: feature.id,
                            name: feature.place_name,
                            coordinates: feature.geometry.coordinates,
                        }))
                    )
                    setLocationStatus("success")
                }
            } else {
                // Mock search results if no API key
                setTimeout(() => {
                    setLocationResults([
                        {
                            id: 1,
                            name: "Mumbai, Maharashtra",
                            coordinates: [72.8777, 19.076],
                        },
                        {
                            id: 2,
                            name: "Delhi, India",
                            coordinates: [77.1025, 28.7041],
                        },
                        {
                            id: 3,
                            name: "Bangalore, Karnataka",
                            coordinates: [77.5946, 12.9716],
                        },
                        {
                            id: 4,
                            name: "Pune, Maharashtra",
                            coordinates: [73.8567, 18.5204],
                        },
                        {
                            id: 5,
                            name: "Chennai, Tamil Nadu",
                            coordinates: [80.2707, 13.0827],
                        },
                    ])
                    setLocationStatus("success")
                }, 500)
            }
        } catch (error) {
            console.error("Error searching location:", error)
            setLocationStatus("error")
        }
    }

    // Get current location function
    const getCurrentLocation = () => {
        if (!enableLocationServices || !navigator.geolocation) {
            return
        }

        setLocationStatus("searching")

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                try {
                    // Reverse geocoding with Mapbox
                    if (mapboxApiKey) {
                        const response = await fetch(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxApiKey}&types=postcode,place,locality`
                        )

                        const data = await response.json()

                        if (data.features && data.features.length > 0) {
                            setFormData({
                                ...formData,
                                location: data.features[0].place_name,
                            })
                            setLocationStatus("success")
                        }
                    } else {
                        // Mock data if no API key
                        setFormData({
                            ...formData,
                            location: "Current Location (Bengaluru, India)",
                        })
                        setLocationStatus("success")
                    }
                } catch (error) {
                    console.error("Error with reverse geocoding:", error)
                    setLocationStatus("error")
                }
            },
            (error) => {
                console.error("Geolocation error:", error)
                setLocationStatus("error")
            }
        )
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!formData.location) {
            newErrors.location = "Please enter your location"
        }

        if (!formData.fullName) {
            newErrors.fullName = "Please enter your full name"
        } else if (formData.fullName.length < 3) {
            newErrors.fullName = "Name must be at least 3 characters"
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Please enter your phone number"
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid 10-digit phone number"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        if (e) e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call if no endpoint is provided for testing
            if (
                apiEndpoint ===
                "https://api.kabiramobility.com/test-ride/register"
            ) {
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 1500))

                // Simulate success
                setSubmitStatus("success")
                if (onSubmitSuccess) {
                    onSubmitSuccess(formData)
                }
            } else {
                // Real API call
                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.fullName,
                        phone: formData.phoneNumber,
                        location: formData.location,
                    }),
                })

                if (response.ok) {
                    setSubmitStatus("success")
                    if (onSubmitSuccess) {
                        onSubmitSuccess(formData)
                    }
                } else {
                    setSubmitStatus("error")
                    if (onSubmitError) {
                        onSubmitError(await response.json())
                    }
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            setSubmitStatus("error")
            if (onSubmitError) {
                onSubmitError(error)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset form after successful submission
    const handleReset = () => {
        setSubmitStatus(null)
        setFormData({
            location: "",
            fullName: "",
            phoneNumber: "",
        })
        setErrors({})
    }

    // Render the form content
    const renderForm = () => (
        <>
            <div>
                {/* Form Header */}
                <div
                    style={{
                        marginBottom: isMobile ? "20px" : "40px",
                        paddingBottom: isMobile ? "20px" : "0",
                        borderBottom: isMobile
                            ? `1px solid ${tokens.colors.neutral[300]}`
                            : "none",
                    }}
                >
                    <h1
                        style={{
                            fontSize: isMobile ? "30px" : "36px",
                            fontWeight: 600,
                            color: tokens.colors.neutral[900],
                            margin: "0 0 10px 0",
                        }}
                    >
                        {title}
                    </h1>

                    {showSubtitle && (
                        <p
                            style={{
                                fontSize: isMobile ? "14px" : "16px",
                                color: tokens.colors.neutral[700],
                                margin: 0,
                                lineHeight: 1.5,
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px",
                            marginBottom: "30px",
                        }}
                    >
                        {/* Location Field */}
                        <LocationField
                            value={formData.location}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("location")}
                            onBlur={() => setFocusedField(null)}
                            error={errors.location}
                            focusedField={focusedField}
                            inputRef={locationInputRef}
                            locationStatus={locationStatus}
                            locationResults={locationResults}
                            showLocationResults={showLocationResults}
                            getCurrentLocation={getCurrentLocation}
                            enableLocationServices={enableLocationServices}
                            setLocationResults={setLocationResults}
                            setShowLocationResults={setShowLocationResults}
                            searchLocation={searchLocation}
                        />

                        {/* Full Name Field */}
                        <InputField
                            label="Full Name"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("fullName")}
                            onBlur={() => setFocusedField(null)}
                            error={errors.fullName}
                            focusedField={focusedField}
                            inputRef={fullNameInputRef}
                        />

                        {/* Phone Number Field */}
                        <PhoneField
                            label="Phone Number"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            onFocus={() => setFocusedField("phoneNumber")}
                            onBlur={() => setFocusedField(null)}
                            error={errors.phoneNumber}
                            focusedField={focusedField}
                            inputRef={phoneInputRef}
                        />
                    </div>
                </form>
            </div>

            {/* Submit Button and Disclaimer */}
            <div>
                <SubmitButton
                    label="Register Now"
                    onClick={handleSubmit}
                    isSubmitting={isSubmitting}
                    buttonColor={buttonColor}
                    buttonTextColor={buttonTextColor}
                />

                <PrivacyPolicyText isMobile={isMobile} />
            </div>
        </>
    )

    return (
        <div
            style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                width: "100%",
                height: "100%",
                background: tokens.colors.neutral[200],
                fontFamily: "'Geist', sans-serif",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                ...props.style,
            }}
        >
            {/* Hero Image Section */}
            <div
                style={{
                    flex: isMobile ? "none" : 1,
                    width: isMobile ? "100%" : undefined,
                    height: isMobile ? "366px" : "100%",
                    position: "relative",
                    overflow: "hidden",
                    background: formBackgroundColor,
                }}
            >
                <img
                    src={backgroundImage}
                    alt="Kabira Mobility Motorcycle"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                    }}
                />
            </div>

            {/* Form Section */}
            <div
                style={{
                    flex: isMobile ? "none" : "0 0 480px",
                    width: isMobile ? "100%" : undefined,
                    padding: isMobile ? "0 20px" : "40px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: tokens.colors.neutral[50],
                }}
            >
                {submitStatus === "success" ? (
                    <SuccessState onReset={handleReset} />
                ) : (
                    renderForm()
                )}
            </div>
        </div>
    )
}

// Property Controls
addPropertyControls(TestRideForm, {
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "Book a Test Ride",
    },
    subtitle: {
        type: ControlType.String,
        title: "Subtitle",
        defaultValue:
            "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.",
    },
    showSubtitle: {
        type: ControlType.Boolean,
        title: "Show Subtitle",
        defaultValue: true,
    },
    backgroundImage: {
        type: ControlType.ResponsiveImage,
        title: "Background Image",
    },
    apiEndpoint: {
        type: ControlType.String,
        title: "API Endpoint",
        defaultValue: "https://api.kabiramobility.com/test-ride/register",
    },
    mapboxApiKey: {
        type: ControlType.String,
        title: "Mapbox API Key",
        defaultValue: "",
    },
    enableLocationServices: {
        type: ControlType.Boolean,
        title: "Enable Location Services",
        defaultValue: true,
    },
    buttonColor: {
        type: ControlType.Color,
        title: "Button Color",
        defaultValue: tokens.colors.neutral[700],
    },
    buttonTextColor: {
        type: ControlType.Color,
        title: "Button Text Color",
        defaultValue: tokens.colors.white,
    },
    formBackgroundColor: {
        type: ControlType.Color,
        title: "Form Background Color",
        defaultValue: tokens.colors.white,
    },
})

export default TestRideForm

// check
