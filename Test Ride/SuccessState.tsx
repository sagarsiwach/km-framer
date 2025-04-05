// SuccessState.tsx
import React from "react"
import { motion } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js"

// Helper function to filter out non-standard React props
const filterDOMProps = (props) => {
    const {
        willChangeTransform,
        layoutId,
        layoutIdKey,
        forceRender,
        transition,
        minHeight,
        maxHeight,
        minWidth,
        maxWidth,
        style,
        ...validProps
    } = props

    if (style) {
        validProps.style = style
    }

    return validProps
}

export function SuccessState({ onReset, ...props }) {
    // Filter out non-standard props
    const safeProps = filterDOMProps(props)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "40px 20px",
            }}
            {...safeProps}
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: tokens.colors.green[100],
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z"
                        fill={tokens.colors.green[600]}
                    />
                </svg>
            </motion.div>

            <h2
                style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: tokens.colors.neutral[900],
                    margin: "0 0 10px 0",
                }}
            >
                Test Ride Booked!
            </h2>

            <p
                style={{
                    fontSize: "16px",
                    color: tokens.colors.neutral[700],
                    margin: "0 0 30px 0",
                    lineHeight: 1.5,
                }}
            >
                Thank you for booking a test ride. Our team will get in touch
                with you shortly to confirm your appointment.
            </p>

            <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                style={{
                    padding: "12px 24px",
                    background: tokens.colors.green[600],
                    color: tokens.colors.white,
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Geist', sans-serif",
                }}
            >
                Book Another Ride
            </motion.button>
        </motion.div>
    )
}
