// BookingForm.tsx - Attempting to fix warnings

import React, { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js"

// --- Helper Types --- (Same as before)
type FormErrors = { [key in keyof FormData]?: string | null }
type FormData = { location: string; fullName: string; phoneNumber: string }
type LocationStatus = "idle" | "searching" | "success" | "error" | "disabled"
type SubmitStatus = "idle" | "submitting" | "success" | "error"

// --- Constants --- (Same as before)
const INPUT_HEIGHT = "56px"
const BORDER_RADIUS = "8px"
const FALLBACK_MAPBOX_API_KEY =
    "pk.eyJ1Ijoic2FnYXJzaXdhY2giLCJhIjoiY205MzY4dmxjMGdndjJrc2NrZnZpM2FkbSJ9.ZeZW7bToRYitGJQKaCvGlA"

// --- Style Definitions --- (Same as before, using corrected token paths)
const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: tokens.colors?.neutral?.[700] || "#333",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
}
const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    height: INPUT_HEIGHT,
    border: `1px solid ${tokens.colors?.neutral?.[400] || "#ccc"}`,
    borderRadius: BORDER_RADIUS,
    padding: "0 16px",
    fontSize: "16px",
    color: tokens.colors?.neutral?.[900] || "#333",
    background: tokens.colors?.white || "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    appearance: "none",
}
const inputFocusStyle: React.CSSProperties = {
    borderColor: tokens.colors?.blue?.[500] || "#0077FF",
    boxShadow: `0px 0px 0px 3px ${tokens.colors?.blue?.[100] || "rgba(0, 119, 255, 0.25)"}`,
}
const inputErrorStyle: React.CSSProperties = {
    borderColor: tokens.colors?.red?.[500] || "#FF3B30",
    boxShadow: `0px 0px 0px 3px ${tokens.colors?.red?.[100] || "rgba(255, 59, 48, 0.25)"}`,
}
const errorMessageStyle: React.CSSProperties = {
    color: tokens.colors?.red?.[500] || "#FF3B30",
    fontSize: "12px",
    margin: "4px 0 0 0",
    minHeight: "16px",
}

// --- Helper Components ---

// **InputField with Prop Filtering**
function InputField({
    label,
    name,
    error,
    isFocused,
    inputRef,
    // Explicitly list known valid input props
    type = "text",
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    autoComplete,
    // Collect the rest, which might include invalid ones
    ...rest
}: {
    label: string
    name: keyof FormData
    error?: string | null
    isFocused: boolean
    inputRef: React.RefObject<HTMLInputElement>
    type?: string
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onFocus: () => void
    onBlur: () => void
    autoComplete?: string
    [key: string]: any // Allow other props but filter them
}) {
    // Only pass known valid props to the <input> element
    const validInputProps = {
        type,
        placeholder,
        value,
        onChange,
        onFocus,
        onBlur,
        autoComplete,
        id: name,
        name,
    }
    return (
        <div style={{ width: "100%" }}>
            <label htmlFor={name} style={labelStyle}>
                {label}
            </label>
            <input
                ref={inputRef}
                style={{
                    ...inputBaseStyle,
                    ...(error ? inputErrorStyle : {}),
                    ...(isFocused ? inputFocusStyle : {}),
                }}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
                {...validInputProps} // Pass only valid props
            />
            <p id={`${name}-error`} style={errorMessageStyle}>
                {error || ""}
            </p>
        </div>
    )
}

