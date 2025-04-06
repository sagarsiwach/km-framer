import { addPropertyControls, ControlType } from "framer";
import { useState, useEffect } from "react";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import { KMCircleLogo } from "https://framer.com/m/Logo-exuM.js";
import VehicleConfiguration from "https://framer.com/m/VehicleConfiguration-cIRx.js";
import InsuranceSelection from "https://framer.com/m/InsuranceSelection-nu9t.js";
import FinancingOptions from "https://framer.com/m/FinancingOptions-4dcm.js";
import UserInformation from "https://framer.com/m/UserInformation-xYrX.js";
import OTPVerification from "https://framer.com/m/OTPVerification-mv85.js";
import PaymentOverlay from "https://framer.com/m/PaymentOverlay-7FFR.js";
import SuccessState from "https://framer.com/m/SuccessState-QhT8.js";
import FailureState from "https://framer.com/m/FailureState-znrM.js";

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

    // API endpoints
    vehicleDataEndpoint = "",
    insuranceDataEndpoint = "",

    // Customization
    logoColor = "#404040",
    headingText = "Book your Ride",
    productImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",

    // Optional callbacks
    onStepChange,
    onFormSubmit,

    style,
    ...rest
  } = props;

  // State management
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const [formData, setFormData] = useState({
    // Vehicle Configuration data
    location: "",
    selectedVehicle: "km3000", // Default for testing
    selectedVariant: "",
    selectedColor: "",
    optionalComponents: [],

    // Insurance data
    selectedTenure: "",
    selectedProvider: "",
    selectedCoreInsurance: [],
    selectedAdditionalCoverage: [],

    // Financing data
    paymentMethod: "full-payment",
    loanTenure: 36,
    downPaymentAmount: 0,

    // User information
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // Vehicle summary data (static for now)
    totalPrice: 202236,
    vehicleName: "KM3000",
    vehicleCode: "B18-0001",
  });
  const [errors, setErrors] = useState({});

  // Handle step transitions
  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    if (onStepChange) {
      onStepChange(nextStep);
    }

    // Show payment overlay after OTP verification
    if (nextStep === 6) {
      setShowPaymentOverlay(true);
    }
  };

  const handlePreviousStep = () => {
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep > 0 ? prevStep : 1);

    if (onStepChange) {
      onStepChange(prevStep > 0 ? prevStep : 1);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    // Optionally reset form data here
  };

  // Handle form field updates
  const updateFormData = (section, data) => {
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }));

    // Clear any errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(data).forEach((key) => {
      if (clearedErrors[key]) {
        delete clearedErrors[key];
      }
    });

    setErrors(clearedErrors);
  };

  // Methods for each step
  const handleVehicleConfigurationUpdate = (data) => {
    updateFormData("vehicleConfig", {
      location: data.location,
      selectedVehicle: data.vehicle,
      selectedVariant: data.variant,
      selectedColor: data.color,
      optionalComponents: data.components || [],
    });
  };

  const handleInsuranceSelectionUpdate = (data) => {
    updateFormData("insurance", {
      selectedTenure: data.tenure,
      selectedProvider: data.provider,
      selectedCoreInsurance: data.coreInsurance || [],
      selectedAdditionalCoverage: data.additionalCoverage || [],
    });
  };

  const handleFinancingOptionsUpdate = (data) => {
    updateFormData("financing", {
      paymentMethod: data.paymentMethod,
      loanTenure: data.loanTenure,
      downPaymentAmount: data.downPaymentAmount,
    });
  };

  const handleUserInformationUpdate = (data) => {
    updateFormData("userInfo", data);
  };

  // Payment result handlers
  const handlePaymentSuccess = () => {
    setShowPaymentOverlay(false);
    setCurrentStep(7); // Success state
  };

  const handlePaymentFailure = () => {
    setShowPaymentOverlay(false);
    setCurrentStep(8); // Failure state
  };

  const handlePaymentCancel = () => {
    setShowPaymentOverlay(false);
  };

  // Get current step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Configure your Vehicle";
      case 2:
        return "Vehicle Insurance";
      case 3:
        return "Financing and Payment";
      case 4:
        return "Your Information";
      case 5:
        return "Verification";
      case 7:
        return "Booking Confirmed";
      case 8:
        return "Payment Failed";
      default:
        return "Book your Ride";
    }
  };

  // Get current step description
  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.";
      case 2:
        return "Choose the right insurance coverage for your new electric vehicle.";
      case 3:
        return "Select your preferred payment method and financing options.";
      case 4:
        return "Please provide your details for delivery and contact information.";
      case 5:
        return "Verify your contact information to proceed with payment.";
      case 7:
      case 8:
        return "";
      default:
        return "";
    }
  };

  // Main container style
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100%",
    fontFamily: tokens.fontFamily.sans,
    ...style,
  };

  // Left side with image
  const imageContainerStyle = {
    flex: "7", // 70% of available space
    backgroundColor: "#1F2937", // Dark background
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  };

  // Right side with form
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

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VehicleConfiguration
            location={formData.location}
            selectedVehicleId={formData.selectedVehicle}
            selectedVariantId={formData.selectedVariant}
            selectedColorId={formData.selectedColor}
            selectedComponents={formData.optionalComponents}
            onFormDataChange={handleVehicleConfigurationUpdate}
            onNextStep={handleNextStep}
            errors={errors}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={vehicleDataEndpoint}
          />
        );
      case 2:
        return (
          <InsuranceSelection
            selectedTenureId={formData.selectedTenure}
            selectedProviderId={formData.selectedProvider}
            selectedCoreInsuranceIds={formData.selectedCoreInsurance}
            selectedAdditionalCoverageIds={formData.selectedAdditionalCoverage}
            onFormDataChange={handleInsuranceSelectionUpdate}
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={insuranceDataEndpoint}
          />
        );
      case 3:
        return (
          <FinancingOptions
            selectedPaymentMethod={formData.paymentMethod}
            loanTenure={formData.loanTenure}
            downPaymentAmount={formData.downPaymentAmount}
            onFormDataChange={handleFinancingOptionsUpdate}
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        );
      case 4:
        return (
          <UserInformation
            fullName={formData.fullName}
            email={formData.email}
            phone={formData.phone}
            address={formData.address}
            city={formData.city}
            state={formData.state}
            pincode={formData.pincode}
            onFormDataChange={handleUserInformationUpdate}
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        );
      case 5:
        return (
          <OTPVerification
            phoneNumber={`+91 ${formData.phone || "9876543210"}`}
            email={formData.email || "user@example.com"}
            onPreviousStep={handlePreviousStep}
            onVerificationSuccess={handleNextStep}
            onVerificationFailure={() =>
              setErrors({
                otp: "Verification failed. Please try again.",
              })
            }
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            autoFillOTP="123456" // For testing
          />
        );
      case 7:
        return (
          <SuccessState
            bookingId="KM-9876543"
            customerName={formData.fullName || "Customer"}
            vehicleName={formData.vehicleName}
            estimatedDelivery="15 May, 2025"
            onViewBookingDetails={() => console.log("View booking details")}
            onTrackOrder={() => console.log("Track order")}
            onStartOver={handleStartOver}
            primaryColor={primaryColor}
          />
        );
      case 8:
        return (
          <FailureState
            errorMessage="Your payment could not be processed at this time."
            errorCode="ERR-PAYMENT-3042"
            onTryAgain={() => setShowPaymentOverlay(true)}
            onContactSupport={() => console.log("Contact support")}
            onStartOver={handleStartOver}
            primaryColor={primaryColor}
          />
        );
      default:
        return <div>Step not implemented yet</div>;
    }
  };

  // Display vehicle summary for the selected vehicle (if any)
  const renderVehicleSummary = () => {
    // Don't show summary in success/failure screens
    if (currentStep >= 7) return null;

    // Only show summary if a vehicle is selected
    if (!formData.selectedVehicle) return null;

    // This would be dynamically determined based on selected vehicle and options
    // For now using placeholder data
    return (
      <div
        style={{
          marginTop: tokens.spacing[4],
          borderTop: `1px solid ${tokens.colors.neutral[200]}`,
          paddingTop: tokens.spacing[3],
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: tokens.spacing[1],
          }}
        >
          <div
            style={{
              fontSize: tokens.fontSize.xl,
              fontWeight: tokens.fontWeight.bold,
            }}
          >
            {formData.vehicleName}
          </div>
          <div
            style={{
              fontSize: tokens.fontSize.xs,
              color: tokens.colors.neutral[600],
            }}
          >
            {formData.vehicleCode}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: tokens.spacing[2],
          }}
        >
          <div>
            <div style={{ fontSize: tokens.fontSize.sm }}>
              Delivery Location
            </div>
            <div style={{ fontSize: tokens.fontSize.base }}>
              {formData.location ||
                (formData.city && formData.state
                  ? `${formData.city}, ${formData.state}`
                  : "Select Location")}
            </div>
            {formData.pincode && (
              <div
                style={{
                  fontSize: tokens.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}
              >
                {formData.pincode}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: tokens.fontSize.xl,
                fontWeight: tokens.fontWeight.bold,
              }}
            >
              ₹{formData.totalPrice.toLocaleString("en-IN")}
            </div>
            <div
              style={{
                fontSize: tokens.fontSize.xs,
                color: tokens.colors.neutral[600],
              }}
            >
              EMI Starting from ₹499/mo
            </div>
            <div
              style={{
                fontSize: tokens.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}
            >
              Available with Zero Downpayment
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
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

        <div style={contentStyle}>{renderStepContent()}</div>

        {/* Vehicle summary displayed at bottom */}
        {renderVehicleSummary()}
      </div>

      {/* Payment overlay (shown conditionally) */}
      {showPaymentOverlay && (
        <PaymentOverlay
          totalAmount={`₹${formData.totalPrice.toLocaleString("en-IN")}`}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          onCancel={handlePaymentCancel}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}

addPropertyControls(BookingContainer, {
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
    title: "Product Image",
  },
  vehicleDataEndpoint: {
    type: ControlType.String,
    title: "Vehicle Data Endpoint",
    defaultValue: "",
  },
  insuranceDataEndpoint: {
    type: ControlType.String,
    title: "Insurance Data Endpoint",
    defaultValue: "",
  },
});
