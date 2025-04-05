// LocationSearch.tsx
import React, { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js"

export function getLocationIcon(locationStatus) {
    switch (locationStatus) {
        case "searching":
            return (
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill={tokens.colors.blue[500]}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
                </motion.svg>
            )
        case "success":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill={tokens.colors.green[500]}
                >
                    <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
                </svg>
            )
        case "error":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill={tokens.colors.red[500]}
                >
                    <path d="m784-286-58-58q17-30 25.5-64t8.5-70q0-116-82-198t-198-82q-36 0-70 8.5T346-724l-58-58q35-21 72.5-35t79.5-19v-80h80v80q125 14 214.5 103.5T838-518h80v80h-80q-5 42-19 79.5T784-286ZM440-40v-80q-125-14-214.5-103.5T122-438H42v-80h80q5-42 19-79.5t35-72.5L56-790l56-56 736 736-58 56-118-120q-35 21-72.5 35T520-120v80h-80Zm40-158q36 0 70-8.5t64-25.5L234-612q-17 30-25.5 64t-8.5 70q0 116 82 198t198 82Z" />
                </svg>
            )
        default:
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32px"
                    viewBox="0 -960 960 960"
                    width="32px"
                    fill={tokens.colors.neutral[700]}
                >
                    <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
                </svg>
            )
    }
}

export function LocationField({
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    focusedField,
    inputRef,
    locationStatus,
    locationResults,
    showLocationResults,
    getCurrentLocation,
    enableLocationServices,
    setLocationResults,
    setShowLocationResults,
    searchLocation,
}) {
    const locationResultsRef = useRef(null)

    return (
        <div style={{ position: "relative" }}>
            <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: tokens.colors.neutral[700],
                    textTransform: "uppercase",
                    letterSpacing: "0.72px",
                    marginBottom: "10px",
                }}
            >
                Location
            </label>

            <div
                style={{
                    position: "relative",
                    display: "flex",
                    height: "64px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: `0.5px solid ${
                        error
                            ? tokens.colors.red[500]
                            : focusedField === "location"
                              ? tokens.colors.blue[500]
                              : tokens.colors.neutral[700]
                    }`,
                    background: tokens.colors.neutral[50],
                    boxShadow:
                        focusedField === "location"
                            ? `0px 0px 0px 3px ${tokens.colors.blue[200]}`
                            : "none",
                    transition: "box-shadow 0.2s, border 0.2s",
                }}
            >
                <div
                    style={{
                        width: "64px",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: tokens.colors.neutral[200],
                        cursor: enableLocationServices ? "pointer" : "default",
                    }}
                    onClick={
                        enableLocationServices ? getCurrentLocation : undefined
                    }
                >
                    {getLocationIcon(locationStatus)}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    name="location"
                    placeholder="Area / Pincode"
                    value={value}
                    onChange={(e) => {
                        onChange(e)
                        searchLocation(e.target.value)
                    }}
                    onFocus={onFocus}
                    onBlur={() => {
                        onBlur()
                        // Delay hiding results to allow for clicking
                        setTimeout(() => setShowLocationResults(false), 200)
                    }}
                    style={{
                        flex: 1,
                        height: "100%",
                        border: "none",
                        outline: "none",
                        padding: "0 20px",
                        fontSize: "20px",
                        color: tokens.colors.neutral[700],
                        background: tokens.colors.neutral[50],
                    }}
                />
            </div>

            {error && (
                <p
                    style={{
                        color: tokens.colors.red[500],
                        fontSize: "12px",
                        margin: "5px 0 0 0",
                    }}
                >
                    {error}
                </p>
            )}

            {/* Location Results Dropdown */}
            <AnimatePresence>
                {showLocationResults && locationResults.length > 0 && (
                    <motion.div
                        ref={locationResultsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: "absolute",
                            width: "100%",
                            maxHeight: "200px",
                            overflowY: "auto",
                            background: tokens.colors.white,
                            borderRadius: "10px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            zIndex: 10,
                            marginTop: "5px",
                        }}
                    >
                        {locationResults.map((result) => (
                            <div
                                key={result.id}
                                style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                                }}
                                onClick={() => {
                                    onChange({
                                        target: {
                                            name: "location",
                                            value: result.name,
                                        },
                                    })
                                    setLocationResults([])
                                    setShowLocationResults(false)
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background =
                                        tokens.colors.neutral[100]
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background =
                                        tokens.colors.white
                                }}
                            >
                                {result.name}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
