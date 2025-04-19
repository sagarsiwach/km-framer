// BookingForm.jsx - Complete with Configuration Options
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import { BookingProvider } from "https://framer.com/m/BookingContext-EFWo.js"
import useStepNavigation from "https://framer.com/m/useStepNavigation-xwZU.js"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import { KMCircleLogo } from "https://framer.com/m/Logo-exuM.js"
import LoadingIndicator from "https://framer.com/m/LoadingIndicator-7vLo.js"
import ErrorDisplay from "https://framer.com/m/ErrorDisplay-PmC2.js"
import VehicleSummary from "https://framer.com/m/VehicleSummary-GFVo.js"

// Step components
import VehicleConfiguration from "https://framer.com/m/VehicleConfiguration-rPPa.js@aphQnhW7QEZqgulxnSzZ"
import InsuranceSelection from "https://framer.com/m/InsuranceSelection-SIY2.js"
import FinancingOptions from "https://framer.com/m/FinancingOptions-wNCm.js"
import UserInformation from "https://framer.com/m/UserInformation-2F6M.js"
import OTPVerification from "https://framer.com/m/OTPVerification-vY2g.js"
import PaymentOverlay from "https://framer.com/m/PaymentOverlay-A9xm.js"
import SuccessState from "https://framer.com/m/SuccessState-f2Qo.js"
import FailureState from "https://framer.com/m/FailureState-ZmfY.js"

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

  // Calculate total steps based on configuration
  const calculateTotalSteps = () => {
    // Base steps: 1 (vehicle) + 4 (user info, OTP, success/fail)
    let totalSteps = 5

    return totalSteps
  }

  // Debug logging
  const debugLog = (...args) => {
    if (enableDebug) {
      console.log("BookingForm:", ...args)
    }
  }

  // Step navigation
  const { currentStep, nextStep, prevStep, goToStep, resetSteps } =
    useStepNavigation(initialStep, calculateTotalSteps(), onStepChange)

  // State for overlay
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false)

  // Get adjusted step number based on configuration
  const getAdjustedStepNumber = (baseStep) => {
    let adjustedStep = baseStep

    return adjustedStep
  }

  // Map current step to actual content based on configuration
  const getStepContent = () => {
    // Vehicle Configuration (always first)
    if (currentStep === 1) {
      return "vehicle"
    }

    // Second step depends on configuration
    if (currentStep === 2) {
      return "userInfo"
    }

    // Third step depends on configuration
    if (currentStep === 3) {
      return "verification"
    }

    // Fourth step
    if (currentStep === 4) {
      return "success" // or "failure" but handled separately
    }

    // Fifth step
    if (currentStep === 5) {
      return "failure"
    }

    return "vehicle" // Default fallback
  }

  // Get current step title and description
  const getStepTitle = () => {
    const currentContent = getStepContent()

    switch (currentContent) {
      case "vehicle":
        return "Configure your Vehicle"
      case "userInfo":
        return "Your Information"
      case "verification":
        return "Verification"
      case "success":
        return "Booking Confirmed"
      case "failure":
        return "Payment Failed"
      default:
        return "Book your Ride"
    }
  }

  const getStepDescription = () => {
    const currentContent = getStepContent()

    switch (currentContent) {
      case "vehicle":
        return "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom."
      case "userInfo":
        return "Please provide your details for delivery and contact information."
      case "verification":
        return "Verify your contact information to proceed with payment."
      default:
        return ""
    }
  }

  // Payment handlers
  const handlePaymentSuccess = () => {
    setShowPaymentOverlay(false)
    // Go to success step (depends on configuration)
    goToStep(4)

    if (onFormSubmit) {
      onFormSubmit()
    }
  }

  const handlePaymentFailure = () => {
    setShowPaymentOverlay(false)
    // Go to failure step (depends on configuration)
    goToStep(5)
  }

  // Responsive state
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Styles
  const desktopContainerStyle = {
    display: "flex",
    flexDirection: "row",
    width: "100vw",
    height: "100vh",
    fontFamily: "'Geist', sans-serif",
    background: backgroundColor,
    ...props.style,
  }
  const desktopImageStyle = {
    flex: 3,
    backgroundColor: "#1F2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  }
  const desktopBookingStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: backgroundColor,
    padding: "0 0.5rem",
    minWidth: 0,
    height: "100vh",
    overflow: "hidden",
  }
  const desktopFormHeaderStyle = {
    padding: "2rem 1rem 1rem 1rem",
    borderBottom: `1px solid ${borderColor}`,
  }
  const desktopFormContentStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "1rem",
    minHeight: 0,
  }
  const desktopSummaryFooterStyle = {
    borderTop: `1px solid ${borderColor}`,
    background: backgroundColor,
    padding: "1rem 1rem 0.5rem 1rem",
  }

  // Mobile Styles
  const mobileContainerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: backgroundColor,
    position: "relative",
    overflow: "hidden",
  }
  const mobileHeaderStyle = {
    flex: "0 0 auto",
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: backgroundColor,
    padding: 0,
    borderBottom: `1px solid ${borderColor}`,
  }
  const mobileContentStyle = {
    flex: "1 1 auto",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    padding: 0,
    minHeight: 0,
  }
  const mobileSummaryFooterStyle = {
    flex: "0 0 auto",
    position: "sticky",
    bottom: 0,
    zIndex: 3,
    background: backgroundColor,
    boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
    padding: "16px 0 0 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 0,
  }

  // Function to render step content
  const renderCurrentStep = (bookingContext) => {
    const content = getStepContent()
    debugLog("Rendering step:", currentStep, "content:", content)

    // Handle loading and error states for initial step
    if (bookingContext.loading && currentStep === 1) {
      return (
        <LoadingIndicator
          text="Loading vehicle information..."
          size="large"
        />
      )
    }

    if (bookingContext.apiError && currentStep === 1) {
      return (
        <ErrorDisplay
          error={bookingContext.apiError}
          showRetry={true}
          retryText="Retry"
          onRetry={() => window.location.reload()}
        />
      )
    }

    // Render specific step content
    switch (content) {
      case "vehicle":
        return (
          <VehicleConfiguration
            location={bookingContext.formData.location || ""}
            selectedVehicleId={
              bookingContext.formData.selectedVehicle || ""
            }
            selectedVariantId={
              bookingContext.formData.selectedVariant || ""
            }
            selectedColorId={
              bookingContext.formData.selectedColor || ""
            }
            selectedComponents={
              bookingContext.formData.optionalComponents || []
            }
            onFormDataChange={bookingContext.updateFormData}
            onNextStep={nextStep}
            errors={bookingContext.errors || {}}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={apiBaseUrl}
          />
        )

      case "userInfo":
        return (
          <UserInformation
            fullName={bookingContext.formData.fullName || ""}
            email={bookingContext.formData.email || ""}
            phone={bookingContext.formData.phone || ""}
            address={bookingContext.formData.address || ""}
            city={bookingContext.formData.city || ""}
            state={bookingContext.formData.state || ""}
            pincode={bookingContext.formData.pincode || ""}
            onFormDataChange={bookingContext.updateFormData}
            onPreviousStep={prevStep}
            onNextStep={nextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        )

      case "verification":
        return (
          <OTPVerification
            phoneNumber={`+91 ${bookingContext.formData.phone || "9876543210"}`}
            email={
              bookingContext.formData.email || "user@example.com"
            }
            onPreviousStep={prevStep}
            onVerificationSuccess={() => {
              nextStep()
              setShowPaymentOverlay(true)
            }}
            onVerificationFailure={() =>
              bookingContext.setErrors({
                ...bookingContext.errors,
                otp: "Verification failed. Please try again.",
              })
            }
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            autoFillOTP="123456" // For testing
          />
        )

      case "success":
        return (
          <SuccessState
            bookingId={`KM-${Math.floor(Math.random() * 9000000) + 1000000}`}
            customerName={
              bookingContext.formData.fullName || "Customer"
            }
            vehicleName={
              bookingContext.formData.vehicleName || "Vehicle"
            }
            estimatedDelivery="15 May, 2025"
            onViewBookingDetails={() =>
              console.log("View booking details")
            }
            onTrackOrder={() => console.log("Track order")}
            onStartOver={resetSteps}
            primaryColor={primaryColor}
          />
        )

      case "failure":
        return (
          <FailureState
            errorMessage="Your payment could not be processed at this time."
            errorCode="ERR-PAYMENT-3042"
            onTryAgain={() => setShowPaymentOverlay(true)}
            onContactSupport={() => console.log("Contact support")}
            onStartOver={resetSteps}
            primaryColor={primaryColor}
          />
        )

      default:
        return <div>Step not implemented yet</div>
    }
  }

  // Debug current step mapping
  if (enableDebug) {
    debugLog("Current step:", currentStep)
    debugLog("Current content:", getStepContent())
    debugLog("Step title:", getStepTitle())
  }

  return (
    <BookingProvider apiBaseUrl={apiBaseUrl} debug={enableDebug}>
      {(bookingContext) =>
        isMobile ? (
          <div style={mobileContainerStyle}>
            {/* MOBILE: Image sticks to top */}
            <div style={mobileHeaderStyle}>
              <img
                src={productImage}
                alt="Vehicle"
                style={{
                  width: "100%",
                  maxHeight: "180px",
                  objectFit: "cover",
                  display: "block",
                  borderBottom: `1px solid ${borderColor}`,
                }}
              />
            </div>
            {/* MOBILE: Scrollable content */}
            <div style={mobileContentStyle}>
              {renderCurrentStep(bookingContext)}
            </div>
            {/* MOBILE: Summary + button fixed at bottom */}
            <div style={mobileSummaryFooterStyle}>
              <VehicleSummary
                vehicleName={
                  bookingContext.formData.vehicleName || ""
                }
                vehicleCode={
                  bookingContext.formData.vehicleCode || ""
                }
                location={
                  bookingContext.formData.city &&
                    bookingContext.formData.state
                    ? `${bookingContext.formData.city}, ${bookingContext.formData.state}`
                    : "Select Location"
                }
                pincode={bookingContext.formData.pincode || ""}
                totalPrice={
                  bookingContext.formData.totalPrice || 0
                }
                showEmiInfo={true}
              />
              {/* You can add your navigation buttons here */}
            </div>
          </div>
        ) : (
          <div style={desktopContainerStyle}>
            {/* DESKTOP: 3/4 image, 1/4 booking */}
            <div style={desktopImageStyle}>
              <img
                src={productImage}
                alt="Vehicle"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div style={desktopBookingStyle}>
              <div style={desktopFormHeaderStyle}>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  {headingText}
                </h1>
                <div
                  style={{
                    fontSize: "1rem",
                    color: tokens.colors.neutral[600],
                    marginTop: 8,
                  }}
                >
                  {getStepTitle()}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {getStepDescription()}
                </div>
              </div>
              <div style={desktopFormContentStyle}>
                {renderCurrentStep(bookingContext)}
              </div>
              <div style={desktopSummaryFooterStyle}>
                <VehicleSummary
                  vehicleName={
                    bookingContext.formData.vehicleName ||
                    ""
                  }
                  vehicleCode={
                    bookingContext.formData.vehicleCode ||
                    ""
                  }
                  location={
                    bookingContext.formData.city &&
                      bookingContext.formData.state
                      ? `${bookingContext.formData.city}, ${bookingContext.formData.state}`
                      : "Select Location"
                  }
                  pincode={
                    bookingContext.formData.pincode || ""
                  }
                  totalPrice={
                    bookingContext.formData.totalPrice || 0
                  }
                  showEmiInfo={true}
                />
                {/* You can add your navigation buttons here */}
              </div>
            </div>
          </div>
        )
      }
    </BookingProvider>
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
