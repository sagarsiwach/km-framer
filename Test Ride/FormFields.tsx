// FormFields.tsx - Fixed version
import React from "react"
import { motion } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js"

// --- Style Constants ---
const INPUT_HEIGHT = "56px"
const BORDER_RADIUS = "8px"

const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: tokens.colors?.neutral?.[700] || "#333",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
}

const inputBaseStyle = {
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

const errorMessageStyle = {
    color: tokens.colors?.red?.[500] || "#FF3B30",
    fontSize: "12px",
    margin: "4px 0 0 0",
    minHeight: "16px",
}

export function InputField({
    label,
    name,
    error,
    inputRef,
    type = "text",
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    autoComplete,
    // Don't pass isFocused to the DOM
    isFocused,
    // Importantly, remove any children props
    children, // Extract this so it doesn't get passed to input
    ...otherProps
}) {
    // Create dynamic styles based on state but don't pass as props
    const dynamicStyle = {
        ...inputBaseStyle,
        borderColor: error
            ? tokens.colors?.red?.[500] || "#FF3B30"
            : isFocused
              ? tokens.colors?.blue?.[500] || "#0077FF"
              : tokens.colors?.neutral?.[400] || "#ccc",
        boxShadow: error
            ? `0px 0px 0px 3px ${tokens.colors?.red?.[100] || "rgba(255, 59, 48, 0.25)"}`
            : isFocused
              ? `0px 0px 0px 3px ${tokens.colors?.blue?.[100] || "rgba(0, 119, 255, 0.25)"}`
              : "none",
    }

    return (
        <div style={{ width: "100%" }}>
            <label htmlFor={name} style={labelStyle}>
                {label}
            </label>
            <input
                ref={inputRef}
                style={dynamicStyle}
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
                {...otherProps}
            />
            <p id={`${name}-error`} style={errorMessageStyle}>
                {error || ""}
            </p>
        </div>
    )
}

export function PhoneField({
    label,
    name,
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    inputRef,
    // Don't pass isFocused to the DOM
    isFocused,
    // Importantly, remove any children props
    children, // Extract this so it doesn't get passed to input
    ...otherProps
}) {
    const containerStyle = {
        display: "flex",
        height: INPUT_HEIGHT,
        borderRadius: BORDER_RADIUS,
        overflow: "hidden",
        border: `1px solid ${error ? tokens.colors?.red?.[500] || "#FF3B30" : isFocused ? tokens.colors?.blue?.[500] || "#0077FF" : tokens.colors?.neutral?.[400] || "#ccc"}`,
        background: tokens.colors?.white || "#fff",
        boxShadow: error
            ? `0px 0px 0px 3px ${tokens.colors?.red?.[100] || "rgba(255, 59, 48, 0.25)"}`
            : isFocused
              ? `0px 0px 0px 3px ${tokens.colors?.blue?.[100] || "rgba(0, 119, 255, 0.25)"}`
              : "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxSizing: "border-box",
    }

    return (
        <div style={{ width: "100%" }}>
            <label htmlFor={name} style={labelStyle}>
                {label}
            </label>
            <div style={containerStyle}>
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
                    id={name}
                    name={name}
                    type="tel"
                    placeholder="10-digit number"
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel-national"
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
                    {...otherProps}
                />
            </div>
            <p id={`${name}-error`} style={errorMessageStyle}>
                {error || ""}
            </p>
        </div>
    )
}

export function SubmitButton({
    label = "Register Now",
    isSubmitting,
    buttonColor,
    buttonTextColor,
}) {
    const bgColor = buttonColor || tokens.colors?.neutral?.[800] || "#333"
    const textColor = buttonTextColor || tokens.colors?.white || "#fff"

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
        >
            {isSubmitting ? (
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
                    />
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <span>{label}</span>
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
                    </svg>
                </div>
            )}
        </motion.button>
    )
}

export function PrivacyPolicyText({ isMobile }) {
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
