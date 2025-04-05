// TestRideForm.tsx - Simplified version
import React, { useState, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export function TestRideForm({
    title = "Book a Test Ride",
    subtitle = "Experience your dream bike at a location convenient for you.",
    backgroundImage,
    buttonColor = "#404040",
    buttonTextColor = "#FFFFFF",
    formBackgroundColor = "#FFFFFF",
    imageBackgroundColor = "#F5F5F5",
    style,
    ...props
}) {
    // Filter non-DOM props
    const {
        willChangeTransform,
        layoutId,
        layoutDependency,
        forceRender,
        ...validProps
    } = props

    // State
    const [formData, setFormData] = useState({
        pincode: "",
        fullName: "",
        phoneNumber: "",
    })
    const [errors, setErrors] = useState({})
    const [submitStatus, setSubmitStatus] = useState("idle") // idle, submitting, success
    const [isMobile, setIsMobile] = useState(false)

    // Refs
    const pincodeInputRef = useRef(null)
    const nameInputRef = useRef(null)
    const phoneInputRef = useRef(null)

    // Check mobile on mount
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const checkMobile = () => setIsMobile(window.innerWidth < 768)
            checkMobile()
            window.addEventListener("resize", checkMobile)
            return () => window.removeEventListener("resize", checkMobile)
        }
    }, [])

    // Form validation
    const validateForm = () => {
        const newErrors = {}

        if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
            newErrors.pincode = "Valid 6-digit pincode required"
        }

        if (!formData.fullName || formData.fullName.trim().length < 2) {
            newErrors.fullName = "Full name required"
        }

        if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Valid 10-digit number required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target

        if (name === "phoneNumber" || name === "pincode") {
            // Only allow digits for phone and pincode
            const digitsOnly = value.replace(/\D/g, "")
            setFormData((prev) => ({ ...prev, [name]: digitsOnly }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }))
        }
    }

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault()

        if (!validateForm()) {
            // Focus first field with error
            if (errors.pincode) pincodeInputRef.current?.focus()
            else if (errors.fullName) nameInputRef.current?.focus()
            else if (errors.phoneNumber) phoneInputRef.current?.focus()
            return
        }

        setSubmitStatus("submitting")

        // Simulate API call
        setTimeout(() => {
            console.log("Form submitted successfully:", formData)
            setSubmitStatus("success")
        }, 1500)
    }

    // Reset form
    const handleReset = () => {
        setFormData({ pincode: "", fullName: "", phoneNumber: "" })
        setErrors({})
        setSubmitStatus("idle")
    }

    // Style constants
    const BORDER_RADIUS = "8px"
    const INPUT_HEIGHT = "56px"

    // Common styles
    const labelStyle = {
        display: "block",
        fontSize: "12px",
        fontWeight: 600,
        color: "#555555",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "8px",
    }

    const inputStyle = {
        width: "100%",
        height: INPUT_HEIGHT,
        border: "1px solid #CCCCCC",
        borderRadius: BORDER_RADIUS,
        padding: "0 16px",
        fontSize: "16px",
        outline: "none",
        boxSizing: "border-box",
    }

    const errorMessageStyle = {
        color: "#FF3B30",
        fontSize: "12px",
        margin: "4px 0 0 0",
        minHeight: "16px",
    }

    // Get image URL
    const imageUrl = backgroundImage
        ? typeof backgroundImage === "object" && backgroundImage.src
            ? backgroundImage.src
            : typeof backgroundImage === "string"
              ? backgroundImage
              : null
        : null

    // Render form fields
    const renderFormContent = () => (
        <motion.div
            key="form-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1
                    style={{
                        fontSize: isMobile ? "26px" : "30px",
                        fontWeight: 700,
                        color: "#111111",
                        margin: "0 0 8px 0",
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p
                        style={{
                            fontSize: "15px",
                            color: "#555555",
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
                onSubmit={handleSubmit}
                noValidate
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    flexGrow: 1,
                }}
            >
                {/* Pincode Field */}
                <div>
                    <label htmlFor="pincode" style={labelStyle}>
                        Pincode
                    </label>
                    <input
                        ref={pincodeInputRef}
                        id="pincode"
                        name="pincode"
                        type="text"
                        placeholder="Enter 6-digit pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            borderColor: errors.pincode ? "#FF3B30" : "#CCCCCC",
                        }}
                        maxLength={6}
                        inputMode="numeric"
                    />
                    <p style={errorMessageStyle}>{errors.pincode || ""}</p>
                </div>

                {/* Full Name Field */}
                <div>
                    <label htmlFor="fullName" style={labelStyle}>
                        Full Name
                    </label>
                    <input
                        ref={nameInputRef}
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            borderColor: errors.fullName
                                ? "#FF3B30"
                                : "#CCCCCC",
                        }}
                        autoComplete="name"
                    />
                    <p style={errorMessageStyle}>{errors.fullName || ""}</p>
                </div>

                {/* Phone Number Field */}
                <div>
                    <label htmlFor="phoneNumber" style={labelStyle}>
                        Phone Number
                    </label>
                    <div
                        style={{
                            display: "flex",
                            height: INPUT_HEIGHT,
                            border: `1px solid ${errors.phoneNumber ? "#FF3B30" : "#CCCCCC"}`,
                            borderRadius: BORDER_RADIUS,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                width: "64px",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#F5F5F5",
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#555555",
                                borderRight: "1px solid #CCCCCC",
                            }}
                        >
                            +91
                        </div>
                        <input
                            ref={phoneInputRef}
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            maxLength={10}
                            inputMode="numeric"
                            style={{
                                ...inputStyle,
                                border: "none",
                                borderRadius: 0,
                                flexGrow: 1,
                            }}
                            autoComplete="tel-national"
                        />
                    </div>
                    <p style={errorMessageStyle}>{errors.phoneNumber || ""}</p>
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                    <motion.button
                        type="submit"
                        disabled={submitStatus === "submitting"}
                        style={{
                            width: "100%",
                            height: INPUT_HEIGHT,
                            background: buttonColor,
                            color: buttonTextColor,
                            border: "none",
                            borderRadius: BORDER_RADIUS,
                            fontSize: "18px",
                            fontWeight: 600,
                            cursor:
                                submitStatus === "submitting"
                                    ? "wait"
                                    : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: submitStatus === "submitting" ? 0.7 : 1,
                        }}
                        whileHover={
                            submitStatus !== "submitting" ? { scale: 1.02 } : {}
                        }
                        whileTap={
                            submitStatus !== "submitting" ? { scale: 0.98 } : {}
                        }
                    >
                        {submitStatus === "submitting" ? (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                <span>Processing...</span>
                                <motion.div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        border: `2px solid ${buttonTextColor}`,
                                        borderTopColor: "transparent",
                                        borderRadius: "50%",
                                    }}
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1,
                                        ease: "linear",
                                    }}
                                />
                            </div>
                        ) : (
                            "Register Now"
                        )}
                    </motion.button>

                    <p
                        style={{
                            fontSize: "12px",
                            color: "#666666",
                            margin: "16px 0 0 0",
                            lineHeight: 1.5,
                            textAlign: "center",
                        }}
                    >
                        By registering, you agree to our Privacy Policy and
                        allow us to contact you regarding your test ride.
                    </p>
                </div>
            </form>
        </motion.div>
    )

    // Success content
    const renderSuccessContent = () => (
        <motion.div
            key="success-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px",
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(120, 167, 90, 0.2)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "24px",
                }}
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="#78A75A"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    />
                </svg>
            </motion.div>

            <h2
                style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    margin: "0 0 16px 0",
                }}
            >
                Test Ride Booked!
            </h2>

            <p
                style={{
                    fontSize: "16px",
                    color: "#555555",
                    margin: "0 0 32px 0",
                    maxWidth: "320px",
                }}
            >
                Thank you! Our team will contact you shortly to confirm your
                appointment details.
            </p>

            <motion.button
                onClick={handleReset}
                style={{
                    padding: "12px 24px",
                    background: buttonColor,
                    color: buttonTextColor,
                    border: "none",
                    borderRadius: BORDER_RADIUS,
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Book Another Ride
            </motion.button>
        </motion.div>
    )

    return (
        <div
            style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                width: "100%",
                height: "100%",
                fontFamily: "'Inter', 'Helvetica', sans-serif",
                overflow: "hidden",
                background: isMobile ? formBackgroundColor : "#F5F5F5",
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                ...style,
            }}
            {...validProps}
        >
            {/* Image section (desktop only) */}
            {!isMobile && (
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        height: "100%",
                        background: imageBackgroundColor,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Test Ride"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
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
                                color: "#AAAAAA",
                                fontSize: "16px",
                            }}
                        >
                            Add Image
                        </div>
                    )}
                </div>
            )}

            {/* Form section */}
            <div
                style={{
                    width: isMobile ? "100%" : "420px",
                    flexShrink: 0,
                    height: isMobile ? "auto" : "100%",
                    padding: isMobile ? "24px 20px" : "40px",
                    background: formBackgroundColor,
                    boxSizing: "border-box",
                    overflowY: "auto",
                    display: "flex",
                }}
            >
                <AnimatePresence mode="wait">
                    {submitStatus === "success"
                        ? renderSuccessContent()
                        : renderFormContent()}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Property controls for Framer
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
            "Experience your dream bike at a location convenient for you.",
    },
    backgroundImage: {
        type: ControlType.ResponsiveImage,
        title: "Background Image",
    },
    buttonColor: {
        type: ControlType.Color,
        title: "Button Color",
        defaultValue: "#404040",
    },
    buttonTextColor: {
        type: ControlType.Color,
        title: "Button Text",
        defaultValue: "#FFFFFF",
    },
    formBackgroundColor: {
        type: ControlType.Color,
        title: "Form Background",
        defaultValue: "#FFFFFF",
    },
    imageBackgroundColor: {
        type: ControlType.Color,
        title: "Image Background",
        defaultValue: "#F5F5F5",
    },
})
