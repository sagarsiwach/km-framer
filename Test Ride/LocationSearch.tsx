// LocationSearch.tsx
import React, { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
// Assuming tokens are correctly imported - replace with actual path if needed
import tokens from "https://framer.com/m/designTokens-42aq.js"

// --- Helper Function to Format Location (Unchanged from previous version) ---
const formatLocationString = (feature) => {
    if (!feature) return ""

    let pincode = ""
    let city = ""
    let state = ""
    const country = "India"

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

    if (!city && feature.place_type?.includes("place")) {
        city = feature.text
    }

    // Check if the main feature text itself is the pincode if not found in context
    if (!pincode && /^\d{6}$/.test(feature.text)) {
        pincode = feature.text
    }

    const parts = [pincode, city, state].filter(Boolean)
    let formatted = parts.join(", ")

    // Ensure pincode from main text is prioritized if context didn't provide one
    if (pincode && !parts.includes(pincode)) {
        formatted = `${pincode}${parts.length > 0 ? ", " + parts.join(", ") : ""}`
    }

    if (formatted) {
        formatted += ", " + country
    } else if (feature.place_name?.toLowerCase().includes("india")) {
        formatted = feature.place_name // Fallback to place_name if formatting fails but it's in India
    } else {
        formatted = feature.place_name
            ? `${feature.place_name}, ${country}`
            : country // Add India if missing
    }

    // Simple cleanup for potential double commas or leading/trailing commas
    formatted = formatted.replace(/, ,/g, ",").replace(/^,|,$/g, "").trim()

    return formatted
}

// --- Location Icon Function (Unchanged) ---
export function getLocationIcon(locationStatus) {
    const iconSize = 20
    const iconColor =
        locationStatus === "success"
            ? tokens.colors.green[600]
            : locationStatus === "error"
              ? tokens.colors.red[500]
              : tokens.colors.neutral[700]

    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            height={`${iconSize}px`}
            viewBox="0 -960 960 960"
            width={`${iconSize}px`}
            fill={iconColor}
            animate={
                locationStatus === "searching" ? { opacity: [1, 0.5, 1] } : {}
            }
            transition={
                locationStatus === "searching"
                    ? { repeat: Infinity, duration: 1.5 }
                    : {}
            }
            style={{ display: "block" }}
        >
            <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
        </motion.svg>
    )
}

