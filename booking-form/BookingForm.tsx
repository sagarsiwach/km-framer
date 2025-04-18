// BookingForm.jsx
// Simple version to test basic functionality
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function BookingForm(props) {
  const { 
    headingText = "Book your Ride",
    style 
  } = props

  return (
    <div style={{ 
      ...style,
      padding: 20,
      backgroundColor: tokens.colors.neutral[50],
      fontFamily: tokens.fontFamily.sans
    }}>
      <h1>{headingText}</h1>
      <p>Simplified version for testing</p>
    </div>
  )

}

addPropertyControls(BookingForm, {
  initialStep: {
    type: ControlType.Number,
    title: "Initial Step",
    defaultValue: 1,
    min: 1,
    max: 8,
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
    defaultValue: "#404040",
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
})