// **PhoneField - Input needs filtering too**
function PhoneField({
    label,
    name,
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    isFocused,
    inputRef,
}: any) {
    // Only pass known valid props to the <input> element
    const validInputProps = {
        type: "tel",
        placeholder: "10-digit number",
        value,
        onChange,
        onFocus,
        onBlur,
        maxLength: 10,
        inputMode: "numeric",
        pattern: "[0-9]*",
        id: name,
        name,
        autoComplete: "tel-national",
    }
    return (
        <div style={{ width: "100%" }}>
            <label htmlFor={name} style={labelStyle}>
                {label}
            </label>
            <div
                style={{
                    display: "flex",
                    height: INPUT_HEIGHT,
                    borderRadius: BORDER_RADIUS,
                    overflow: "hidden",
                    border: `1px solid ${error ? tokens.colors?.red?.[500] || "#FF3B30" : isFocused ? tokens.colors?.blue?.[500] || "#0077FF" : tokens.colors?.neutral?.[400] || "#ccc"}`,
                    background: tokens.colors?.white || "#fff",
                    boxShadow: error
                        ? inputErrorStyle.boxShadow
                        : isFocused
                          ? inputFocusStyle.boxShadow
                          : "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        width: "64px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: tokens.colors?.neutral?.[100] || "#f0f0f0",
                        fontWeight: 600,
                        fontSize: "16px",
                        color: tokens.colors?.neutral?.[600] || "#555",
                        flexShrink: 0,
                        borderRight: `1px solid ${tokens.colors?.neutral?.[400] || "#ccc"}`,
                    }}
                >
                    +91
                </div>
                <input
                    ref={inputRef}
                    style={{
                        ...inputBaseStyle,
                        border: "none",
                        borderRadius: "0",
                        boxShadow: "none",
                        height: "100%",
                        flexGrow: 1,
                        minWidth: 0,
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                    {...validInputProps} // Pass only valid props
                />
            </div>
            <p id={`${name}-error`} style={errorMessageStyle}>
                {error || ""}
            </p>
        </div>
    )
}

// **LocationStatusIcon - No props to filter usually** (Same as before)
function LocationStatusIcon({ status }: { status: LocationStatus }) {
    const iconSize = "24px"
    const baseIconProps = {
        xmlns: "http://www.w3.org/2000/svg",
        height: iconSize,
        viewBox: "0 -960 960 960",
        width: iconSize,
    }
    switch (status /* ... cases ... */) {
    } // Paste full switch statement here
    switch (status) {
        case "searching":
            return (
                <motion.svg
                    {...baseIconProps}
                    fill={tokens.colors?.blue?.[500] || "#0077FF"}
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        ease: "linear",
                    }}
                >
                    <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v110q42 27.5 73 68.5t47 81.5h100v80h-100q-16 48-47 81.5t-73 68.5v110h-80v-110q-63 31.5-126 60T480-160Zm0-80q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70Z" />
                </motion.svg>
            )
        case "error":
        case "disabled":
            return (
                <svg
                    {...baseIconProps}
                    fill={
                        status === "error"
                            ? tokens.colors?.red?.[500] || "#FF3B30"
                            : tokens.colors?.neutral?.[400] || "#aaa"
                    }
                >
                    <path d="m784-286-58-58q17-30 25.5-64t8.5-70q0-116-82-198t-198-82q-36 0-70 8.5T346-724l-58-58q35-21 72.5-35t79.5-19v-80h80v80q125 14 214.5 103.5T838-518h80v80h-80q-5 42-19 79.5T784-286ZM440-40v-80q-125-14-214.5-103.5T122-438H42v-80h80q5-42 19-79.5t35-72.5L56-790l56-56 736 736-58 56-118-120q-35 21-72.5 35T520-120v80h-80Zm40-158q36 0 70-8.5t64-25.5L234-612q-17 30-25.5 64t-8.5 70q0 116 82 198t198 82Z" />
                </svg>
            )
        case "success":
        case "idle":
        default:
            return (
                <svg {...baseIconProps} fill="#78A75A">
                    <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
                </svg>
            )
    }
}

