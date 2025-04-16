// SuccessState.tsx
import React from "react"
import { motion } from "framer-motion"
// Assuming tokens are correctly imported - replace with actual path if needed
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

// --- Updated Props ---
export function SuccessState({
    successButtonText = "Return to Home", // Default text
    successButtonLink = "/", // Default link
    // onReset, // Keep if needed for internal logic, but button doesn't call it directly now
}) {
    const handleButtonClick = () => {
        if (successButtonLink) {
            // Use window.location for standard navigation
            // Consider using Framer's navigation utilities if linking within a Framer prototype
            window.location.href = successButtonLink
        }
        // else if (onReset) { // Fallback?
        //     onReset();
        // }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center", // Center content vertically
                textAlign: "center",
                padding: "40px 20px", // Keep padding
                height: "100%", // Ensure it tries to fill its container
                fontFamily: "'Geist', sans-serif",
            }}
        >
            {/* Checkmark Icon (Unchanged) */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                }}
                style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: tokens.colors.green[100],
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "20px",
                    flexShrink: 0,
                }}
            >
                <motion.svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        delay: 0.4,
                        duration: 0.6,
                        ease: "easeInOut",
                    }}
                >
                    <motion.path
                        d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z"
                        fill={tokens.colors.green[600]}
                        stroke={tokens.colors.green[600]}
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    />
                </motion.svg>
            </motion.div>

            {/* Success Message (Unchanged) */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                style={{
                    fontSize: "clamp(20px, 3.5vh, 24px)",
                    fontWeight: 600,
                    letterSpacing: "-0.04em",
                    color: tokens.colors.neutral[900],
                    margin: "0 0 10px 0",
                }}
            >
                Test Ride Booked!
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                style={{
                    fontSize: "clamp(14px, 2vh, 16px)",
                    letterSpacing: "-0.02em",
                    color: tokens.colors.neutral[700],
                    margin: "0 0 30px 0",
                    lineHeight: 1.5,
                }}
            >
                Thank you for booking. Our team will contact you shortly to
                confirm.
            </motion.p>

            {/* --- Updated Button --- */}
            <motion.button // Keep as button for styling consistency, handle navigation in onClick
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleButtonClick} // Use the new handler
                style={{
                    padding: "12px 24px",
                    background: tokens.colors.green[600],
                    color: tokens.colors.white,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "clamp(14px, 2vh, 16px)",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    borderRadius: "6px",
                    outline: "none",
                    flexShrink: 0, // Prevent button shrinking
                }}
                onFocus={(e) => {
                    e.target.style.boxShadow = `0px 0px 0px 4px ${tokens.colors.green[200]}`
                }}
                onBlur={(e) => {
                    e.target.style.boxShadow = "none"
                }}
            >
                {successButtonText} {/* Use text from prop */}
            </motion.button>
        </motion.div>
    )
}
