// BookingContainer.tsx
// Updated to coordinate API data between components

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
    apiBaseUrl = "https://automation.unipack.asia/webhook/kabiramobility/booking/api/vehicle-data/",

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
  const [vehicleData, setVehicleData] = useState([]);
  const [pricingData, setPricingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formData, setFormData] = useState({
    // Vehicle Configuration data
    location: "",
    selectedVehicle: "",
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

    // Vehicle summary data
    totalPrice: 0,
    vehicleName: "",
    vehicleCode: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch initial vehicle data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setApiError(null);

      try {
        // Fetch vehicle data
        const vehicleResponse = await fetch(`${apiBaseUrl}?type=all`);
        if (!vehicleResponse.ok) {
          throw new Error(
            `Network response was not ok: ${vehicleResponse.status}`,
          );
        }
        const vehicleResult = await vehicleResponse.json();

        // Fetch pricing data
        const pricingResponse = await fetch(`${apiBaseUrl}?type=pricing`);
        if (!pricingResponse.ok) {
          throw new Error(
            `Network response was not ok: ${pricingResponse.status}`,
          );
        }
        const pricingResult = await pricingResponse.json();

        // Update state if successful
        if (vehicleResult.success && vehicleResult.data) {
          setVehicleData(vehicleResult.data);

          // Initialize default selected vehicle if available
          if (vehicleResult.data.length > 0) {
            updateFormData("vehicleConfig", {
              selectedVehicle: vehicleResult.data[0].id,
              vehicleName: vehicleResult.data[0].name,
              vehicleCode: vehicleResult.data[0].id,
            });
          }
        }

        if (pricingResult.success && pricingResult.data) {
          setPricingData(pricingResult.data);

          // Initialize price if available for the first vehicle
          if (vehicleResult.data.length > 0 && pricingResult.data.summary) {
            const firstVehicleId = vehicleResult.data[0].id;
            const vehiclePricing = pricingResult.data.summary.find(
              (p) => p.modelCode === firstVehicleId,
            );

            if (vehiclePricing) {
              updateFormData("pricing", {
                totalPrice: vehiclePricing.minPrice || 0,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setApiError(
          "Failed to load vehicle data. Please try refreshing the page.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [apiBaseUrl]);

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
    // Don't reset form data to preserve user's selections
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

  // Get vehicle name from ID
  const getVehicleName = (vehicleId) => {
    const vehicle = vehicleData.find((v) => v.id === vehicleId);
    return vehicle ? vehicle.name : "";
  };

  // Get vehicle price from ID
  const getVehiclePrice = (vehicleId) => {
    if (!pricingData || !pricingData.summary) return 0;

    const pricing = pricingData.summary.find((p) => p.modelCode === vehicleId);
    return pricing ? pricing.minPrice : 0;
  };

  // Methods for each step
  const handleVehicleConfigurationUpdate = (data) => {
    const vehicleName = getVehicleName(data.vehicle);
    const totalPrice = getVehiclePrice(data.vehicle);

    updateFormData("vehicleConfig", {
      location: data.location,
      selectedVehicle: data.vehicle,
      selectedVariant: data.variant,
      selectedColor: data.color,
      optionalComponents: data.components || [],
      vehicleName,
      vehicleCode: data.vehicle,
      totalPrice,
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

    // In a real app, you would submit the order to your backend here
    if (onFormSubmit) {
      onFormSubmit(formData);
    }
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

  const errorMessageStyle = {
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    backgroundColor: tokens.colors.red[50],
    color: tokens.colors.red[700],
    borderRadius: tokens.borderRadius.DEFAULT,
    fontSize: tokens.fontSize.sm,
  };

  // Show loading or error state
  if (loading && currentStep === 1) {
    return (
      <div style={containerStyle} {...rest}>
        <div
          style={{
            ...formContainerStyle,
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>Loading vehicle information...</div>
        </div>
      </div>
    );
  }

  if (apiError && currentStep === 1) {
    return (
      <div style={containerStyle} {...rest}>
        <div style={{ ...formContainerStyle, flex: 1 }}>
          <div style={errorMessageStyle}>
            {apiError}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: tokens.spacing[4],
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: primaryColor,
                color: "white",
                border: "none",
                borderRadius: tokens.borderRadius.DEFAULT,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get actual product image for the selected vehicle
  const getProductImage = () => {
    if (!formData.selectedVehicle) return productImage;

    const vehicle = vehicleData.find((v) => v.id === formData.selectedVehicle);
    return vehicle && vehicle.image ? vehicle.image : productImage;
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
            dataEndpoint={`${apiBaseUrl}?type=all`}
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
            dataEndpoint={`${apiBaseUrl}?type=insurance`}
          />
        );
      case 3:
        return (
          <FinancingOptions
            selectedPaymentMethod={formData.paymentMethod}
            loanTenure={formData.loanTenure}
            downPaymentAmount={formData.downPaymentAmount}
            selectedVehicleId={formData.selectedVehicle}
            selectedVariantId={formData.selectedVariant}
            selectedLocation={formData.location}
            onFormDataChange={handleFinancingOptionsUpdate}
            onPreviousStep={handlePreviousStep}
            onNextStep={handleNextStep}
            primaryColor={primaryColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            dataEndpoint={`${apiBaseUrl}?type=pricing`}
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
            bookingId={`KM-${Math.floor(Math.random() * 9000000) + 1000000}`}
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

  // Format price for display
  const formatPrice = (price) => {
    return price ? `₹${price.toLocaleString("en-IN")}` : "";
  };

  // Display vehicle summary for the selected vehicle (if any)
  const renderVehicleSummary = () => {
    // Don't show summary in success/failure screens
    if (currentStep >= 7) return null;

    // Only show summary if a vehicle is selected
    if (!formData.selectedVehicle) return null;

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
              {formatPrice(formData.totalPrice)}
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
          src={getProductImage()}
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
          totalAmount={formatPrice(formData.totalPrice)}
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
  apiBaseUrl: {
    type: ControlType.String,
    title: "API Base URL",
    defaultValue:
      "https://automation.unipack.asia/webhook/kabiramobility/booking/api/vehicle-data",
    description: "Base URL for all API endpoints",
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
