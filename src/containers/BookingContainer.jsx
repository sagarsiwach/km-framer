// Adapted from booking-form/3. containers/1. BookingContainer.tsx
import React, { useState, useEffect, useRef } from "react";
import { BookingProvider, useBooking } from "../context/BookingContext";
import useStepNavigation from "../hooks/useStepNavigation";
import LoadingIndicator from "../components/form-sections/LoadingIndicator";
import ErrorDisplay from "../components/form-sections/ErrorDisplay";
import VehicleSummary from "../components/form-sections/VehicleSummary";
import Button from "../ui/Button";

// Import Step Components (using adapted JSX versions)
import VehicleConfiguration from "../components/steps/VehicleConfiguration";
import InsuranceSelection from "../components/steps/InsuranceSelection";
import FinancingOptions from "../components/steps/FinancingOptions";
import UserInformation from "../components/steps/UserInformation";
import OTPVerification from "../components/steps/OTPVerification";
import PaymentOverlay from "../components/steps/PaymentOverlay";
import SuccessState from "../components/steps/SuccessState";
import FailureState from "../components/steps/FailureState";

// Basic Logo component (replace with actual SVG/component if needed)
const KMCircleLogo = ({ size = 40, color = "#FFFFFF", ...props }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color, // Simple background color for demo
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#000', // Contrasting text color
      fontWeight: 'bold',
      fontSize: size * 0.5,
    }}
    {...props}
  >
    KM
  </div>
);