// --- Main LocationField Component ---
export function LocationField({
    value,
    onChange, // Parent's state update function
    onFocus, // Parent's focus handler
    onBlur, // Parent's blur handler (we'll call this)
    error,
    showError = false,
    focusedField,
    inputRef,
    locationStatus,
    setLocationStatus, // Allow updating status (e.g., during pincode search)
    // locationResults (raw mapbox results) are managed internally now for pincode search
    // showLocationResults managed internally
    getCurrentLocation,
    enableLocationServices,
    setLocationResults: setParentLocationResults, // Allow clearing parent results if needed
    setShowLocationResults: setParentShowLocationResults, // Allow hiding parent dropdown
    searchLocation, // Parent's search function (MUST return Promise<MapboxFeature[] | null>)
    debugMode, // Pass debugMode down
}) {
    const locationResultsRef = useRef(null)
    const blurTimeoutRef = useRef(null)
    const isSelectingResult = useRef(false) // Flag to prevent blur logic during selection

    // Internal state to manage dropdown visibility and results for this component
    const [internalShowResults, setInternalShowResults] = useState(false)
    const [internalResults, setInternalResults] = useState([])

    const handleFocus = () => {
        if (onFocus) onFocus()
        // Clear any pending blur timeout
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current)
            blurTimeoutRef.current = null
        }
        // Show existing results if input has value and is focused
        if (value && value.length >= 3 && internalResults.length > 0) {
            setInternalShowResults(true)
        }
    }

    // --- MODIFIED handleBlur ---
    const handleBlur = async () => {
        // If we are currently selecting a result (onMouseDown fired), don't process blur yet
        if (isSelectingResult.current) {
            isSelectingResult.current = false // Reset flag
            return
        }

        // Call parent's blur handler first (e.g., for setting focusedField=null)
        if (onBlur) onBlur()

        // Check if value is a 6-digit pincode
        const pincodeRegex = /^\d{6}$/
        if (pincodeRegex.test(value)) {
            setLocationStatus("searching") // Show searching indicator
            setInternalShowResults(false) // Hide dropdown while searching pincode
            try {
                // We assume searchLocation returns the features array or null/throws error
                const results = await searchLocation(value)

                if (results && results.length > 0) {
                    // Found matches for the pincode, select the first one
                    const firstResult = results[0]
                    handleResultSelection(firstResult) // Format and update state
                    setLocationStatus("success")
                } else {
                    // Pincode search returned no results
                    if (debugMode)
                        console.log(`No results found for pincode: ${value}`)
                    setLocationStatus("error") // Indicate error or no match
                    // Optionally keep the pincode value as is or clear it/show error
                    // For now, keep the value, parent validation will catch it if needed
                    setInternalShowResults(false) // Ensure dropdown is hidden
                }
            } catch (error) {
                if (debugMode)
                    console.error("Error during pincode search on blur:", error)
                setLocationStatus("error")
                setInternalShowResults(false) // Ensure dropdown is hidden
            }
        } else {
            // Not a pincode, just hide the dropdown after a delay
            blurTimeoutRef.current = setTimeout(() => {
                setInternalShowResults(false)
                blurTimeoutRef.current = null
            }, 200) // Standard delay
        }
    }

    // Helper to handle selection (used by click and pincode blur)
    const handleResultSelection = (feature) => {
        const formattedValue = formatLocationString(feature)
        onChange({
            target: { name: "location", value: formattedValue },
        })
        setInternalResults([]) // Clear internal results
        setInternalShowResults(false) // Hide dropdown
        setParentLocationResults([]) // Clear parent results too (optional, but good practice)
        setParentShowLocationResults(false) // Hide parent dropdown too
        // Clear validation error for location if present (inform parent indirectly)
        onChange({
            target: {
                name: "location",
                value: formattedValue,
                clearError: true,
            },
        })
    }

    // Handles clicking on a result in the dropdown
    const handleResultClick = (feature) => {
        handleResultSelection(feature)
    }

    // Handle input change: update value and trigger search
    const handleInputChange = async (e) => {
        const currentValue = e.target.value
        onChange(e) // Update the raw value in the parent state

        if (currentValue.length >= 3) {
            setLocationStatus("searching") // Show searching state
            try {
                const results = await searchLocation(currentValue) // Wait for search
                if (results) {
                    setInternalResults(results)
                    setInternalShowResults(results.length > 0) // Show if results exist
                    setLocationStatus(results.length > 0 ? "idle" : "error") // Update status based on results
                } else {
                    setInternalResults([])
                    setInternalShowResults(false)
                    setLocationStatus("error")
                }
            } catch {
                setInternalResults([])
                setInternalShowResults(false)
                setLocationStatus("error")
            }
        } else {
            // Clear results if query is too short
            setInternalResults([])
            setInternalShowResults(false)
            setLocationStatus("idle")
        }
    }

    return (
        <div style={{ position: "relative" }}>
            <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600", // Corrected typo
                    color: tokens.colors.neutral[700],
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "10px",
                    fontFamily: "'Geist', sans-serif",
                }}
            >
                Location
            </label>

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "64px",
                    borderRadius: "10px",
                    backgroundColor: tokens.colors.neutral[50],
                    border: `0.5px solid ${
                        error && showError
                            ? tokens.colors.red[500]
                            : focusedField === "location"
                              ? tokens.colors.blue[500]
                              : tokens.colors.neutral[700]
                    }`,
                    boxShadow:
                        focusedField === "location"
                            ? `0px 0px 0px 4px ${tokens.colors.blue[200]}`
                            : "none",
                    transition: "box-shadow 0.2s, border 0.2s",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    name="location"
                    id="location"
                    placeholder="Area / Pincode / City"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur} // Use the new async blur handler
                    autoComplete="off"
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        outline: "none",
                        padding: "0 60px 0 20px",
                        fontSize: "16px",
                        letterSpacing: "-0.02em",
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: value ? "500" : "400", // Corrected typo
                        color: value
                            ? tokens.colors.neutral[700]
                            : tokens.colors.neutral[400],
                        backgroundColor: "transparent",
                    }}
                />
                {/* Location Icon / Button */}
                <div
                    style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor:
                            enableLocationServices &&
                            locationStatus !== "searching"
                                ? "pointer"
                                : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px",
                        opacity:
                            enableLocationServices &&
                            locationStatus !== "searching"
                                ? 1
                                : 0.5,
                    }}
                    onClick={
                        enableLocationServices && locationStatus !== "searching"
                            ? getCurrentLocation
                            : undefined
                    }
                    title={
                        enableLocationServices
                            ? "Use current location"
                            : "Location services disabled or busy"
                    }
                >
                    {getLocationIcon(locationStatus)}
                </div>
            </div>

            {/* Validation Error Message */}
            {error && showError && (
                <p
                    style={{
                        color: tokens.colors.red[500],
                        fontSize: "12px",
                        margin: "5px 0 0 0",
                        fontFamily: "'Geist', sans-serif",
                    }}
                >
                    {error}
                </p>
            )}

            {/* Location Results Dropdown (Uses internal state now) */}
            <AnimatePresence>
                {internalShowResults &&
                    internalResults &&
                    internalResults.length > 0 && (
                        <motion.div
                            ref={locationResultsRef}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            style={{
                                position: "absolute",
                                width: "100%",
                                maxHeight: "240px",
                                overflowY: "auto",
                                background: tokens.colors.white,
                                border: `1px solid ${tokens.colors.neutral[200]}`,
                                borderRadius: "10px",
                                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                                zIndex: 1000,
                                marginTop: "8px",
                                fontFamily: "'Geist', sans-serif",
                            }}
                        >
                            {internalResults.map((feature, index) => (
                                <div
                                    key={feature.id || index}
                                    style={{
                                        padding: "12px 16px",
                                        cursor: "pointer",
                                        borderBottom:
                                            index < internalResults.length - 1
                                                ? `1px solid ${tokens.colors.neutral[100]}`
                                                : "none",
                                        color: tokens.colors.neutral[700],
                                        fontSize: "14px",
                                        letterSpacing: "-0.02em",
                                        fontWeight: "400", // Corrected typo
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        transition:
                                            "background-color 0.1s ease",
                                    }}
                                    // Use onMouseDown to set flag and prevent blur logic during click
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        isSelectingResult.current = true // Set flag
                                        handleResultClick(feature)
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            tokens.colors.neutral[100]
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            tokens.colors.white
                                    }}
                                    title={feature.place_name}
                                >
                                    {feature.place_name}
                                </div>
                            ))}
                        </motion.div>
                    )}
            </AnimatePresence>
        </div>
    )
}
