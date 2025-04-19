// Error display component for forms
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function ErrorDisplay(props) {
    const {
        error = "",
        showRetry = false,
        retryText = "Retry",
        onRetry,
        style,
        ...rest
    } = props

    if (!error) return null

    const containerStyle = {
        padding: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
        backgroundColor: tokens.colors.red[50],
        color: tokens.colors.red[700],
        borderRadius: tokens.borderRadius.DEFAULT,
        fontSize: tokens.fontSize.sm,
        ...style,
    }

    const buttonStyle = {
        marginTop: tokens.spacing[3],
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
        backgroundColor: tokens.colors.red[600],
        color: "white",
        border: "none",
        borderRadius: tokens.borderRadius.DEFAULT,
        cursor: "pointer",
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.medium,
    }

    return (
        <div style={containerStyle} {...rest}>
            {error}
            {showRetry && onRetry && (
                <button style={buttonStyle} onClick={onRetry}>
                    {retryText}
                </button>
            )}
        </div>
    )
}

addPropertyControls(ErrorDisplay, {
    error: {
        type: ControlType.String,
        title: "Error Message",
        defaultValue: "",
    },
    showRetry: {
        type: ControlType.Boolean,
        title: "Show Retry Button",
        defaultValue: false,
    },
    retryText: {
        type: ControlType.String,
        title: "Retry Button Text",
        defaultValue: "Retry",
    },
})
