// FormFields.tsx
import React from "react"
import { motion } from "framer-motion"
import tokens from "https://framer.com/m/designTokens-42aq.js"

// Helper function to filter out non-standard React props
const filterDOMProps = (props) => {
    const {
        // List all Framer-specific props that shouldn't be passed to DOM
        willChangeTransform,
        layoutId,
        layoutIdKey,
        forceRender,
        forcePath,
        enableViewportScaling,
        transition,
        style,
        // Add any other props that cause issues
        ...validProps
    } = props

    // Keep style but ensure it's an object
    if (style) {
        validProps.style = style
    }

    return validProps
}

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
    focusedField,
    inputRef,
    ...props
}) {
    // Filter out non-standard props
    const safeProps = filterDOMProps(props)

    // Extract style from props to handle separately
    const { style: propStyle, ...otherSafeProps } = safeProps

    // Create base input style
    const inputStyle = {
        width: "100%",
        height: "64px",
        border: `0.5px solid ${
            error
                ? tokens.colors.red[500]
                : focusedField === name
                  ? tokens.colors.blue[500]
                  : tokens.colors.neutral[700]
        }`,
        borderRadius: "10px",
        padding: "0 20px",
        fontSize: "20px",
        color: tokens.colors.neutral[700],
        background: tokens.colors.neutral[50],
        outline: "none",
        boxSizing: "border-box",
        boxShadow:
            focusedField === name
                ? `0px 0px 0px 3px ${tokens.colors.blue[200]}`
                : "none",
        transition: "box-shadow 0.2s, border 0.2s",
        // Merge with prop style if provided
        ...(propStyle || {}),
    }

    return (
        <div>
            <label
                htmlFor={name}
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
                {label}
            </label>

            <input
                ref={inputRef}
                id={name}
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                style={inputStyle}
                {...otherSafeProps}
            />

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
    focusedField,
    inputRef,
    ...props
}) {
    // Filter out non-standard props
    const safeProps = filterDOMProps(props)

    return (
        <div>
            <label
                htmlFor={name}
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
                {label}
            </label>

            <div
                style={{
                    display: "flex",
                    height: "64px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: `0.5px solid ${
                        error
                            ? tokens.colors.red[500]
                            : focusedField === name
                              ? tokens.colors.blue[500]
                              : tokens.colors.neutral[700]
                    }`,
                    background: tokens.colors.neutral[50],
                    boxShadow:
                        focusedField === name
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
                        fontWeight: 600,
                        fontSize: "20px",
                        color: tokens.colors.neutral[700],
                    }}
                >
                    +91
                </div>

                <input
                    ref={inputRef}
                    id={name}
                    type="tel"
                    name={name}
                    placeholder="10-digit phone number"
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    maxLength="10"
                    style={{
                        flex: 1,
                        height: "100%",
                        border: "none",
                        outline: "none",
                        padding: "0 20px",
                        fontSize: "20px",
                        color: tokens.colors.neutral[700],
                        background: tokens.colors.neutral[50],
                        letterSpacing: "0.8px",
                    }}
                    {...safeProps}
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
        </div>
    )
}

export function SubmitButton({
    label = "Register Now",
    onClick,
    isSubmitting,
    buttonColor = tokens.colors.neutral[700],
    buttonTextColor = tokens.colors.white,
    ...props
}) {
    // For motion components, we still need to filter props
    // but motion handles most DOM compatibility internally
    const safeProps = filterDOMProps(props)

    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={isSubmitting}
            whileHover={isSubmitting ? {} : { scale: 1.01 }}
            whileTap={isSubmitting ? {} : { scale: 0.98 }}
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
                borderRadius: "0",
                fontSize: "20px",
                fontWeight: 600,
                fontFamily: "'Geist', sans-serif",
                cursor: isSubmitting ? "default" : "pointer",
                marginBottom: "20px",
                position: "relative",
                overflow: "hidden",
            }}
            {...safeProps}
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
                        }}
                    />
                </>
            ) : (
                <>
                    <span>{label}</span>
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

export function PrivacyPolicyText({ isMobile }) {
    return (
        <p
            style={{
                fontSize: isMobile ? "12px" : "14px",
                color: tokens.colors.neutral[700],
                margin: 0,
                lineHeight: 1.5,
            }}
        >
            By clicking on "Register Now" you are agreeing to our and consent to
            Kabira Mobility and our authorized dealers contacting you via phone,
            SMS, or email regarding your test ride request and related services.
        </p>
    )
}
