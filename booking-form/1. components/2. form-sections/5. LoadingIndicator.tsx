// Loading indicator component
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function LoadingIndicator(props) {
    const {
        text = "Loading...",
        showText = true,
        color = tokens.colors.blue[600],
        size = "medium", // small, medium, large
        style,
        ...rest
    } = props

    // Get spinner size based on size prop
    const getSpinnerSize = () => {
        switch (size) {
            case "small":
                return 24
            case "medium":
                return 32
            case "large":
                return 48
            default:
                return 32
        }
    }

    const spinnerSize = getSpinnerSize()

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacing[4],
        ...style,
    }

    const textStyle = {
        marginTop: tokens.spacing[3],
        color: tokens.colors.neutral[600],
        fontSize: tokens.fontSize.sm,
        fontFamily: "Geist, sans-serif",
    }

    return (
        <div style={containerStyle} {...rest}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                    width: spinnerSize,
                    height: spinnerSize,
                    borderRadius: "50%",
                    border: `3px solid ${tokens.colors.neutral[200]}`,
                    borderTopColor: color,
                }}
            />
            {showText && <div style={textStyle}>{text}</div>}
        </div>
    )
}

addPropertyControls(LoadingIndicator, {
    text: {
        type: ControlType.String,
        title: "Loading Text",
        defaultValue: "Loading...",
    },
    showText: {
        type: ControlType.Boolean,
        title: "Show Text",
        defaultValue: true,
    },
    color: {
        type: ControlType.Color,
        title: "Spinner Color",
        defaultValue: tokens.colors.blue[600],
    },
    size: {
        type: ControlType.Enum,
        title: "Size",
        options: ["small", "medium", "large"],
        defaultValue: "medium",
    },
})