// Inner component that uses the context
function BookingContainerContent(props) {
  const {
    initialStep = 1,
    // primaryColor = "blue-600", // Inherited via Button
    // borderColor = "neutral-200", // Inherited via components
    logoColor = "#FFFFFF",
    headingText = "Book your Ride",
    productImage = "https://via.placeholder.com/800x600.png?text=Vehicle+Image",
    enableDebug = false,
    onStepChange,
    onFormSubmit,
    className = "",
    ...rest
  } = props;

  const contentRef = useRef(null);
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState("100vh");

  const { formData, loading, apiError, calculateTotalPrice, errors, updateFormData } = useBooking();

  const debugLog = (...args) => {
    if (enableDebug) console.log("BookingContainer:", ...args);
  };

  // Check mobile and set viewport height
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const updateViewportHeight = () => {
      const height = CSS.supports("height", "100dvh") ? `calc(100dvh - 81px)` : `${window.innerHeight - 81}px`;
      setViewportHeight(height);
    };
    checkMobile();
    updateViewportHeight();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("resize", updateViewportHeight);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, []);

  // Step navigation (adjust total steps if needed)
  const totalMainSteps = 5; // Config, Insurance, Finance, UserInfo, OTP
  const { currentStep, nextStep, prevStep, goToStep, resetSteps } = useStepNavigation(
    initialStep,
    totalMainSteps, // Pass the number of main steps
    onStepChange
  );

  // Get step title/description
  const getStepInfo = () => {
    switch (currentStep) {
      case 1: return { title: "Configure your Vehicle", desc: "Personalise your Bike..." };
      case 2: return { title: "Vehicle Insurance", desc: "Choose the right coverage..." };
      case 3: return { title: "Financing and Payment", desc: "Select your preferred method..." };
      case 4: return { title: "Your Information", desc: "Provide your details..." };
      case 5: return { title: "Verification", desc: "Verify your contact info..." };
      case 7: return { title: "Booking Confirmed", desc: "" }; // Step 7 is success
      case 8: return { title: "Payment Failed", desc: "" }; // Step 8 is failure
      default: return { title: "Book your Ride", desc: "" };
    }
  };
  const { title: stepTitle, desc: stepDescription } = getStepInfo();

  // Payment handlers
  const handlePaymentSuccess = () => {
    setShowPaymentOverlay(false);
    // Generate a mock booking ID
    const bookingId = `KM-${Math.floor(Math.random() * 9000000) + 1000000}`;
    updateFormData({ bookingId: bookingId }); // Store booking ID in context
    goToStep(7); // Navigate to Success state (step 7)
    debugLog("Payment success, navigating to step 7");
    if (onFormSubmit) onFormSubmit({ ...formData, bookingId }); // Pass final form data including booking ID
  };
  const handlePaymentFailure = () => {
    setShowPaymentOverlay(false);
    goToStep(8); // Navigate to Failure state (step 8)
    debugLog("Payment failure, navigating to step 8");
  };
  const handlePaymentCancel = () => {
    setShowPaymentOverlay(false);
    debugLog("Payment cancelled");
  };

   // Handler for OTP verification success (called from OTPVerification component)
   const handleVerificationSuccess = () => {
    debugLog("OTP Verified, showing payment overlay.");
    setShowPaymentOverlay(true);
    // We don't automatically go to the next step here; payment overlay handles next steps.
  };

  // Scroll content to top on step change
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    debugLog("Scrolled content to top for step", currentStep);
  }, [currentStep, debugLog]);

  // --- Tailwind Classes ---
  const containerClasses = `flex w-full font-sans ${isMobile ? 'flex-col' : ''}`;
  const imageContainerClasses = `bg-gray-800 flex items-center justify-center overflow-hidden relative ${isMobile ? 'h-48 flex-shrink-0' : 'flex-[7] h-full'}`; // Use flex-basis like syntax
  const formContainerClasses = `flex flex-col bg-neutral-50 ${isMobile ? 'flex-1 h-[calc(100%-192px)]' : 'flex-[3] h-full'}`; // Adjusted height and flex-basis
  const headerClasses = `p-4 border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10`;
  const tagClasses = "text-sm text-neutral-500 mb-1";
  const headingClasses = "text-2xl font-bold mb-1 text-neutral-900";
  const subheadingClasses = "text-sm leading-relaxed text-neutral-600 mb-0";
  const contentClasses = "flex-1 overflow-y-auto p-4 pb-40"; // Increased padding-bottom
  const footerClasses = "sticky bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10 w-full";
  const summaryClasses = `border-t border-neutral-200 py-3 px-4`; // Removed mt-4
  const buttonContainerClasses = "p-4 flex justify-between gap-3";
  const watermarkClasses = "absolute text-[200px] font-bold text-white/15 z-0 select-none pointer-events-none"; // Added pointer-events-none
  const logoContainerClasses = `absolute top-4 left-4 z-10`;
  const loadingContainerClasses = "flex justify-center items-center h-screen w-full bg-neutral-50";

  // Show loading screen initially
  if (loading) {
    return (
      <div className={loadingContainerClasses}>
        <LoadingIndicator text="Loading booking interface..." size="large" />
      </div>
    );
  }

  // Show API error if present (could be more specific)
  if (apiError && currentStep < 7) { // Don't show API error on success/fail screens
      return (
          <div className={loadingContainerClasses}> {/* Reuse loading container style */}
              <ErrorDisplay error={apiError} showRetry onRetry={() => window.location.reload()} />
          </div>
      );
  }

  // Determine if the next button should be disabled based on current step validation
  const isNextDisabled = () => {
      if (currentStep === 1 && (!formData.location || !formData.selectedVehicle || !formData.selectedVariant || !formData.selectedColor)) return true;
      if (currentStep === 4 && Object.keys(errors).length > 0) return true; // Example: disable if user info has errors
      // Add more checks for other steps if needed
      return false;
  };

  return (
    <div className={`${containerClasses} ${className}`} style={{ height: viewportHeight }} {...rest}>
      {/* Image Section */}
      <div className={imageContainerClasses}>
        <div className={logoContainerClasses}>
          <KMCircleLogo size={40} color={logoColor} />
        </div>
        <div className={watermarkClasses} aria-hidden="true">0</div>
        <img src={productImage} alt="Vehicle" className="w-full h-full object-cover" />
      </div>

      {/* Form Section */}
      <div className={formContainerClasses}>
        <div className={headerClasses}>
          <div className={tagClasses}>{headingText}</div>
          <h1 className={headingClasses}>{stepTitle}</h1>
          {stepDescription && <p className={subheadingClasses}>{stepDescription}</p>}
        </div>

        <div className={contentClasses} ref={contentRef}>
          {/* Render Step Component */}
          {currentStep === 1 && <VehicleConfiguration onNextStep={nextStep} />}
          {currentStep === 2 && <InsuranceSelection onPreviousStep={prevStep} onNextStep={nextStep} />}
          {currentStep === 3 && <FinancingOptions onPreviousStep={prevStep} onNextStep={nextStep} />}
          {currentStep === 4 && <UserInformation onPreviousStep={prevStep} onNextStep={nextStep} />}
          {currentStep === 5 && <OTPVerification onPreviousStep={prevStep} onVerificationSuccess={handleVerificationSuccess} onVerificationFailure={() => { /* Failure handled by context error */ }} />}
          {currentStep === 7 && <SuccessState bookingId={formData.bookingId} customerName={formData.fullName} vehicleName={formData.vehicleName} onStartOver={resetSteps} />}
          {currentStep === 8 && <FailureState onTryAgain={() => { goToStep(5); setShowPaymentOverlay(true); }} onStartOver={resetSteps} />}
        </div>

        {/* Footer: Summary and Buttons (conditional) */}
        {currentStep >= 1 && currentStep <= totalMainSteps && formData.selectedVehicle && (
          <div className={footerClasses}>
            <div className={summaryClasses}>
              <VehicleSummary
                vehicleName={formData.vehicleName}
                vehicleCode={formData.vehicleCode}
                location={formData.location || (formData.city && formData.state ? `${formData.city}, ${formData.state}` : "Select Location")}
                pincode={formData.pincode}
                totalPrice={calculateTotalPrice()}
                showEmiInfo={formData.paymentMethod === 'loan'} // Show EMI info only if loan selected
              />
            </div>
            <div className={buttonContainerClasses}>
              {currentStep > 1 && (
                <Button text="Back" variant="outline" onClick={prevStep} className="flex-1" />
              )}
              {/* Conditionally render the correct 'Next' button text */}
              {currentStep === 1 && <Button text="Select Insurance" rightIcon onClick={nextStep} disabled={isNextDisabled()} className={currentStep > 1 ? "flex-1" : "w-full"} />}
              {currentStep === 2 && <Button text="Continue to Financing" rightIcon onClick={nextStep} disabled={isNextDisabled()} className="flex-1" />}
              {currentStep === 3 && <Button text="Continue to Personal Info" rightIcon onClick={nextStep} disabled={isNextDisabled()} className="flex-1" />}
              {currentStep === 4 && <Button text="Continue to Verification" rightIcon onClick={nextStep} disabled={isNextDisabled()} className="flex-1" />}
              {/* Step 5's button is inside the OTPVerification component */}
              {currentStep === 5 && <div className="flex-1"></div> /* Placeholder to balance layout if back button exists */}

            </div>
          </div>
        )}
      </div>

      {/* Payment Overlay */}
      {showPaymentOverlay && ( // Show overlay when state is true
        <PaymentOverlay
          totalAmount={`₹${calculateTotalPrice().toLocaleString("en-IN")}`}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
}

// Main component wrapped with Provider
export default function BookingContainerWrapper(props) {
  return (
    <BookingProvider debug={props.enableDebug}>
      <BookingContainerContent {...props} />
    </BookingProvider>
  );
}
