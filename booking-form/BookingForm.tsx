// BookingForm.tsx
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import BookingContainer from "https://framer.com/m/BookingContainer-841k.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function BookingForm(props) {
  const {
    // Basic settings
    initialStep = 1,
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],
    apiBaseUrl = "https://booking-engine.sagarsiwach.workers.dev/",
    logoColor = "#FFFFFF",
    headingText = "Book your Ride",
    productImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",

    // Configuration options
    enableDebug = false,

    // Event handlers
    onStepChange,
    onFormSubmit,

    // Styling
    style,
    ...rest
  } = props

  return (
    <BookingContainer
      initialStep={initialStep}
      primaryColor={primaryColor}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      apiBaseUrl={apiBaseUrl}
      logoColor={logoColor}
      headingText={headingText}
      productImage={productImage}
      onStepChange={onStepChange}
      onFormSubmit={onFormSubmit}
      style={style}
      enableDebug={enableDebug}
      {...rest}
    />
  )
}

addPropertyControls(BookingForm, {
  // Basic settings
  initialStep: {
    type: ControlType.Number,
    title: "Initial Step",
    defaultValue: 1,
    min: 1,
    max: 5,
    step: 1,
  },
  primaryColor: {
    type: ControlType.Color,
    title: "Primary Color",
    defaultValue: tokens.colors.blue[600],
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background Color",
    defaultValue: tokens.colors.neutral[50],
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: tokens.colors.neutral[200],
  },
  apiBaseUrl: {
    type: ControlType.String,
    title: "API Base URL",
    defaultValue: "https://booking-engine.sagarsiwach.workers.dev/",
    description: "Base URL for the API endpoint",
  },
  logoColor: {
    type: ControlType.Color,
    title: "Logo Color",
    defaultValue: "#FFFFFF",
  },
  headingText: {
    type: ControlType.String,
    title: "Heading",
    defaultValue: "Book your Ride",
  },
  productImage: {
    type: ControlType.Image,
    title: "Default Product Image",
  },

  // Configuration options
  enableDebug: {
    type: ControlType.Boolean,
    title: "Enable Debug Mode",
    defaultValue: false,
    description: "Show debug information and logs",
  },
})