// **LocationField - Input needs filtering**
function LocationField({
    label,
    name,
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    isFocused,
    inputRef,
    locationStatus,
    locationResults,
    showLocationResults,
    getCurrentLocation,
    enableLocationServices,
    searchLocation,
    handleSelectLocation,
}: any) {
    const resultsListRef = useRef<HTMLUListElement>(null)
    // Filter props for the input element
    const validInputProps = {
        type: "text",
        placeholder: "Area / Pincode / City",
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e)
            searchLocation(e.target.value)
        },
        onFocus,
        onBlur,
        id: name,
        name,
        autoComplete: "off",
    }
    return (
        <div style={{ position: "relative", width: "100%" }}>
            <label htmlFor={name} style={labelStyle}>
                {label}
            </label>
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    height: INPUT_HEIGHT,
                    borderRadius: BORDER_RADIUS,
                    overflow: "hidden",
                    border: `1px solid ${error ? tokens.colors?.red?.[500] || "#FF3B30" : isFocused ? tokens.colors?.blue?.[500] || "#0077FF" : tokens.colors?.neutral?.[400] || "#ccc"}`,
                    background: tokens.colors?.white || "#fff",
                    boxShadow: error
                        ? inputErrorStyle.boxShadow
                        : isFocused
                          ? inputFocusStyle.boxShadow
                          : "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxSizing: "border-box",
                }}
            >
                <motion.button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={
                        !enableLocationServices ||
                        locationStatus === "searching"
                    }
                    style={{
                        width: "56px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: tokens.colors?.neutral?.[100] || "#f0f0f0",
                        border: "none",
                        borderRight: `1px solid ${tokens.colors?.neutral?.[400] || "#ccc"}`,
                        padding: 0,
                        cursor: enableLocationServices
                            ? "pointer"
                            : "not-allowed",
                        flexShrink: 0,
                        opacity: enableLocationServices ? 1 : 0.5,
                    }}
                    whileTap={
                        enableLocationServices
                            ? { scale: 0.95, opacity: 0.8 }
                            : {}
                    }
                    title={
                        enableLocationServices
                            ? "Get Current Location"
                            : "Location Services Disabled"
                    }
                    aria-label="Get Current Location"
                >
                    <LocationStatusIcon
                        status={
                            enableLocationServices ? locationStatus : "disabled"
                        }
                    />
                </motion.button>
                <input
                    ref={inputRef}
                    style={{
                        ...inputBaseStyle,
                        border: "none",
                        borderRadius: "0",
                        boxShadow: "none",
                        height: "100%",
                        flexGrow: 1,
                        minWidth: 0,
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                    {...validInputProps} // Pass filtered props
                />
            </div>
            <p id={`${name}-error`} style={errorMessageStyle}>
                {error || ""}
            </p>
            <AnimatePresence>
                {showLocationResults && locationResults.length > 0 && (
                    <motion.ul
                        ref={resultsListRef}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 4 }}
                        exit={{ opacity: 0, y: -5 }}
                        style={{
                            position: "absolute",
                            width: "100%",
                            maxHeight: "180px",
                            overflowY: "auto",
                            background: tokens.colors?.white || "#fff",
                            borderRadius: BORDER_RADIUS,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            zIndex: 100,
                            marginTop: "4px",
                            padding: "4px 0",
                            listStyle: "none",
                            border: `1px solid ${tokens.colors?.neutral?.[300] || "#ccc"}`,
                        }}
                    >
                        {locationResults.map((result) => (
                            // *** Key prop is already here and should be correct ***
                            <motion.li
                                key={result.id}
                                style={{
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    color:
                                        tokens.colors?.neutral?.[900] || "#333",
                                    borderBottom: `1px solid ${tokens.colors?.neutral?.[200] || "#eee"}`,
                                }}
                                initial={{
                                    backgroundColor:
                                        tokens.colors?.white || "#fff",
                                }}
                                whileHover={{
                                    backgroundColor:
                                        tokens.colors?.neutral?.[100] ||
                                        "#f5f5f5",
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    handleSelectLocation(result)
                                }}
                            >
                                {result.name}
                            </motion.li>
                        ))}
                        <style>{`ul > li:last-child { border-bottom: none; }`}</style>
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    )
}

