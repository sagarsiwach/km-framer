// TestRideForm.tsx
import React, { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js" // Adjust path if needed

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

// --- HELPER: Generate Hex ID ---
function generateHexId(length = 8) {
    const randomPart = Math.random()
        .toString(16)
        .substring(2, 2 + length)
    return randomPart.padEnd(length, "0") // Pad if too short
}

// --- HELPER: Get IST Date/Time ---
function getFormattedISTDateTime() {
    const now = new Date()
    const optionsDate = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Kolkata",
    }
    const optionsTime = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
    }

    const dateFormatter = new Intl.DateTimeFormat("en-IN", optionsDate)
    const parts = dateFormatter.formatToParts(now)
    const day = parts.find((p) => p.type === "day")?.value
    const month = parts.find((p) => p.type === "month")?.value
    const year = parts.find((p) => p.type === "year")?.value
    const formattedDate = `${day}-${month}-${year}` // DD-MM-YYYY

    const formattedTime = new Intl.DateTimeFormat("en-IN", optionsTime).format(
        now
    ) // HH:MM:SS

    return { date: formattedDate, time: formattedTime }
}

// --- HELPER: Parse Location String ---
function parseFormattedLocation(locationString) {
    const defaultResult = { pincode: "", city: "", state: "", country: "India" }
    if (!locationString || typeof locationString !== "string")
        return defaultResult

    const parts = locationString
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)

    if (parts[parts.length - 1]?.toLowerCase() === "india") {
        defaultResult.country = parts.pop()
    }

    if (parts.length > 0 && /^\d{6}$/.test(parts[0])) {
        defaultResult.pincode = parts.shift()
    }

    if (parts.length > 0) defaultResult.city = parts[0]
    if (parts.length > 1) defaultResult.state = parts.slice(1).join(", ") // Join remaining as state

    if (!defaultResult.pincode && /^\d{6}$/.test(locationString.trim())) {
        defaultResult.pincode = locationString.trim()
        defaultResult.city = ""
        defaultResult.state = ""
    }

    return defaultResult
}

