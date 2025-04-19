// Section title component for form sections
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function SectionTitle(props) {
    const {
        title = "Section Title",
        color = tokens.colors.neutral[600],
        uppercase = true,
        style,
        ...rest
    } = props

    const titleStyle = {
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.medium,
        color,
        textTransform: uppercase ? "uppercase" : "none",
        marginBottom: tokens.spacing[3],
        letterSpacing: "0.04em",
        ...style,
    }

    return (
        <div style={titleStyle} {...rest}>
            {title}
        </div>
    )
}

addPropertyControls(SectionTitle, {
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "Section Title",
    },
    color: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: tokens.colors.neutral[600],
    },
    uppercase: {
        type: ControlType.Boolean,
        title: "Uppercase",
        defaultValue: true,
    },
})
