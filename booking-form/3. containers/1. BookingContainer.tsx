// booking-form/3. containers/1. BookingContainer.tsx
import { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import { KMCircleLogo } from "https://framer.com/m/Logo-exuM.js"
import { BookingProvider } from "https://framer.com/m/BookingContext-EFWo.js"
import useStepNavigation from "https://framer.com/m/useStepNavigation-xwZU.js"
import LoadingIndicator from "https://framer.com/m/LoadingIndicator-7vLo.js"
import ErrorDisplay from "https://framer.com/m/ErrorDisplay-PmC2.js"
import VehicleSummary from "https://framer.com/m/VehicleSummary-GFVo.js"
import Button from "https://framer.com/m/Button-FXtj.js"

// Import Step Components - we'll only use what we need
import VehicleConfiguration from "https://framer.com/m/VehicleConfiguration-rPPa.js"
import UserInformation from "https://framer.com/m/UserInformation-2F6M.js"
import OTPVerification from "https://framer.com/m/OTPVerification-vY2g.js"
import PaymentOverlay from "https://framer.com/m/PaymentOverlay-A9xm.js"
import SuccessState from "https://framer.com/m/SuccessState-f2Qo.js"
import FailureState from "https://framer.com/m/FailureState-ZmfY.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function BookingContainer(props) {
    const {
        initialStep = 1,
        primaryColor = tokens.colors.blue[600],
        backgroundColor = tokens.colors.neutral[50],
        borderColor = tokens.colors.neutral[200],
        apiBaseUrl = "https://booking-engine.sagarsiwach.workers.dev/",
        logoColor = "#404040",
        headingText = "Book your Ride",
        productImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
        enableDebug = false,
        onStepChange,
        onFormSubmit,
        style,
        ...rest
    } = props

    // Refs for scrollable content
    const contentRef = useRef(null)

    // Simplify the loading state management
    const [isLoading, setIsLoading] = useState(true)

    // State for payment overlay and responsive layout
    const [showPaymentOverlay, setShowPaymentOverlay] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [viewportHeight, setViewportHeight] = useState("100vh")

    // Debug logging
    const debugLog = (...args) => {
        if (enableDebug) {
            console.log("BookingForm:", ...args)
        }
    }

    // Check for mobile viewport and set dynamic viewport height
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
            debugLog("Mobile view:", window.innerWidth < 768)
        }

        const updateViewportHeight = () => {
            // Calculate 100dvh - 81px (nav bar height)
            let height
            try {
                // Modern approach with dvh
                height = `calc(100dvh - 81px)`
            } catch {
                // Fallback to window.innerHeight
                height = `${window.innerHeight - 81}px`
            }
            setViewportHeight(height)
            debugLog("Updated viewport height:", height)
        }

        // Initial checks
        checkMobile()
        updateViewportHeight()

        // Setup listeners for resize
        window.addEventListener("resize", checkMobile)
        window.addEventListener("resize", updateViewportHeight)

        // Cleanup
        return () => {
            window.removeEventListener("resize", checkMobile)
            window.removeEventListener("resize", updateViewportHeight)
        }
    }, [enableDebug])

    // Simplified step navigation - now we only have 3 main steps (plus success/failure)
    // 1: Vehicle Configuration
    // 2: User Information
    // 3: OTP Verification
    // 4: Success
    // 5: Failure
    const { currentStep, nextStep, prevStep, goToStep, resetSteps } =
        useStepNavigation(initialStep, 5, onStepChange)

    // Get step title and description
    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return "Configure your Vehicle"
            case 2:
                return "Your Information"
            case 3:
                return "Verification"
            case 4:
                return "Booking Confirmed"
            case 5:
                return "Payment Failed"
            default:
                return "Book your Ride"
        }
    }

    const getStepDescription = () => {
        switch (currentStep) {
            case 1:
                return "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom."
            case 2:
                return "Please provide your details for delivery and contact information."
            case 3:
                return "Verify your contact information to proceed with payment."
            default:
                return ""
        }
    }

    // Payment handlers
    const handlePaymentSuccess = () => {
        setShowPaymentOverlay(false)
        goToStep(4) // Success state
        debugLog("Payment success, navigating to step 4")

        if (onFormSubmit) {
            onFormSubmit()
        }
    }

    const handlePaymentFailure = () => {
        setShowPaymentOverlay(false)
        goToStep(5) // Failure state
        debugLog("Payment failure, navigating to step 5")
    }

    const handlePaymentCancel = () => {
        setShowPaymentOverlay(false)
        debugLog("Payment cancelled")
    }

    // Scroll content to top when step changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0
            debugLog("Scrolled content to top for step", currentStep)
        }
    }, [currentStep, enableDebug])

    // Styles for desktop layout
    const containerStyle = {
        display: "flex",
        width: "100%",
        height: viewportHeight,
        fontFamily: tokens.fontFamily.sans,
        ...style,
    }

    const imageContainerStyle = {
        flex: isMobile ? "none" : "7", // 70% of available space on desktop
        height: isMobile ? "200px" : "100%",
        backgroundColor: "#1F2937", // Dark background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
    }

    const formContainerStyle = {
        flex: isMobile ? 1 : "3", // Full width on mobile, 30% on desktop
        display: "flex",
        flexDirection: "column",
        height: isMobile ? `calc(${viewportHeight} - 200px)` : "100%", // Adjust for image height on mobile
        backgroundColor: backgroundColor,
        boxSizing: "border-box",
        position: "relative",
    }

    const headerStyle = {
        padding: isMobile ? "16px 16px" : tokens.spacing[4],
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: backgroundColor,
        position: "sticky",
        top: 0,
        zIndex: 10,
    }

    const tagStyle = {
        fontSize: tokens.fontSize.sm,
        color: tokens.colors.neutral[500],
        marginBottom: tokens.spacing[1],
    }

    const headingStyle = {
        fontSize: tokens.fontSize["2xl"],
        fontWeight: tokens.fontWeight.bold,
        marginBottom: tokens.spacing[1],
        margin: 0,
    }

    const subheadingStyle = {
        fontSize: tokens.fontSize.sm,
        lineHeight: tokens.lineHeight.relaxed,
        color: tokens.colors.neutral[600],
        marginBottom: tokens.spacing[0],
    }

    const contentStyle = {
        flex: 1,
        overflowY: "auto",
        padding: isMobile
            ? "16px 16px 160px"
            : `${tokens.spacing[4]}px ${tokens.spacing[4]}px 160px`,
    }

    const footerStyle = {
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTop: `1px solid ${borderColor}`,
        zIndex: 10,
        width: "100%",
    }

    const summaryStyle = {
        borderTop: `1px solid ${borderColor}`,
        padding: `${tokens.spacing[3]}px ${isMobile ? "16px" : tokens.spacing[4]}px`,
        marginTop: tokens.spacing[4],
    }

    const buttonContainerStyle = {
        padding: isMobile ? "0 16px 16px" : `0 ${tokens.spacing[4]}px 16px`,
        display: "flex",
        justifyContent: "space-between",
        gap: tokens.spacing[3],
    }

    const watermarkStyle = {
        position: "absolute",
        fontSize: "200px",
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.15)",
        zIndex: 1,
    }

    const logoContainerStyle = {
        position: "absolute",
        top: tokens.spacing[4],
        left: tokens.spacing[4],
        zIndex: 2,
    }

    const loadingContainerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: backgroundColor,
    }

    return (
        <BookingProvider apiBaseUrl={apiBaseUrl}>
            {({
                formData,
                updateFormData,
                errors,
                setErrors,
                vehicleData,
                loading,
                apiError,
                calculateTotalPrice,
            }) => {
                // Replace the complicated effect with a simpler one
                useEffect(() => {
                    if (vehicleData) {
                        // If we have vehicle data, set a timer to show loading for min 1.5s
                        const timer = setTimeout(() => {
                            setIsLoading(false)
                            debugLog("Loading complete, vehicle data available")
                        }, 1500)

                        return () => clearTimeout(timer)
                    }

                    // Add a failsafe to prevent infinite loading
                    const failsafe = setTimeout(() => {
                        if (isLoading) {
                            debugLog(
                                "Failsafe: Forcing loading to complete after timeout"
                            )
                            setIsLoading(false)
                        }
                    }, 10000) // 10 seconds max

                    return () => clearTimeout(failsafe)
                }, [vehicleData, isLoading])

                // Show loading screen while loading
                if (isLoading) {
                    return (
                        <div style={loadingContainerStyle}>
                            <LoadingIndicator
                                text="Loading booking interface..."
                                size="large"
                                color={primaryColor}
                            />
                        </div>
                    )
                }

                return (
                    <div
                        style={
                            isMobile
                                ? { flexDirection: "column", ...containerStyle }
                                : containerStyle
                        }
                        {...rest}
                    >
                        {/* Left side or Top (mobile) - Product Image with watermark */}
                        <div style={imageContainerStyle}>
                            <div style={logoContainerStyle}>
                                <KMCircleLogo size={40} color="#FFFFFF" />
                            </div>
                            <div style={watermarkStyle}>0</div>
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
                            </div>

                            <div style={contentStyle} ref={contentRef}>
                                {/* Loading and error states - show in-place, not full screen */}
                                {loading && currentStep === 1 ? (
                                    <LoadingIndicator
                                        text="Loading vehicle information..."
                                        size="large"
                                    />
                                ) : apiError && currentStep === 1 ? (
                                    <ErrorDisplay
                                        error={apiError}
                                        showRetry={true}
                                        retryText="Retry"
                                        onRetry={() => window.location.reload()}
                                    />
                                ) : (
                                    // Render current step
                                    <>
                                        {currentStep === 1 && (
                                            <VehicleConfiguration
                                                location={formData.location}
                                                selectedVehicleId={
                                                    formData.selectedVehicle
                                                }
                                                selectedVariantId={
                                                    formData.selectedVariant
                                                }
                                                selectedColorId={
                                                    formData.selectedColor
                                                }
                                                selectedComponents={
                                                    formData.optionalComponents
                                                }
                                                onFormDataChange={(data) =>
                                                    updateFormData(data)
                                                }
                                                onNextStep={nextStep}
                                                errors={errors}
                                                primaryColor={primaryColor}
                                                borderColor={borderColor}
                                                backgroundColor={
                                                    backgroundColor
                                                }
                                                dataEndpoint={apiBaseUrl}
                                                showFixedButton={false} // Disable fixed button in the component
                                            />
                                        )}

                                        {currentStep === 2 && (
                                            <UserInformation
                                                fullName={formData.fullName}
                                                email={formData.email}
                                                phone={formData.phone}
                                                address={formData.address}
                                                city={formData.city}
                                                state={formData.state}
                                                pincode={formData.pincode}
                                                onFormDataChange={(data) =>
                                                    updateFormData(data)
                                                }
                                                onPreviousStep={prevStep}
                                                onNextStep={nextStep}
                                                primaryColor={primaryColor}
                                                borderColor={borderColor}
                                                backgroundColor={
                                                    backgroundColor
                                                }
                                                showFixedButton={false}
                                            />
                                        )}

                                        {currentStep === 3 && (
                                            <OTPVerification
                                                phoneNumber={`+91 ${formData.phone || "9876543210"}`}
                                                email={
                                                    formData.email ||
                                                    "user@example.com"
                                                }
                                                onPreviousStep={prevStep}
                                                onVerificationSuccess={() => {
                                                    setShowPaymentOverlay(true)
                                                }}
                                                onVerificationFailure={() =>
                                                    setErrors({
                                                        otp: "Verification failed. Please try again.",
                                                    })
                                                }
                                                primaryColor={primaryColor}
                                                borderColor={borderColor}
                                                backgroundColor={
                                                    backgroundColor
                                                }
                                                autoFillOTP="123456" // For testing
                                                showFixedButton={false}
                                            />
                                        )}

                                        {currentStep === 4 && (
                                            <SuccessState
                                                bookingId={`KM-${Math.floor(Math.random() * 9000000) + 1000000}`}
                                                customerName={
                                                    formData.fullName ||
                                                    "Customer"
                                                }
                                                vehicleName={
                                                    formData.vehicleName
                                                }
                                                estimatedDelivery="15 May, 2025"
                                                onViewBookingDetails={() =>
                                                    console.log(
                                                        "View booking details"
                                                    )
                                                }
                                                onTrackOrder={() =>
                                                    console.log("Track order")
                                                }
                                                onStartOver={resetSteps}
                                                primaryColor={primaryColor}
                                            />
                                        )}

                                        {currentStep === 5 && (
                                            <FailureState
                                                errorMessage="Your payment could not be processed at this time."
                                                errorCode="ERR-PAYMENT-3042"
                                                onTryAgain={() =>
                                                    setShowPaymentOverlay(true)
                                                }
                                                onContactSupport={() =>
                                                    console.log(
                                                        "Contact support"
                                                    )
                                                }
                                                onStartOver={resetSteps}
                                                primaryColor={primaryColor}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Fixed footer with vehicle summary and action buttons */}
                            {currentStep < 4 && formData.selectedVehicle && (
                                <div style={footerStyle}>
                                    {/* Vehicle Summary */}
                                    <div style={summaryStyle}>
                                        <VehicleSummary
                                            vehicleName={formData.vehicleName}
                                            vehicleCode={formData.vehicleCode}
                                            location={
                                                formData.location ||
                                                (formData.city && formData.state
                                                    ? `${formData.city}, ${formData.state}`
                                                    : "Select Location")
                                            }
                                            pincode={formData.pincode}
                                            totalPrice={calculateTotalPrice()}
                                            showEmiInfo={true}
                                        />
                                    </div>

                                    {/* Action buttons for each step */}
                                    <div style={buttonContainerStyle}>
                                        {currentStep > 1 && (
                                            <Button
                                                text="Back"
                                                variant="outline"
                                                onClick={prevStep}
                                                primaryColor={primaryColor}
                                                style={{ flex: 1 }}
                                            />
                                        )}

                                        {currentStep === 1 && (
                                            <Button
                                                text="Continue to Personal Info"
                                                rightIcon={true}
                                                onClick={nextStep}
                                                disabled={
                                                    !formData.location ||
                                                    !formData.selectedVehicle
                                                }
                                                primaryColor={primaryColor}
                                                variant="primary"
                                                style={{
                                                    flex:
                                                        currentStep > 1 ? 2 : 1,
                                                }}
                                            />
                                        )}

                                        {currentStep === 2 && (
                                            <Button
                                                text="Continue to Verification"
                                                rightIcon={true}
                                                onClick={nextStep}
                                                primaryColor={primaryColor}
                                                variant="primary"
                                                style={{ flex: 2 }}
                                            />
                                        )}

                                        {currentStep === 3 && (
                                            <Button
                                                text="Verify & Proceed to Payment"
                                                rightIcon={true}
                                                onClick={() => {
                                                    setShowPaymentOverlay(true)
                                                }}
                                                primaryColor={primaryColor}
                                                variant="primary"
                                                style={{ flex: 2 }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment overlay (shown conditionally) */}
                        {showPaymentOverlay && (
                            <PaymentOverlay
                                totalAmount={`₹${calculateTotalPrice().toLocaleString("en-IN")}`}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentFailure={handlePaymentFailure}
                                onCancel={handlePaymentCancel}
                                primaryColor={primaryColor}
                            />
                        )}
                    </div>
                )
            }}
        </BookingProvider>
    )
}

addPropertyControls(BookingContainer, {
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
        defaultValue: "#404040",
    },
    headingText: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Book your Ride",
    },
    productImage: {
        type: ControlType.ResponsiveImage,
        title: "Default Product Image",
    },
    enableDebug: {
        type: ControlType.Boolean,
        title: "Enable Debug Mode",
        defaultValue: false,
        description: "Show debug information and logs",
    },
})
