// TestRideForm.tsx
import React, { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js"

// Import component modules
import {
    InputField,
    PhoneField,
    PrivacyPolicyText,
    SubmitButton,
} from "https://framer.com/m/FormFields-3AX8.js"
import {
    LocationField,
    LocationStatusIcon,
} from "https://framer.com/m/LocationSearch-nwb4.js"
import { SuccessState } from "https://framer.com/m/SuccessState-Y7Nd.js"

// --- Constants ---
const FALLBACK_MAPBOX_API_KEY =
    "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function TestRideForm({
    title = "Book a Test Ride",
    subtitle = "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.",
    backgroundImage,
    apiEndpoint = "",
    mapboxApiKey = "",
    enableLocationServices = true,
    showSubtitle = true,
    buttonColor,
    buttonTextColor,
    formBackgroundColor = tokens.colors?.white || "#FFFFFF",
    imageBackgroundColor = tokens.colors?.neutral?.[100] || "#F0F0F0",
    onSubmitSuccess,
    onSubmitError,
    style,
    ...rest
}) {
    // Filter non-DOM props
    const {
        willChangeTransform,
        layoutId,
        layoutIdKey,
        forceRender,
        ...validRestProps
    } = rest

    // --- State ---
    const [formData, setFormData] = useState({
        location: "",
        fullName: "",
        phoneNumber: "",
    })
    const [focusedField, setFocusedField] = useState(null)
    const [errors, setErrors] = useState({})
    const [locationStatus, setLocationStatus] = useState("idle")
    const [locationResults, setLocationResults] = useState([])
    const [showLocationResults, setShowLocationResults] = useState(false)
    const [submitStatus, setSubmitStatus] = useState("idle")
    const [isMobile, setIsMobile] = useState(false)

    // --- Refs ---
    const locationInputRef = useRef(null)
    const fullNameInputRef = useRef(null)
    const phoneInputRef = useRef(null)
    const formRef = useRef(null)

    // --- Derived values ---
    const effectiveMapboxApiKey = mapboxApiKey || FALLBACK_MAPBOX_API_KEY
    const effectiveApiEndpoint = apiEndpoint || "YOUR_WEBHOOK_OR_API_URL_HERE"

    // --- Effects ---
    useEffect(() => {
        if (typeof window === "undefined") return
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // --- Callbacks ---
    const handleFocus = useCallback(
        (fieldName) => {
            setFocusedField(fieldName)
            if (fieldName === "location") {
                if (formData.location && locationResults.length > 0) {
                    setShowLocationResults(true)
                }
            } else {
                setShowLocationResults(false)
            }
        },
        [formData.location, locationResults.length]
    )

    const handleBlur = useCallback(() => {
        setTimeout(() => {
            setFocusedField(null)
        }, 150)
    }, [])

    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target

            if (name === "phoneNumber") {
                const digitsOnly = value.replace(/\D/g, "")
                setFormData((prev) => ({ ...prev, [name]: digitsOnly }))
            } else {
                setFormData((prev) => ({ ...prev, [name]: value }))
            }

            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: null }))
            }
        },
        [errors]
    )

    const searchLocation = useCallback(
        async (query) => {
            if (!effectiveMapboxApiKey) return
            if (!query || query.trim().length < 3) {
                setLocationResults([])
                setShowLocationResults(false)
                return
            }

            setLocationStatus("searching")
            setShowLocationResults(true)

            try {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=${effectiveMapboxApiKey}&country=in&types=place,postcode,locality,neighborhood,district&limit=5`
                const response = await fetch(url)

                if (!response.ok)
                    throw new Error(`Mapbox API Error: ${response.statusText}`)

                const data = await response.json()
                if (data.features && data.features.length > 0) {
                    setLocationResults(
                        data.features.map((f, index) => ({
                            id: f.id || `location-${index}`,
                            name: f.place_name,
                        }))
                    )
                    setLocationStatus("success")
                } else {
                    setLocationResults([])
                    setLocationStatus("success")
                }
            } catch (error) {
                console.error("Location search error:", error)
                setLocationStatus("error")
                setLocationResults([])
                setShowLocationResults(false)
            }
        },
        [effectiveMapboxApiKey]
    )

    const getCurrentLocation = useCallback(() => {
        if (!enableLocationServices || !effectiveMapboxApiKey) return
        if (typeof navigator === "undefined" || !navigator.geolocation) return

        setLocationStatus("searching")
        setShowLocationResults(false)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${effectiveMapboxApiKey}&types=place,locality,neighborhood,address&limit=1`
                    const response = await fetch(url)

                    if (!response.ok)
                        throw new Error(
                            `Mapbox Reverse Geocoding Error: ${response.statusText}`
                        )

                    const data = await response.json()
                    if (data.features && data.features.length > 0) {
                        setFormData((prev) => ({
                            ...prev,
                            location: data.features[0].place_name,
                        }))
                        setLocationStatus("success")
                        setErrors((prev) => ({ ...prev, location: null }))
                    } else {
                        throw new Error("No address found.")
                    }
                } catch (error) {
                    console.error("Reverse geocoding error:", error)
                    setLocationStatus("error")
                }
            },
            (error) => {
                console.error("Geolocation error:", error)
                setLocationStatus("error")
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
    }, [effectiveMapboxApiKey, enableLocationServices])

    const handleSelectLocation = useCallback((result) => {
        setFormData((prev) => ({ ...prev, location: result.name }))
        setLocationResults([])
        setShowLocationResults(false)
        setErrors((prev) => ({ ...prev, location: null }))
        locationInputRef.current?.focus()
    }, [])

    const validateForm = useCallback(() => {
        const newErrors = {}

        if (!formData.location || formData.location.trim().length < 3) {
            newErrors.location = "Valid location required"
        }

        if (!formData.fullName || formData.fullName.trim().length < 2) {
            newErrors.fullName = "Full name required"
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone required"
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Valid 10-digit number"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [formData])

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault()
            setShowLocationResults(false)

            if (!validateForm()) {
                const firstErrorKey = Object.keys(errors).find(
                    (key) => errors[key]
                )

                if (firstErrorKey === "location")
                    locationInputRef.current?.focus()
                else if (firstErrorKey === "fullName")
                    fullNameInputRef.current?.focus()
                else if (firstErrorKey === "phoneNumber")
                    phoneInputRef.current?.focus()

                return
            }

            if (
                !effectiveApiEndpoint ||
                !effectiveApiEndpoint.startsWith("http")
            ) {
                alert("API endpoint not configured.")
                return
            }

            setSubmitStatus("submitting")

            const payload = {
                name: formData.fullName.trim(),
                phone: formData.phoneNumber,
                location: formData.location.trim(),
                source: "BookingForm_Framer",
                timestamp: new Date().toISOString(),
            }

            try {
                console.log("Submitting:", payload)
                fetch(effectiveApiEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                    .then((res) => {
                        if (res.ok) {
                            setSubmitStatus("success")
                            if (onSubmitSuccess) onSubmitSuccess(formData)
                            return res.text()
                        } else {
                            return res.text().then((errText) => {
                                throw new Error(
                                    `API Error ${res.status}: ${errText || res.statusText}`
                                )
                            })
                        }
                    })
                    .then((text) => {
                        console.log("Success:", text)
                    })
                    .catch((err) => {
                        setSubmitStatus("error")
                        if (onSubmitError) onSubmitError(err)
                        alert(`Submit failed: ${err.message}`)
                        console.error("API Error:", err)
                    })
            } catch (err) {
                setSubmitStatus("error")
                if (onSubmitError) onSubmitError(err)
                alert("Network error.")
                console.error("Submit error:", err)
            }
        },
        [
            validateForm,
            formData,
            effectiveApiEndpoint,
            onSubmitSuccess,
            onSubmitError,
        ]
    )

    const handleReset = useCallback(() => {
        setFormData({ location: "", fullName: "", phoneNumber: "" })
        setErrors({})
        setSubmitStatus("idle")
        setLocationStatus("idle")
        setLocationResults([])
        setShowLocationResults(false)
        setFocusedField(null)
    }, [])

    // --- UI Rendering ---
    const imageUrl = backgroundImage
        ? typeof backgroundImage === "object" && backgroundImage.src
            ? backgroundImage.src
            : typeof backgroundImage === "string"
              ? backgroundImage
              : null
        : null

    const renderFormContent = () => (
        <motion.div
            key="form-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            {/* Header */}
            <div style={{ marginBottom: isMobile ? "24px" : "32px" }}>
                <h1
                    style={{
                        fontSize: isMobile ? "26px" : "30px",
                        fontWeight: 700,
                        color: tokens.colors?.neutral?.[900] || "#111",
                        margin: "0 0 8px 0",
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </h1>
                {showSubtitle && subtitle && (
                    <p
                        style={{
                            fontSize: "15px",
                            color: tokens.colors?.neutral?.[700] || "#555",
                            margin: 0,
                            lineHeight: 1.5,
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    gap: "16px",
                }}
            >
                <LocationField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onFocus={() => handleFocus("location")}
                    onBlur={handleBlur}
                    error={errors.location}
                    isFocused={focusedField === "location"}
                    inputRef={locationInputRef}
                    locationStatus={locationStatus}
                    locationResults={locationResults}
                    showLocationResults={showLocationResults}
                    getCurrentLocation={getCurrentLocation}
                    enableLocationServices={enableLocationServices}
                    searchLocation={searchLocation}
                    handleSelectLocation={handleSelectLocation}
                />

                <InputField
                    label="Full Name"
                    name="fullName"
                    type="text"
                    placeholder="E.g. John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    onFocus={() => handleFocus("fullName")}
                    onBlur={handleBlur}
                    error={errors.fullName}
                    isFocused={focusedField === "fullName"}
                    inputRef={fullNameInputRef}
                    autoComplete="name"
                />

                <PhoneField
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onFocus={() => handleFocus("phoneNumber")}
                    onBlur={handleBlur}
                    error={errors.phoneNumber}
                    isFocused={focusedField === "phoneNumber"}
                    inputRef={phoneInputRef}
                />

                {/* Submission Area */}
                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                    <SubmitButton
                        label="Register Now"
                        isSubmitting={submitStatus === "submitting"}
                        buttonColor={buttonColor}
                        buttonTextColor={buttonTextColor}
                    />
                    <PrivacyPolicyText isMobile={isMobile} />
                </div>
            </form>
        </motion.div>
    )

    return (
        <div
            style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                width: "100%",
                height: "100%",
                fontFamily: "'Inter', 'Geist', sans-serif",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                overflow: "hidden",
                background: isMobile
                    ? formBackgroundColor
                    : tokens.colors?.neutral?.[100] || "#F0F0F0",
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                ...style,
            }}
            {...validRestProps}
        >
            {/* Image Section */}
            {!isMobile && (
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        height: "100%",
                        position: "relative",
                        overflow: "hidden",
                        background: imageBackgroundColor,
                    }}
                >
                    {imageUrl ? (
                        <motion.img
                            src={imageUrl}
                            alt={title || "Booking image"}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: tokens.colors?.neutral?.[500] || "#aaa",
                            }}
                        >
                            No Image
                        </div>
                    )}
                </div>
            )}

            {/* Form Section */}
            <div
                style={{
                    width: isMobile ? "100%" : "460px",
                    flexShrink: 0,
                    height: isMobile ? "auto" : "100%",
                    padding: isMobile ? "32px 24px" : "48px 40px",
                    display: "flex",
                    flexDirection: "column",
                    background: formBackgroundColor,
                    boxSizing: "border-box",
                    overflowY: "auto",
                }}
            >
                {submitStatus === "success" ? (
                    <SuccessState key="success" onReset={handleReset} />
                ) : (
                    renderFormContent()
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
        defaultValue: "Experience the bike firsthand...",
        displayTextArea: true,
    },
    showSubtitle: {
        type: ControlType.Boolean,
        title: "Show Subtitle",
        defaultValue: true,
    },
    backgroundImage: {
        type: ControlType.ResponsiveImage,
        title: "Image (Desktop)",
    },
    apiEndpoint: {
        type: ControlType.String,
        title: "API Endpoint URL",
        placeholder: "https://your-webhook-url.com/...",
        description: "URL to send form data.",
    },
    mapboxApiKey: {
        type: ControlType.String,
        title: "Mapbox API Key",
        placeholder: "pk.eyJ...",
        description: "Overrides the hardcoded key if provided.",
    },
    enableLocationServices: {
        type: ControlType.Boolean,
        title: "Enable Location Button",
        defaultValue: true,
    },
    buttonColor: {
        type: ControlType.Color,
        title: "Button Color",
        defaultValue: "#333333",
    },
    buttonTextColor: {
        type: ControlType.Color,
        title: "Button Text Color",
        defaultValue: "#FFFFFF",
    },
    formBackgroundColor: {
        type: ControlType.Color,
        title: "Form Background",
        defaultValue: "#FFFFFF",
    },
    imageBackgroundColor: {
        type: ControlType.Color,
        title: "Image Area Background",
        defaultValue: "#F0F0F0",
    },
    onSubmitSuccess: {
        type: ControlType.EventHandler,
        title: "On Success",
    },
    onSubmitError: {
        type: ControlType.EventHandler,
        title: "On Error",
    },
})
