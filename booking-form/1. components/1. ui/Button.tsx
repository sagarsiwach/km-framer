// Button component with ShadCN styling and improved accessibility
import { addPropertyControls, ControlType } from "framer"
import { useState } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function Button(props) {
    const {
        text = "Button",
        rightIcon = false,
        leftIcon = false,
        primaryColor = tokens.colors.blue[600],
        textColor = "#FFFFFF",
        width = "100%",
        height = "auto",
        disabled = false,
        variant = "primary", // primary, secondary, outline, ghost, destructive
        size = "default", // small, default, large
        loading = false,
        onClick,
        type = "button",
        style,
        ...rest
    } = props

    // Determine size-based styling
    const getSizeStyles = () => {
        switch (size) {
            case "small":
                return {
                    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                    fontSize: tokens.fontSize.sm,
                }
            case "large":
                return {
                    padding: `${tokens.spacing[5]} ${tokens.spacing[8]}`,
                    fontSize: tokens.fontSize.lg,
                }
            default:
                return {
                    padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
                    fontSize: tokens.fontSize.base,
                }
        }
    }

    // Determine the button style based on the variant
    const getButtonStyle = () => {
        const baseStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderRadius: tokens.borderRadius.DEFAULT,
            fontFamily: "Geist, sans-serif",
            fontWeight: tokens.fontWeight.medium,
            letterSpacing: "-0.03em",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            width,
            height,
            opacity: disabled || loading ? 0.7 : 1,
            border: "none",
            position: "relative",
            ...getSizeStyles(),
        }

        // Apply variant-specific styles
        switch (variant) {
            case "primary":
                return {
                    ...baseStyle,
                    backgroundColor: primaryColor,
                    color: textColor,
                    border: "none",
                }
            case "secondary":
                return {
                    ...baseStyle,
                    backgroundColor: tokens.colors.neutral[100],
                    color: tokens.colors.neutral[900],
                    border: "none",
                }
            case "outline":
                return {
                    ...baseStyle,
                    backgroundColor: "transparent",
                    color: primaryColor,
                    border: `1px solid ${primaryColor}`,
                }
            case "ghost":
                return {
                    ...baseStyle,
                    backgroundColor: "transparent",
                    color: tokens.colors.neutral[900],
                }
            case "destructive":
                return {
                    ...baseStyle,
                    backgroundColor: tokens.colors.red[600],
                    color: "#FFFFFF",
                }
            default:
                return baseStyle
        }
    }

    // Loading spinner component
    const Spinner = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                animation: "spin 1s linear infinite",
                // Since we can't use CSS keyframes directly, implement the spin with inline style
                transform: `rotate(${Date.now() % 360}deg)`,
            }}
        >
            <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10" />
            <path d="M12 22c-5.5 0-10-4.5-10-10S6.5 2 12 2" />
        </svg>
    )

    // Right arrow icon
    const ArrowIcon = () => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4.16669 10H15.8334"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10 4.16669L15.8333 10L10 15.8334"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )

    return (
        <button
            style={{ ...getButtonStyle(), ...style }}
            onClick={!disabled && !loading ? onClick : undefined}
            disabled={disabled || loading}
            type={type}
            aria-disabled={disabled || loading}
            data-loading={loading}
            {...rest}
        >
            {loading && (
                <span
                    style={{
                        marginRight: text ? "8px" : 0,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <Spinner />
                </span>
            )}

            {leftIcon && !loading && (
                <span style={{ display: "flex", alignItems: "center" }}>
                    {leftIcon}
                </span>
            )}

            {text}

            {rightIcon && !loading && (
                <span style={{ display: "flex", alignItems: "center" }}>
                    <ArrowIcon />
                </span>
            )}
        </button>
    )
}

addPropertyControls(Button, {
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "Button",
    },
    rightIcon: {
        type: ControlType.Boolean,
        title: "Right Icon",
        defaultValue: false,
    },
    leftIcon: {
        type: ControlType.Boolean,
        title: "Left Icon",
        defaultValue: false,
    },
    primaryColor: {
        type: ControlType.Color,
        title: "Primary Color",
        defaultValue: tokens.colors.blue[600],
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#FFFFFF",
    },
    width: {
        type: ControlType.String,
        title: "Width",
        defaultValue: "100%",
    },
    height: {
        type: ControlType.String,
        title: "Height",
        defaultValue: "auto",
    },
    disabled: {
        type: ControlType.Boolean,
        title: "Disabled",
        defaultValue: false,
    },
    loading: {
        type: ControlType.Boolean,
        title: "Loading",
        defaultValue: false,
    },
    variant: {
        type: ControlType.Enum,
        title: "Variant",
        options: ["primary", "secondary", "outline", "ghost", "destructive"],
        defaultValue: "primary",
    },
    size: {
        type: ControlType.Enum,
        title: "Size",
        options: ["small", "default", "large"],
        defaultValue: "default",
    },
    type: {
        type: ControlType.Enum,
        title: "Type",
        options: ["button", "submit", "reset"],
        defaultValue: "button",
    },
})
