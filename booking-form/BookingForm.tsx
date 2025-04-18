// BookingForm.jsx - Complete with Configuration Options
import { useState } from "react"
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
    skipInsuranceStep = false,
    skipFinancingStep = false,

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

    // Add insurance and financing steps if not skipped
    if (!skipInsuranceStep) totalSteps++
    if (!skipFinancingStep) totalSteps++

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

    // Adjust step numbers if insurance is skipped
    if (skipInsuranceStep && baseStep > 1) {
      adjustedStep--
    }

    // Adjust step numbers if financing is skipped
    if (skipFinancingStep && baseStep > (skipInsuranceStep ? 1 : 2)) {
      adjustedStep--
    }

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
      if (skipInsuranceStep && skipFinancingStep) {
        return "userInfo"
      } else if (skipInsuranceStep) {
        return "financing"
      } else {
        return "insurance"
      }
    }

    // Third step depends on configuration
    if (currentStep === 3) {
      if (skipInsuranceStep && skipFinancingStep) {
        return "verification"
      } else if (
        (skipInsuranceStep && !skipFinancingStep) ||
        (!skipInsuranceStep && skipFinancingStep)
      ) {
        return "userInfo"
      } else {
        return "financing"
      }
    }

    // Fourth step
    if (currentStep === 4) {
      if (skipInsuranceStep && skipFinancingStep) {
        // Only 2 steps before results: vehicle -> userInfo -> verification -> results
        return "success" // or "failure" but handled separately
      } else if (
        (skipInsuranceStep && !skipFinancingStep) ||
        (!skipInsuranceStep && skipFinancingStep)
      ) {
        // 3 steps before results
        return "verification"
      } else {
        // All steps enabled
        return "userInfo"
      }
    }

    // Fifth step
    if (currentStep === 5) {
      if (!skipInsuranceStep && !skipFinancingStep) {
        return "verification"
      } else {
        return "success" // or "failure" but handled separately
      }
    }

    // Sixth step (success or failure)
    if (currentStep === 6) {
      return "success" // or "failure" but handled separately
    }

    // Seventh step in full flow is failure
    if (currentStep === 7) {
      return "failure"
    }

    // Eighth step is failure
    if (currentStep === 8) {
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
      case "insurance":
        return "Vehicle Insurance"
      case "financing":
        return "Financing and Payment"
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
      case "insurance":
        return "Choose the right insurance coverage for your new electric vehicle."
      case "financing":
        return "Select your preferred payment method and financing options."
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
    if (skipInsuranceStep && skipFinancingStep) {
      goToStep(4) // Success state with minimal steps
    } else if (skipInsuranceStep || skipFinancingStep) {
      goToStep(5) // Success state with one skipped step
    } else {
      goToStep(6) // Success state with all steps
    }

    if (onFormSubmit) {
      onFormSubmit()
    }
  }

  const handlePaymentFailure = () => {
    setShowPaymentOverlay(false)
    // Go to failure step (depends on configuration)
    if (skipInsuranceStep && skipFinancingStep) {
      goToStep(5) // Failure state with minimal steps
    } else if (skipInsuranceStep || skipFinancingStep) {
      goToStep(6) // Failure state with one skipped step
    } else {
      goToStep(7) // Failure state with all steps
    }
  }

  // Styles
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100%",
    fontFamily: "'Geist', sans-serif",
    ...style,
  }

  const imageContainerStyle = {
    flex: "7",
    backgroundColor: "#1F2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  }

  const formContainerStyle = {
    flex: "3",
    backgroundColor: backgroundColor,
    padding: "1rem",
    overflowY: "auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  }

  const headerStyle = {
    marginBottom: "1rem",
  }

  const tagStyle = {
    fontSize: "0.875rem",
    color: tokens.colors.neutral[500],
    marginBottom: "0.25rem",
  }

  const headingStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.25rem",
    margin: 0,
  }

  const subheadingStyle = {
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    color: tokens.colors.neutral[600],
    marginBottom: "0",
  }

  const dividerStyle = {
    height: 1,
    backgroundColor: borderColor,
    marginTop: "1rem",
    marginBottom: "1rem",
  }

  const contentStyle = {
    flex: 1,
  }

  const logoContainerStyle = {
    position: "absolute",
    top: "1rem",
    left: "1rem",
    zIndex: 2,
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

      case "insurance":
        return (
          <InsuranceSelection
            selectedTenureId={
              bookingContext.formData.selectedTenure || ""
            }
            selectedProviderId={
              bookingContext.formData.selectedProvider || ""
            }
            selectedCoreInsuranceIds={
              bookingContext.formData.selectedCoreInsurance || []
            }
            selectedAdditionalCoverageIds={
              bookingContext.formData
                .selectedAdditionalCoverage || []
            }
            onFormDataChange={bookingContext.updateFormData}
            onPreviousStep={prevStep}
            onNextStep={nextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={apiBaseUrl}
          />
        )

      case "financing":
        return (
          <FinancingOptions
            selectedPaymentMethod={
              bookingContext.formData.paymentMethod ||
              "full-payment"
            }
            loanTenure={bookingContext.formData.loanTenure || 36}
            downPaymentAmount={
              bookingContext.formData.downPaymentAmount || 0
            }
            selectedVehicleId={
              bookingContext.formData.selectedVehicle || ""
            }
            selectedVariantId={
              bookingContext.formData.selectedVariant || ""
            }
            selectedLocation={
              bookingContext.formData.location || ""
            }
            onFormDataChange={bookingContext.updateFormData}
            onPreviousStep={prevStep}
            onNextStep={nextStep}
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
    debugLog("Configuration:", { skipInsuranceStep, skipFinancingStep })
  }

  return (
    <BookingProvider apiBaseUrl={apiBaseUrl} debug={enableDebug}>
      {(bookingContext) => (
        <div style={containerStyle} {...rest}>
          {/* Left side - Product Image */}
          <div style={imageContainerStyle}>
            <div style={logoContainerStyle}>
              <KMCircleLogo size={40} color={logoColor} />
            </div>
            <img
              src={productImage}
              alt="Kabira Mobility Bike"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Right side - Form Content */}
          <div style={formContainerStyle}>
            <div style={headerStyle}>
              <div style={tagStyle}>{headingText}</div>
              <h1 style={headingStyle}>{getStepTitle()}</h1>
              <p style={subheadingStyle}>
                {getStepDescription()}
              </p>
              <div style={dividerStyle} />
            </div>

            {/* Current step content */}
            <div style={contentStyle}>
              {renderCurrentStep(bookingContext)}
            </div>

            {/* Vehicle summary footer - Only show during form steps */}
            {getStepContent() !== "success" &&
              getStepContent() !== "failure" &&
              bookingContext.formData.selectedVehicle && (
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
                    bookingContext.formData.location ||
                    (bookingContext.formData.city &&
                      bookingContext.formData.state
                      ? `${bookingContext.formData.city}, ${bookingContext.formData.state}`
                      : "Select Location")
                  }
                  pincode={
                    bookingContext.formData.pincode || ""
                  }
                  totalPrice={
                    bookingContext.formData.totalPrice || 0
                  }
                  showEmiInfo={true}
                />
              )}
          </div>

          {/* Payment overlay */}
          {showPaymentOverlay && (
            <PaymentOverlay
              totalAmount={`₹${bookingContext.formData.totalPrice?.toLocaleString("en-IN") || "0"}`}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
              onCancel={() => setShowPaymentOverlay(false)}
              primaryColor={primaryColor}
            />
          )}

          {/* Debug overlay - only shown when debug is enabled */}
          {enableDebug && (
            <div
              style={{
                position: "fixed",
                bottom: 10,
                right: 10,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                padding: 10,
                borderRadius: 5,
                fontSize: 12,
                fontFamily: "monospace",
                zIndex: 9999,
                maxWidth: 300,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              <div>
                Step: {currentStep}/{calculateTotalSteps()}
              </div>
              <div>Content: {getStepContent()}</div>
              <div>
                Selected Vehicle:{" "}
                {bookingContext.formData.vehicleName || "None"}
              </div>
              <div>
                Price: ₹
                {bookingContext.formData.totalPrice || 0}
              </div>
              <button
                onClick={() =>
                  console.log(
                    "Current context:",
                    bookingContext
                  )
                }
                style={{ marginTop: 5, padding: "2px 5px" }}
              >
                Log Context
              </button>
            </div>
          )}
        </div>
      )}
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
  skipInsuranceStep: {
    type: ControlType.Boolean,
    title: "Skip Insurance Step",
    defaultValue: false,
    description: "Skip the insurance selection step",
  },
  skipFinancingStep: {
    type: ControlType.Boolean,
    title: "Skip Financing Step",
    defaultValue: false,
    description: "Skip the financing options step",
  },
})