// **SubmitButton - No props passed to DOM button that need filtering** (Same as before)
function SubmitButton({
    label = "Register Now",
    isSubmitting,
    buttonColor,
    buttonTextColor,
    ...props
}: any) {
    const bgColor = buttonColor || tokens.colors?.neutral?.[800] || "#333"
    const textColor = buttonTextColor || tokens.colors?.white || "#fff"
    // We spread props here, but it's a motion component, which usually handles filtering
    // If warnings persist specifically for the button, we might need to filter here too
    return (
        <motion.button
            type="submit"
            disabled={isSubmitting}
            style={{
                width: "100%",
                height: INPUT_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 20px",
                background: bgColor,
                color: textColor,
                border: "none",
                borderRadius: BORDER_RADIUS,
                fontSize: "18px",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: isSubmitting ? "wait" : "pointer",
                position: "relative",
                overflow: "hidden",
                opacity: isSubmitting ? 0.7 : 1,
                boxSizing: "border-box",
            }}
            whileHover={
                !isSubmitting ? { scale: 1.02, filter: "brightness(110%)" } : {}
            }
            whileTap={
                !isSubmitting ? { scale: 0.98, filter: "brightness(90%)" } : {}
            }
            {...props}
        >
            {" "}
            <AnimatePresence mode="wait" initial={false}>
                {" "}
                {isSubmitting ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        {" "}
                        <span>Processing...</span>{" "}
                        <motion.div
                            style={{
                                width: "18px",
                                height: "18px",
                                border: `2px solid ${textColor}`,
                                borderTopColor: "transparent",
                                borderRadius: "50%",
                            }}
                            animate={{ rotate: 360 }}
                            transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                            }}
                        />{" "}
                    </motion.div>
                ) : (
                    <motion.div
                        key="label"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        {" "}
                        <span>{label}</span>{" "}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13.1717 12.0007L8.22168 7.05072L9.63589 5.63651L16.0001 12.0007L9.63589 18.3649L8.22168 16.9507L13.1717 12.0007Z"
                                fill={textColor}
                            />
                        </svg>{" "}
                    </motion.div>
                )}{" "}
            </AnimatePresence>{" "}
        </motion.button>
    )
}

// **PrivacyPolicyText - No props to filter** (Same as before)
function PrivacyPolicyText({ isMobile }: { isMobile: boolean }) {
    return (
        <p
            style={{
                fontSize: "12px",
                color: tokens.colors?.neutral?.[600] || "#555",
                margin: "16px 0 0 0",
                lineHeight: 1.5,
                textAlign: "center",
            }}
        >
            By clicking on "Register Now" you agree to our Privacy Policy and
            are allowing us (Kabira Mobility) and our service partners to get in
            touch with you by e-mail, SMS or phone call, only for the test ride
            related information.
        </p>
    )
}

// **SuccessState - No props to filter** (Same as before)
function SuccessState({ onReset }: { onReset: () => void }) {
    return (
        <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "40px 20px",
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            {" "}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 180,
                    damping: 15,
                }}
                style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "rgba(120, 167, 90, 0.2)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                {" "}
                <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="#78A75A"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                            delay: 0.3,
                            duration: 0.4,
                            ease: "easeOut",
                        }}
                    />
                </svg>{" "}
            </motion.div>{" "}
            <h2
                style={{
                    fontSize: "22px",
                    fontWeight: 600,
                    color: tokens.colors?.neutral?.[900] || "#333",
                    margin: "0 0 12px 0",
                }}
            >
                Test Ride Booked!
            </h2>{" "}
            <p
                style={{
                    fontSize: "15px",
                    color: tokens.colors?.neutral?.[700] || "#555",
                    margin: "0 0 32px 0",
                    lineHeight: 1.6,
                    maxWidth: "380px",
                }}
            >
                Thank you! Our team will contact you shortly to confirm your
                appointment details.
            </p>{" "}
            <motion.button
                type="button"
                whileHover={{ scale: 1.03, filter: "brightness(110%)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onReset}
                style={{
                    padding: "12px 24px",
                    background: "#78A75A",
                    color: "#fff",
                    border: "none",
                    borderRadius: BORDER_RADIUS,
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                }}
            >
                Book Another Ride
            </motion.button>{" "}
        </motion.div>
    )
}