// --- HELPER: Format Mapbox Feature (Keep from previous version) ---
const formatLocationString = (feature) => {
    if (!feature) return ""
    let pincode = "",
        city = "",
        state = "",
        country = "India"
    if (feature.context) {
        feature.context.forEach((item) => {
            const type = item.id.split(".")[0]
            switch (type) {
                case "postcode":
                    pincode = item.text
                    break
                case "locality":
                    if (!city) city = item.text
                    break
                case "place":
                    city = item.text
                    break
                case "region":
                    state = item.text
                    break
            }
        })
    }
    if (!city && feature.place_type?.includes("place")) city = feature.text
    if (!pincode && /^\d{6}$/.test(feature.text)) pincode = feature.text
    const parts = [pincode, city, state].filter(Boolean)
    let formatted = parts.join(", ")
    if (pincode && !parts.includes(pincode)) {
        formatted = `${pincode}${parts.length > 0 ? ", " + parts.join(", ") : ""}`
    }
    if (formatted) {
        if (!formatted.toLowerCase().endsWith(country.toLowerCase()))
            formatted += ", " + country
    } else if (feature.place_name?.toLowerCase().includes("india")) {
        formatted = feature.place_name
    } else {
        formatted = feature.place_name
            ? `${feature.place_name}, ${country}`
            : country
    }
    return formatted
        .replace(/, ,/g, ",")
        .replace(/^, |, $/g, "")
        .trim()
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function TestRideForm({
    // --- Props ---
    title = "Book a Test Ride",
    subtitle = "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.",
    backgroundImage = {
        src: "https://framer.com/m/assets/D0NsXFHhf2xIJEp47nKBRqKA.jpg",
    },
    apiEndpoint = "https://api.kabiramobility.com/test-ride/register",
    testApiEndpoint = "https://api-staging.kabiramobility.com/test-ride/register",
    debugMode = false,
    mapboxApiKey = "",
    enableLocationServices = true,
    showSubtitle = true,
    fullHeight = true, // Use 100dvh by default
    buttonColor = tokens.colors.neutral[700],
    buttonTextColor = tokens.colors.white,
    formBackgroundColor = tokens.colors.neutral[50],
    successButtonText = "Return to Home",
    successButtonLink = "/",
    product = "Default Bike Model", // Product prop
    onSubmitSuccess,
    onSubmitError,
    style,
    ...props
}) {
    // --- State ---
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        location: "",
    })
    const [focusedField, setFocusedField] = useState(null)
    const [errors, setErrors] = useState({})
    const [showErrors, setShowErrors] = useState(false)
    const [locationStatus, setLocationStatus] = useState("idle")
    const [locationResults, setLocationResults] = useState([])
    const [showLocationResults, setShowLocationResults] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null)
    const [isMobile, setIsMobile] = useState(false)

    // --- Refs ---
    const formRef = useRef(null)
    const fullNameInputRef = useRef(null)
    const locationInputRef = useRef(null)
    const phoneInputRef = useRef(null)

    // --- Effects ---
    useEffect(() => {
        if (typeof window !== "undefined") {
            const checkMobile = () => setIsMobile(window.innerWidth < 768)
            checkMobile()
            window.addEventListener("resize", checkMobile)
            return () => window.removeEventListener("resize", checkMobile)
        }
    }, [])

    useEffect(() => {
        // Enter key listener
        const handleKeyDown = (e) => {
            const activeElement = document.activeElement
            if (e.key === "Enter") {
                if (
                    activeElement?.closest('[role="listbox"]') ||
                    activeElement?.tagName === "TEXTAREA"
                )
                    return
                if (activeElement === locationInputRef.current) {
                    e.preventDefault()
                    return
                }
                if (formRef.current && formRef.current.contains(activeElement))
                    handleSubmit()
            }
        }
        const formEl = formRef.current
        if (formEl) formEl.addEventListener("keydown", handleKeyDown)
        return () => {
            if (formEl) formEl.removeEventListener("keydown", handleKeyDown)
        }
    }, [formData, errors, focusedField]) // Re-check dependencies if needed

    // --- Event Handlers ---
    const handleChange = (e) => {
        const { name, value, clearError } = e.target
        setFormData((prevData) => ({ ...prevData, [name]: value }))
        if ((showErrors && errors[name]) || clearError) {
            setErrors((prevErrors) => {
                const n = { ...prevErrors }
                delete n[name]
                return n
            })
        }
    }

    const searchLocation = async (query) => {
        // Returns features[] or null
        if (!query || query.length < 3 || !mapboxApiKey) {
            if (debugMode && !mapboxApiKey && query.length >= 3)
                console.warn("Mapbox key missing")
            setLocationResults([])
            setShowLocationResults(false)
            return null
        }
        try {
            const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxApiKey}&country=IN&types=postcode,place,locality,neighborhood,address&autocomplete=true`
            const response = await fetch(endpoint)
            const data = await response.json()
            if (data.features) {
                setLocationResults(data.features)
                setShowLocationResults(data.features.length > 0)
                return data.features
            } else {
                setLocationResults([])
                setShowLocationResults(false)
                return null
            }
        } catch (error) {
            if (debugMode) console.error("Search error:", error)
            setLocationResults([])
            setShowLocationResults(false)
            return null
        }
    }

    const getCurrentLocation = () => {
        if (
            !enableLocationServices ||
            !navigator.geolocation ||
            !mapboxApiKey
        ) {
            if (debugMode && !mapboxApiKey)
                console.warn("Mapbox key/location disabled")
            setLocationStatus("error")
            return
        }
        setLocationStatus("searching")
        setShowLocationResults(false)
        setErrors((prev) => {
            const n = { ...prev }
            delete n.location
            return n
        })
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                try {
                    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxApiKey}&country=IN&types=address,postcode,place,locality,region&limit=1`
                    const response = await fetch(endpoint)
                    const data = await response.json()
                    if (data.features?.length > 0) {
                        const formattedValue = formatLocationString(
                            data.features[0]
                        )
                        setFormData((prev) => ({
                            ...prev,
                            location: formattedValue,
                        }))
                        setLocationStatus("success")
                    } else {
                        setFormData((prev) => ({
                            ...prev,
                            location: `Coords: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                        }))
                        setLocationStatus("error")
                    }
                } catch (error) {
                    if (debugMode)
                        console.error("Reverse geocode error:", error)
                    setFormData((prev) => ({
                        ...prev,
                        location: "Could not fetch address",
                    }))
                    setLocationStatus("error")
                }
            },
            (error) => {
                if (debugMode) console.error("Geolocation error:", error)
                setFormData((prev) => ({
                    ...prev,
                    location: "Geolocation failed",
                }))
                setLocationStatus("error")
                setErrors((prev) => ({
                    ...prev,
                    location: "Could not get location. Check permissions.",
                }))
                setShowErrors(true)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.fullName.trim())
            newErrors.fullName = "Please enter full name"
        else if (formData.fullName.trim().length < 3)
            newErrors.fullName = "Name must be >= 3 characters"
        if (!formData.phoneNumber.trim())
            newErrors.phoneNumber = "Please enter phone number"
        else if (!/^\d{10}$/.test(formData.phoneNumber.trim()))
            newErrors.phoneNumber = "Enter valid 10-digit number"
        if (!formData.location.trim())
            newErrors.location = "Please enter or select location"
        else if (
            ["Geolocation failed", "Could not fetch address"].includes(
                formData.location
            )
        )
            newErrors.location = "Enter location manually or retry."
        // Optional: Check if location seems reasonably complete after formatting attempt
        // const parsedLoc = parseFormattedLocation(formData.location);
        // if (!parsedLoc.pincode && !parsedLoc.city) newErrors.location = "Please provide a more specific location";
        setErrors(newErrors)
        setShowErrors(true)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        setShowLocationResults(false) // Hide dropdown
        if (!validateForm()) {
            const errorKeys = Object.keys(errors)
            if (errorKeys.length > 0) {
                const firstErrorField = errorKeys[0]
                if (firstErrorField === "fullName" && fullNameInputRef.current)
                    fullNameInputRef.current.focus()
                else if (
                    firstErrorField === "phoneNumber" &&
                    phoneInputRef.current
                )
                    phoneInputRef.current.focus()
                else if (
                    firstErrorField === "location" &&
                    locationInputRef.current
                )
                    locationInputRef.current.focus()
            }
            return
        }
        setIsSubmitting(true)
        setErrors({}) // Clear previous submit errors

        const submissionId = generateHexId()
        const { date: istDate, time: istTime } = getFormattedISTDateTime()
        const parsedLocation = parseFormattedLocation(formData.location)
        const userAgent =
            typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"
        const urlOrigin =
            typeof window !== "undefined" ? window.location.origin : "Unknown"

        const requestBody = {
            id: submissionId,
            date: istDate,
            time: istTime,
            fullName: formData.fullName.trim(),
            mobile: formData.phoneNumber.trim(),
            product: product, // Use prop
            pincode: parsedLocation.pincode,
            city: parsedLocation.city,
            state: parsedLocation.state,
            country: parsedLocation.country,
            userAgent: userAgent,
            ipAddress: "SERVER_RESOLVED",
            urlOrigin: urlOrigin,
        }

        if (debugMode)
            console.log(
                "Submitting Data:",
                JSON.stringify(requestBody, null, 2)
            )

        try {
            const endpoint = debugMode ? testApiEndpoint : apiEndpoint
            if (!endpoint) throw new Error("API endpoint is not configured.")
            console.log(`Sending request to: ${endpoint}`)

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json" /* Add other headers if needed */,
                },
                body: JSON.stringify(requestBody),
            })

            console.log(
                "Response Status:",
                response.status,
                response.statusText
            )

            if (response.ok) {
                setSubmitStatus("success")
                if (onSubmitSuccess) onSubmitSuccess(requestBody)
                if (debugMode) console.log("Form submitted successfully.")
            } else {
                let errorData = {
                    message: `API Error: ${response.status} ${response.statusText}`,
                }
                try {
                    errorData = await response.json()
                    if (debugMode) console.error("API Error Body:", errorData)
                } catch (e) {
                    if (debugMode) console.warn("API error response not JSON.")
                }
                setSubmitStatus("error")
                if (onSubmitError) onSubmitError(errorData)
                setErrors({ submit: errorData.message || "Submission failed." })
                setShowErrors(true)
            }
        } catch (error) {
            if (debugMode) console.error("Fetch Error:", error)
            setSubmitStatus("error")
            if (onSubmitError) onSubmitError(error)
            let errorMessage = "Network error. Please check connection."
            if (error instanceof Error && error.name === "TypeError") {
                // More specific check
                errorMessage = "Cannot connect to server. Check network/CORS."
                if (debugMode)
                    console.error(
                        "Possible CORS issue. Server must allow origin:",
                        window.location.origin
                    )
            } else if (error instanceof Error) {
                errorMessage = error.message // Show specific error message if available
            }
            setErrors({ submit: errorMessage })
            setShowErrors(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        // Called by SuccessState if needed (not currently)
        setSubmitStatus(null)
        setFormData({ fullName: "", phoneNumber: "", location: "" })
        setErrors({})
        setShowErrors(false)
        setLocationStatus("idle")
        setLocationResults([])
        setShowLocationResults(false)
    }

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
        exit: {
            opacity: 0,
            transition: {
                when: "afterChildren",
                staggerChildren: 0.05,
                staggerDirection: -1,
            },
        },
    }
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", damping: 15 },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { type: "tween", ease: "easeInOut", duration: 0.3 },
        },
    }

    // --- Render Function for Form Content ---
    const renderForm = () => (
        <motion.div
            key="form-inner-content"
            style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                justifyContent: "center",
                width: "100%",
                maxWidth: "400px",
                margin: "0 auto",
            }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {errors.submit && showErrors && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        color: tokens.colors.red[600],
                        backgroundColor: tokens.colors.red[100],
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        textAlign: "center",
                    }}
                >
                    {" "}
                    {errors.submit}{" "}
                </motion.p>
            )}
            {/* Form Header */}
            <motion.div
                variants={itemVariants}
                style={{
                    marginBottom: isMobile ? "20px" : "clamp(20px, 4vh, 40px)",
                    paddingBottom: isMobile ? "20px" : "0",
                    borderBottom: isMobile
                        ? `1px solid ${tokens.colors.neutral[300]}`
                        : "none",
                    flexShrink: 0,
                }}
            >
                <h1
                    style={{
                        fontSize: "clamp(24px, 4vh, 30px)",
                        fontWeight: 600,
                        color: tokens.colors.neutral[900],
                        margin: "0 0 10px 0",
                        letterSpacing: "-0.04em",
                        fontFamily: "'Geist', sans-serif",
                    }}
                >
                    {" "}
                    {title}{" "}
                </h1>
                {showSubtitle && (
                    <p
                        style={{
                            fontSize: isMobile
                                ? "14px"
                                : "clamp(14px, 2vh, 16px)",
                            color: tokens.colors.neutral[700],
                            margin: 0,
                            lineHeight: 1.5,
                            letterSpacing: "-0.02em",
                            fontFamily: "'Geist', sans-serif",
                        }}
                    >
                        {" "}
                        {subtitle}{" "}
                    </p>
                )}
            </motion.div>
            {/* Form Fields */}
            <div
                ref={formRef}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    marginBottom: "clamp(20px, 4vh, 30px)",
                    flexShrink: 0,
                }}
            >
                <motion.div variants={itemVariants}>
                    {" "}
                    <InputField
                        label="Full Name"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField(null)}
                        error={errors.fullName}
                        showError={showErrors}
                        focusedField={focusedField}
                        inputRef={fullNameInputRef}
                    />{" "}
                </motion.div>
                <motion.div variants={itemVariants}>
                    {" "}
                    <PhoneField
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("phoneNumber")}
                        onBlur={() => setFocusedField(null)}
                        error={errors.phoneNumber}
                        showError={showErrors}
                        focusedField={focusedField}
                        inputRef={phoneInputRef}
                    />{" "}
                </motion.div>
                <motion.div variants={itemVariants}>
                    {" "}
                    <LocationField
                        value={formData.location}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("location")}
                        onBlur={() => setFocusedField(null)}
                        error={errors.location}
                        showError={showErrors}
                        focusedField={focusedField}
                        inputRef={locationInputRef}
                        locationStatus={locationStatus}
                        setLocationStatus={setLocationStatus}
                        getCurrentLocation={getCurrentLocation}
                        enableLocationServices={
                            enableLocationServices && !!mapboxApiKey
                        }
                        setLocationResults={setLocationResults}
                        setShowLocationResults={setShowLocationResults}
                        searchLocation={searchLocation}
                        debugMode={debugMode}
                    />{" "}
                </motion.div>
            </div>
            {/* Submit Area */}
            <motion.div
                variants={itemVariants}
                style={{ marginTop: "auto", paddingTop: "10px", flexShrink: 0 }}
            >
                <SubmitButton
                    label="Register Now"
                    onClick={handleSubmit}
                    isSubmitting={isSubmitting}
                    buttonColor={buttonColor}
                    buttonTextColor={buttonTextColor}
                />
                <PrivacyPolicyText isMobile={isMobile} />
            </motion.div>
        </motion.div>
    )

    // --- Main Container Styles ---
    const containerStyles = {
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
        height: fullHeight ? "100dvh" : "auto",
        minHeight: fullHeight ? "550px" : "auto",
        background: formBackgroundColor, // Use form background as base
        fontFamily: "'Geist', sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        overflow: "hidden", // Prevent scroll on main container
        ...style,
    }

    // --- Component Return JSX ---
    return (
        <div style={containerStyles}>
            {/* Hero Image Section */}
            <div
                style={{
                    flex: isMobile ? "none" : "1 1 0%",
                    width: isMobile ? "100%" : "auto",
                    height: isMobile ? "30vh" : "100%",
                    minHeight: isMobile ? "200px" : "auto",
                    position: "relative",
                    overflow: "hidden",
                    background: tokens.colors.neutral[300] /* Fallback bg */,
                }}
            >
                {backgroundImage?.src ? (
                    <img
                        src={backgroundImage.src}
                        alt="Background"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                        }}
                        onError={(e) => {
                            if (debugMode) console.error("Img load error:", e)
                            try {
                                e.target.style.display = "none"
                            } catch {}
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {" "}
                        <span style={{ color: tokens.colors.neutral[600] }}>
                            No Image
                        </span>{" "}
                    </div>
                )}
            </div>

            {/* Form Section */}
            <div
                style={{
                    flex: isMobile ? "1 1 auto" : `0 0 min(480px, 40vw)`,
                    width: isMobile ? "100%" : undefined,
                    height: isMobile ? "auto" : "100%",
                    padding: isMobile ? "20px" : "clamp(30px, 5vh, 60px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    background: formBackgroundColor,
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                <AnimatePresence mode="wait">
                    {submitStatus === "success" ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <SuccessState
                                successButtonText={successButtonText}
                                successButtonLink={successButtonLink}
                            />
                        </motion.div>
                    ) : (
                        renderForm() // Returns the animated inner form content
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// --- Property Controls ---
addPropertyControls(TestRideForm, {
    title: { type: ControlType.String, defaultValue: "Book a Test Ride" },
    subtitle: {
        type: ControlType.String,
        defaultValue: "Get a personalised Feel and Experience...",
    },
    showSubtitle: { type: ControlType.Boolean, defaultValue: true },
    backgroundImage: {
        type: ControlType.ResponsiveImage,
        title: "Background Image",
    },
    // --- NEW PROP: Product Name ---
    product: {
        type: ControlType.String,
        title: "Product Name",
        defaultValue: "KM_Bike_Model",
        description: "Product for test ride",
    },
    // --- API & Debug ---
    apiEndpoint: {
        type: ControlType.String,
        defaultValue: "https://api.kabiramobility.com/test-ride/register",
        title: "API Endpoint (Prod)",
    },
    testApiEndpoint: {
        type: ControlType.String,
        defaultValue:
            "https://api-staging.kabiramobility.com/test-ride/register",
        title: "API Endpoint (Test)",
    },
    debugMode: { type: ControlType.Boolean, defaultValue: false },
    // --- Location ---
    mapboxApiKey: {
        type: ControlType.String,
        title: "Mapbox API Key",
        placeholder: "pk.eyJ...",
    },
    enableLocationServices: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Enable GPS Location",
    },
    // --- Style & Layout ---
    fullHeight: {
        type: ControlType.Boolean,
        title: "Use Full Viewport Height (100dvh)",
        defaultValue: true,
    },
    buttonColor: {
        type: ControlType.Color,
        defaultValue: tokens.colors.neutral[700],
    },
    buttonTextColor: {
        type: ControlType.Color,
        defaultValue: tokens.colors.white,
    },
    formBackgroundColor: {
        type: ControlType.Color,
        defaultValue: tokens.colors.neutral[50],
    },
    // --- Success State ---
    successButtonText: {
        type: ControlType.String,
        title: "Success Button Text",
        defaultValue: "Return to Home",
    },
    successButtonLink: {
        type: ControlType.Link,
        title: "Success Button Link",
        defaultValue: "/",
    },
})

export default TestRideForm
