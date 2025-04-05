// LocationSearch.tsx
import React, { useRef } from "react"
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

const getFocusStyle = (focused) =>
    focused
        ? {
              borderColor: tokens.colors?.blue?.[500] || "#0077FF",
              boxShadow: `0px 0px 0px 3px ${tokens.colors?.blue?.[100] || "rgba(0, 119, 255, 0.25)"}`,
          }
        : {}

const getErrorStyle = (error) =>
    error
        ? {
              borderColor: tokens.colors?.red?.[500] || "#FF3B30",
              boxShadow: `0px 0px 0px 3px ${tokens.colors?.red?.[100] || "rgba(255, 59, 48, 0.25)"}`,
          }
        : {}

const errorMessageStyle = {
    color: tokens.colors?.red?.[500] || "#FF3B30",
    fontSize: "12px",
    margin: "4px 0 0 0",
    minHeight: "16px",
}

export function LocationStatusIcon({ status }) {
    const iconSize = "24px"
    const baseIconProps = {
        xmlns: "http://www.w3.org/2000/svg",
        height: iconSize,
        viewBox: "0 -960 960 960",
        width: iconSize,
    }

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

export function LocationField({
    label,
    name,
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    inputRef,
    locationStatus,
    locationResults,
    showLocationResults,
    getCurrentLocation,
    enableLocationServices,
    searchLocation,
    handleSelectLocation,
    // Don't pass isFocused to DOM elements
    isFocused,
    ...otherProps
}) {
    const resultsListRef = useRef(null)

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
                        ? getErrorStyle(true).boxShadow
                        : isFocused
                          ? getFocusStyle(true).boxShadow
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
                    id={name}
                    name={name}
                    type="text"
                    placeholder="Area / Pincode / City"
                    value={value}
                    onChange={(e) => {
                        onChange(e)
                        searchLocation(e.target.value)
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    autoComplete="off"
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

            {/* Location results */}
            {showLocationResults &&
                locationResults &&
                locationResults.length > 0 && (
                    <div
                        ref={resultsListRef}
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
                            <div
                                key={result.id || `location-${result.name}`}
                                style={{
                                    padding: "10px 16px",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    color:
                                        tokens.colors?.neutral?.[900] || "#333",
                                    borderBottom: `1px solid ${tokens.colors?.neutral?.[200] || "#eee"}`,
                                    background: tokens.colors?.white || "#fff",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background =
                                        tokens.colors?.neutral?.[100] ||
                                        "#f5f5f5"
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background =
                                        tokens.colors?.white || "#fff"
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    handleSelectLocation(result)
                                }}
                            >
                                {result.name}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    )
}
