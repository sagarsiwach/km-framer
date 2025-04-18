// BookingForm.jsx
import { useState, useEffect } from "react";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import { BookingProvider } from "./hooks/createBookingContext";
import useStepNavigation from "./hooks/useStepNavigation";
import LoadingIndicator from "./components/form-sections/LoadingIndicator";
import ErrorDisplay from "./components/form-sections/ErrorDisplay";
import VehicleSummary from "./components/form-sections/VehicleSummary";
import { KMCircleLogo } from "https://framer.com/m/Logo-exuM.js";

// Import Step Components
import VehicleConfigStep from "./steps/VehicleConfigStep";
import InsuranceStep from "./steps/InsuranceStep";
import FinancingStep from "./steps/FinancingStep";
import UserInfoStep from "./steps/UserInfoStep";
import OTPVerificationStep from "./steps/OTPVerificationStep";
import PaymentOverlay from "./steps/PaymentOverlay";
import SuccessStep from "./steps/SuccessStep";
import FailureStep from "./steps/FailureStep";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function BookingForm(props) {
  const {
    initialStep = 1,
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],
    apiBaseUrl = "https://booking-engine.sagarsiwach.workers.dev/",
    logoColor = "#404040",
    headingText = "Book your Ride",
    productImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
    onStepChange,
    onFormSubmit,
    style,
    ...rest
  } = props;

  // State for step navigation
  const { currentStep, nextStep, prevStep, goToStep, resetSteps } = useStepNavigation(
    initialStep,
    8,
    onStepChange
  );

  // State for overlay
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);

  // State for global loading/error (outside context)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current step title and description
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Configure your Vehicle";
      case 2: return "Vehicle Insurance";
      case 3: return "Financing and Payment";
      case 4: return "Your Information";
      case 5: return "Verification";
      case 7: return "Booking Confirmed";
      case 8: return "Payment Failed";
      default: return "Book your Ride";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.";
      case 2: return "Choose the right insurance coverage for your new electric vehicle.";
      case 3: return "Select your preferred payment method and financing options.";
      case 4: return "Please provide your details for delivery and contact information.";
      case 5: return "Verify your contact information to proceed with payment.";
      default: return "";
    }
  };

  // Payment handlers
  const handlePaymentSuccess = () => {
    setShowPaymentOverlay(false);
    goToStep(7); // Success state

    if (onFormSubmit) {
      onFormSubmit(formData);
    }
  };

  const handlePaymentFailure = () => {
    setShowPaymentOverlay(false);
    goToStep(8); // Failure state
  };

  const handlePaymentCancel = () => {
    setShowPaymentOverlay(false);
  };

  // Render current step
  const renderCurrentStep = (bookingData) => {
    const { formData, updateFormData, errors, setErrors, vehicleData, loading, apiError } = bookingData;

    // Show loading or error state for initial load
    if (loading && currentStep === 1) {
      return (
        <LoadingIndicator
          text="Loading vehicle information..."
          size="large"
        />
      );
    }

    if (apiError && currentStep === 1) {
      return (
        <ErrorDisplay
          error={apiError}
          showRetry={true}
          retryText="Retry"
          onRetry={() => window.location.reload()}
        />
      );
    }

    // Render steps
    switch (currentStep) {
      case 1:
        return (
          <VehicleConfigStep
            location={formData.location}
            selectedVehicleId={formData.selectedVehicle}
            selectedVariantId={formData.selectedVariant}
            selectedColorId={formData.selectedColor}
            selectedComponents={formData.optionalComponents}
            onFormDataChange={(data) => updateFormData(data)}
            onNextStep={nextStep}
            errors={errors}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={apiBaseUrl}
          />
        );
      case 2:
        return (
          <InsuranceStep
            selectedTenureId={formData.selectedTenure}
            selectedProviderId={formData.selectedProvider}
            selectedCoreInsuranceIds={formData.selectedCoreInsurance}
            selectedAdditionalCoverageIds={formData.selectedAdditionalCoverage}
            onFormDataChange={(data) => updateFormData(data)}
            onPreviousStep={prevStep}
            onNextStep={nextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={apiBaseUrl}
          />
        );
      case 3:
        return (
          <FinancingStep
            selectedPaymentMethod={formData.paymentMethod}
            loanTenure={formData.loanTenure}
            downPaymentAmount={formData.downPaymentAmount}
            selectedVehicleId={formData.selectedVehicle}
            selectedVariantId={formData.selectedVariant}
            selectedLocation={formData.location}
            onFormDataChange={(data) => updateFormData(data)}
            onPreviousStep={prevStep}
            onNextStep={nextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={apiBaseUrl}
          />
        );
      case 4:
        return (
          <UserInfoStep
            fullName={formData.fullName}
            email={formData.email}
            phone={formData.phone}
            address={formData.address}
            city={formData.city}
            state={formData.state}
            pincode={formData.pincode}
            onFormDataChange={(data) => updateFormData(data)}
            onPreviousStep={prevStep}
            onNextStep={nextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        );
      case 5:
        return (
          <OTPVerificationStep
            phoneNumber={`+91 ${formData.phone || "9876543210"}`}
            email={formData.email || "user@example.com"}
            onPreviousStep={prevStep}
            onVerificationSuccess={() => {
              nextStep();
              setShowPaymentOverlay(true);
            }}
            onVerificationFailure={() => setErrors({
              otp: "Verification failed. Please try again."
            })}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            autoFillOTP="123456" // For testing
          />
        );
      case 7:
        return (
          <SuccessStep
            bookingId={`KM-${Math.floor(Math.random() * 9000000) + 1000000}`}
            customerName={formData.fullName || "Customer"}
            vehicleName={formData.vehicleName}
            estimatedDelivery="15 May, 2025"
            onViewBookingDetails={() => console.log("View booking details")}
            onTrackOrder={() => console.log("Track order")}
            onStartOver={() => resetSteps()}
            primaryColor={primaryColor}
          />
        );
      case 8:
        return (
          <FailureStep
            errorMessage="Your payment could not be processed at this time."
            errorCode="ERR-PAYMENT-3042"
            onTryAgain={() => setShowPaymentOverlay(true)}
            onContactSupport={() => console.log("Contact support")}
            onStartOver={() => resetSteps()}
            primaryColor={primaryColor}
          />
        );
      default:
        return <div>Step not implemented yet</div>;
    }
  };

  // Styles
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100%",
    fontFamily: tokens.fontFamily.sans,
    ...style,
  };

  const imageContainerStyle = {
    flex: "7", // 70% of available space
    backgroundColor: "#1F2937", // Dark background
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  };

  const formContainerStyle = {
    flex: "3", // 30% of available space
    backgroundColor: backgroundColor,
    padding: tokens.spacing[4],
    overflowY: "auto",
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginBottom: tokens.spacing[4],
  };

  const tagStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[500],
    marginBottom: tokens.spacing[1],
  };

  const headingStyle = {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing[1],
    margin: 0,
  };

  const subheadingStyle = {
    fontSize: tokens.fontSize.sm,
    lineHeight: tokens.lineHeight.relaxed,
    color: tokens.colors.neutral[600],
    marginBottom: tokens.spacing[0],
  };

  const dividerStyle = {
    height: 1,
    backgroundColor: tokens.colors.neutral[200],
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
  };

  const contentStyle = {
    flex: 1,
  };

  const watermarkStyle = {
    position: "absolute",
    fontSize: "200px",
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.15)",
    zIndex: 1,
  };

  const logoContainerStyle = {
    position: "absolute",
    top: tokens.spacing[4],
    left: tokens.spacing[4],
    zIndex: 2,
  };

  return (
    <BookingProvider apiBaseUrl={apiBaseUrl}>
      {(bookingData) => (
        <div style={containerStyle} {...rest}>
          {/* Left side - Product Image with watermark */}
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
              <p style={subheadingStyle}>{getStepDescription()}</p>
              <div style={dividerStyle} />
            </div>

            <div style={contentStyle}>
              {renderCurrentStep(bookingData)}
            </div>

            {/* Vehicle summary displayed at bottom */}
            {currentStep < 7 && bookingData.formData.selectedVehicle && (
              <VehicleSummary
                vehicleName={bookingData.formData.vehicleName}
                vehicleCode={bookingData.formData.vehicleCode}
                location={bookingData.formData.location ||
                  (bookingData.formData.city && bookingData.formData.state
                    ? `${bookingData.formData.city}, ${bookingData.formData.state}`
                    : "Select Location")}
                pincode={bookingData.formData.pincode}
                totalPrice={bookingData.formData.totalPrice}
                showEmiInfo={true}
              />
            )}
          </div>

          {/* Payment overlay (shown conditionally) */}
          {showPaymentOverlay && (
            <PaymentOverlay
              totalAmount={`₹${bookingData.formData.totalPrice.toLocaleString("en-IN")}`}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
              onCancel={handlePaymentCancel}
              primaryColor={primaryColor}
            />
          )}
        </div>
      )}
    </BookingProvider>
  );
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
});
