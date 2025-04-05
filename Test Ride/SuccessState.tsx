// SuccessState.tsx
import React from "react"
import { motion } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js"

// --- Constants ---
const BORDER_RADIUS = "8px"

export function SuccessState({ onReset }) {
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
                </svg>
            </motion.div>
            <h2
                style={{
                    fontSize: "22px",
                    fontWeight: 600,
                    color: tokens.colors?.neutral?.[900] || "#333",
                    margin: "0 0 12px 0",
                }}
            >
                Test Ride Booked!
            </h2>
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
            </p>
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
            </motion.button>
        </motion.div>
    )
}