// =====================================================================
// Main BookingForm Component
// =====================================================================

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function BookingForm({
    // Destructure known props expected by BookingForm itself
    title = "Book a Test Ride",
    subtitle = "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.",
    backgroundImage,
    apiEndpoint: apiEndpointProp = "",
    mapboxApiKey: mapboxApiKeyProp = "",
    enableLocationServices = true,
    showSubtitle = true,
    buttonColor,
    buttonTextColor,
    formBackgroundColor = tokens.colors?.white || "#FFFFFF",
    imageBackgroundColor = tokens.colors?.neutral?.[100] || "#F0F0F0",
    onSubmitSuccess,
    onSubmitError,
    style,
    // Collect potentially problematic Framer-injected props into 'rest'
    ...rest
}: {
    title?: string
    subtitle?: string
    backgroundImage?: any
    apiEndpoint?: string
    mapboxApiKey?: string
    enableLocationServices?: boolean
    showSubtitle?: boolean
    buttonColor?: string
    buttonTextColor?: string
    formBackgroundColor?: string
    imageBackgroundColor?: string
    onSubmitSuccess?: (data: FormData) => void
    onSubmitError?: (error: any) => void
    style?: React.CSSProperties
    [key: string]: any
}) {
    // --- State, Refs, Effective Keys/Endpoints (Same as before) ---
    const [formData, setFormData] = useState<FormData>({
        location: "",
        fullName: "",
        phoneNumber: "",
    })
    const [focusedField, setFocusedField] = useState<keyof FormData | null>(
        null
    )
    const [errors, setErrors] = useState<FormErrors>({})
    const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle")
    const [locationResults, setLocationResults] = useState<any[]>([])
    const [showLocationResults, setShowLocationResults] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle")
    const [isMobile, setIsMobile] = useState(false)
    const locationInputRef = useRef<HTMLInputElement>(null)
    const fullNameInputRef = useRef<HTMLInputElement>(null)
    const phoneInputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const effectiveMapboxApiKey = mapboxApiKeyProp || FALLBACK_MAPBOX_API_KEY
    const effectiveApiEndpoint =
        apiEndpointProp || "YOUR_WEBHOOK_OR_API_URL_HERE" // Still needs replacing if prop empty

    // --- Effects (Same as before) ---
    useEffect(() => {
        /* Mobile detection */ if (typeof window === "undefined") return
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])
    useEffect(() => {
        /* Click outside */ const handleClickOutside = (event: MouseEvent) => {
            if (
                locationInputRef.current &&
                !locationInputRef.current.contains(event.target as Node)
            ) {
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // --- Callbacks & Handlers (Same as before) ---
    const handleFocus = useCallback(
        (fieldName: keyof FormData) => {
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
            setShowLocationResults(false)
            setFocusedField(null)
        }, 150)
    }, [])
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target as {
                name: keyof FormData
                value: string
            }
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
        async (query: string) => {
            if (!effectiveMapboxApiKey) return
            if (!query || query.trim().length < 3) {
                setLocationResults([])
                setShowLocationResults(false)
                return
            }
            setLocationStatus("searching")
            setShowLocationResults(true)
            try {
                const e = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=${effectiveMapboxApiKey}&country=in&types=place,postcode,locality,neighborhood,district&limit=5`,
                    t = await fetch(e)
                if (!t.ok) throw new Error(`Mapbox API Error: ${t.statusText}`)
                const a = await t.json()
                a.features && a.features.length > 0
                    ? (setLocationResults(
                          a.features.map((f: any) => ({
                              id: f.id,
                              name: f.place_name,
                          }))
                      ),
                      setLocationStatus("success"))
                    : (setLocationResults([]), setLocationStatus("success"))
            } catch (e) {
                console.error("Loc search err:", e)
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
            async (p) => {
                const { latitude: lat, longitude: lon } = p.coords
                try {
                    const e = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${effectiveMapboxApiKey}&types=place,locality,neighborhood,address&limit=1`,
                        t = await fetch(e)
                    if (!t.ok)
                        throw new Error(`Mapbox Rev Geo Err: ${t.statusText}`)
                    const a = await t.json()
                    if (a.features && a.features.length > 0) {
                        setFormData((prev) => ({
                            ...prev,
                            location: a.features[0].place_name,
                        }))
                        setLocationStatus("success")
                        setErrors((prev) => ({ ...prev, location: null }))
                    } else throw new Error("No addr found.")
                } catch (e) {
                    console.error("Rev geo err:", e)
                    setLocationStatus("error")
                }
            },
            (e) => {
                console.error("Geo err:", e)
                setLocationStatus("error")
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
    }, [effectiveMapboxApiKey, enableLocationServices])
    const handleSelectLocation = useCallback((result: { name: string }) => {
        setFormData((prev) => ({ ...prev, location: result.name }))
        setLocationResults([])
        setShowLocationResults(false)
        setErrors((prev) => ({ ...prev, location: null }))
        locationInputRef.current?.focus()
    }, [])
    const validateForm = useCallback((): boolean => {
        const e: FormErrors = {}
        if (!formData.location || formData.location.trim().length < 3)
            e.location = "Valid location required"
        if (!formData.fullName || formData.fullName.trim().length < 2)
            e.fullName = "Full name required"
        if (!formData.phoneNumber) e.phoneNumber = "Phone required"
        else if (!/^\d{10}$/.test(formData.phoneNumber))
            e.phoneNumber = "Valid 10-digit number"
        setErrors(e)
        return Object.values(e).every((err) => !err)
    }, [formData])
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            setShowLocationResults(false)
            if (!validateForm()) {
                const firstErrorKey = Object.keys(errors).find(
                    (key) => errors[key as keyof FormErrors]
                ) as keyof FormData | undefined
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
                const res = await fetch(effectiveApiEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                if (res.ok) {
                    setSubmitStatus("success")
                    if (onSubmitSuccess) onSubmitSuccess(formData)
                    console.log("Success:", await res.text())
                } else {
                    const errTxt = await res.text()
                    setSubmitStatus("error")
                    if (onSubmitError)
                        onSubmitError(
                            new Error(
                                `API Error ${res.status}: ${errTxt || res.statusText}`
                            )
                        )
                    alert(`Submit failed: ${errTxt || res.status}`)
                    console.error("API Error:", errTxt)
                }
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
            errors,
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

    // --- Render ---
    const imageUrl = backgroundImage
        ? typeof backgroundImage === "object" && backgroundImage.src
            ? backgroundImage.src
            : typeof backgroundImage === "string"
              ? backgroundImage
              : null
        : null

    const renderFormContent = () => (
        /* ... Form content JSX structure (same as before) ... */
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
                {/* Fields */}
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

    // Filter out known invalid props before spreading 'rest' onto the outermost div
    const {
        forceRender,
        layoutId,
        layoutIdKey,
        willChangeTransform,
        ...validRestProps
    } = rest

    return (
        // *** Pass filtered ...validRestProps instead of ...rest ***
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
                    {" "}
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
                    )}{" "}
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
                <AnimatePresence mode="wait">
                    {submitStatus === "success" ? (
                        <SuccessState key="success" onReset={handleReset} />
                    ) : (
                        renderFormContent()
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// --- Property Controls (Same as before) ---
addPropertyControls(BookingForm, {
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
        description:
            "URL to send form data. Falls back to placeholder in code if empty.",
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
    onSubmitSuccess: { type: ControlType.EventHandler, title: "On Success" },
    onSubmitError: { type: ControlType.EventHandler, title: "On Error" },
})
