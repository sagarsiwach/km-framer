// FormFields.tsx
import React from "react"
import { motion } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js" // Adjust path if needed

// --- InputField ---
export function InputField({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    showError = false,
    focusedField,
    inputRef,
    ...props
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: tokens.colors.neutral[700],
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "10px",
                    fontFamily: "'Geist', sans-serif",
                }}
            >
                {label}
            </label>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "64px",
                    borderRadius: "10px",
                    backgroundColor: tokens.colors.neutral[50],
                    border: `0.5px solid ${error && showError ? tokens.colors.red[500] : focusedField === name ? tokens.colors.blue[500] : tokens.colors.neutral[700]}`,
                    boxShadow:
                        focusedField === name
                            ? `0px 0px 0px 4px ${tokens.colors.blue[200]}`
                            : "none",
                    transition: "box-shadow 0.2s, border 0.2s",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <input
                    ref={inputRef}
                    type={type}
                    name={name}
                    id={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        outline: "none",
                        padding: "0 20px",
                        fontSize: "16px",
                        letterSpacing: "-0.02em",
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: value ? 500 : 400,
                        color: value
                            ? tokens.colors.neutral[700]
                            : tokens.colors.neutral[400],
                        backgroundColor: "transparent",
                    }}
                    {...props}
                />
            </div>
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
        </div>
    )
}

// --- PhoneField (Updated Styles for +91) ---
export function PhoneField({
    label,
    name,
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    showError = false,
    focusedField,
    inputRef,
    ...props
}) {
    return (
        <div>
            <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: tokens.colors.neutral[700],
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "10px",
                    fontFamily: "'Geist', sans-serif",
                }}
            >
                {label}
            </label>
            {/* Main container with border/shadow */}
            <div
                style={{
                    display: "flex",
                    height: "64px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: `0.5px solid ${error && showError ? tokens.colors.red[500] : focusedField === name ? tokens.colors.blue[500] : tokens.colors.neutral[700]}`,
                    background: tokens.colors.neutral[50],
                    boxShadow:
                        focusedField === name
                            ? `0px 0px 0px 4px ${tokens.colors.blue[200]}`
                            : "none",
                    transition: "box-shadow 0.2s, border 0.2s",
                }}
            >
                {/* Prefix Container */}
                <div
                    style={{
                        padding: "0 16px", // Use padding
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: tokens.colors.neutral[200],
                        fontWeight: 500,
                        fontSize: "16px",
                        letterSpacing: "-0.02em",
                        fontFamily: "'Geist', sans-serif",
                        color: tokens.colors.neutral[700],
                        flexShrink: 0, // *** PREVENT SHRINKING ***
                    }}
                >
                    +91
                </div>
                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="tel"
                    name={name}
                    id={name}
                    placeholder="10-digit phone number"
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    maxLength="10"
                    inputMode="numeric"
                    style={{
                        flexGrow: 1,
                        width: "auto",
                        height: "100%",
                        border: "none",
                        outline: "none",
                        padding: "0 16px", // Adjust padding
                        fontSize: "16px",
                        letterSpacing: "-0.02em",
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: value ? 500 : 400,
                        color: value
                            ? tokens.colors.neutral[700]
                            : tokens.colors.neutral[400],
                        background: "transparent",
                        minWidth: "100px", // Min width
                    }}
                    {...props}
                />
            </div>
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
        </div>
    )
}

// --- SubmitButton ---
export function SubmitButton({
    label = "Register Now",
    onClick,
    isSubmitting,
    buttonColor = tokens.colors.neutral[700],
    buttonTextColor = tokens.colors.white,
    ...props
}) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }} // Disable hover effect when submitting
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }} // Disable tap effect when submitting
            style={{
                width: "100%",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                background: buttonColor,
                color: buttonTextColor,
                border: "none",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                fontFamily: "'Geist', sans-serif",
                cursor: isSubmitting ? "default" : "pointer",
                marginBottom: "20px",
                position: "relative",
                overflow: "hidden",
                outline: "none",
                opacity: isSubmitting ? 0.7 : 1, // Dim button when submitting
                transition:
                    "opacity 0.2s ease-in-out, background-color 0.2s ease-in-out", // Smooth transition
            }}
            onFocus={(e) => {
                if (!isSubmitting)
                    e.target.style.boxShadow = `0px 0px 0px 4px ${tokens.colors.blue[200]}`
            }}
            onBlur={(e) => {
                e.target.style.boxShadow = "none"
            }}
            {...props}
        >
            {isSubmitting ? (
                <>
                    <span>Processing...</span>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                        }}
                        style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: `2px solid ${buttonTextColor}`,
                            borderTopColor: "transparent",
                            opacity: 0.8,
                        }}
                    />
                </>
            ) : (
                <>
                    <span>{label}</span>
                    {/* Arrow Icon */}
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z"
                            fill={buttonTextColor}
                        />
                    </svg>
                </>
            )}
        </motion.button>
    )
}

// --- PrivacyPolicyText ---
export function PrivacyPolicyText({ isMobile }) {
    return (
        <p
            style={{
                fontSize: isMobile ? "12px" : "clamp(12px, 1.8vh, 14px)", // Responsive font size
                color: tokens.colors.neutral[700],
                margin: 0,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                fontFamily: "'Geist', sans-serif",
            }}
        >
            By clicking on "Register Now" you are agreeing to our{" "}
            <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    color: tokens.colors.neutral[700],
                    textDecoration: "underline",
                }}
            >
                Privacy Policy
            </a>{" "}
            and are allowing us (Kabira Mobility) and our service partners to
            get in touch with you by e-mail, WhatsApp or phone call, only for
            the test ride related information.
        </p>
    )
}
