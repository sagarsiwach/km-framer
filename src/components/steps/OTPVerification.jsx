// Adapted from booking-form/2. steps/5. OTPVerification.tsx
import React, { useState, useEffect } from "react";
import { useBooking } from "../../context/BookingContext";
import OTPInputGroup from "../ui/OTPInputGroup";
import FormButtons from "../form-sections/FormButtons";
import Button from "../ui/Button"; // Import Button for internal verify action
import { isValidOTP } from "../../utils/validation"; // Assuming validation utils are adapted

export default function OTPVerification(props) {
  const {
    onPreviousStep,
    onVerificationSuccess, // Called on successful verification
    onVerificationFailure, // Called on failed verification
    // primaryColor = "blue-600", // Inherited via Button
    // borderColor = "neutral-300", // Inherited via OTPInputGroup
    autoFillOTP = "", // For testing, default empty
    className = "",
    ...rest
  } = props;

  const { formData, errors: contextErrors, setErrors: setContextErrors } = useBooking();

  // Local state
  const [otp, setOtp] = useState(autoFillOTP || ""); // Use autoFillOTP if provided
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isPhoneVerification, setIsPhoneVerification] = useState(true); // Default to phone

  // Use context errors for display
  const verificationError = contextErrors?.otp || null;

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (resendCountdown > 0 && resendDisabled) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, resendDisabled]);

  // Handle OTP change
  const handleOTPChange = (value) => {
    setOtp(value);
    // Clear OTP error in context when user types
    if (verificationError) {
      const newErrors = { ...contextErrors };
      delete newErrors.otp;
      setContextErrors(newErrors);
    }
  };

  // Handle resend OTP (simulation)
  const handleResendOTP = async () => {
    console.log(`Simulating sending OTP to ${isPhoneVerification ? formData.phone : formData.email}`);
    setResendDisabled(true);
    setResendCountdown(30); // Reset timer
    // In a real app, call API here: await sendOTP(...)
  };

  // Toggle between phone and email verification
  const toggleVerificationMethod = () => {
    setIsPhoneVerification(!isPhoneVerification);
    setOtp(""); // Clear OTP on method change
    setContextErrors({}); // Clear errors
    handleResendOTP(); // Simulate sending to new destination
  };

  // Verify OTP (simulation) - This is triggered by the "Verify & Proceed" button
  const verifyOTPCode = async () => {
    if (!isValidOTP(otp)) {
      setContextErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    setIsVerifying(true);
    setContextErrors({}); // Clear previous errors

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Use "123456" as the valid OTP for demo purposes
    if (otp === "123456") {
      setIsVerifying(false);
      if (onVerificationSuccess) onVerificationSuccess(); // Notify parent (BookingContainer)
    } else {
      setIsVerifying(false);
      setContextErrors({ otp: "Invalid OTP. Please try again." });
      if (onVerificationFailure) onVerificationFailure(); // Notify parent (BookingContainer)
    }
  };

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col w-full ${className}`;
  const sectionClasses = "flex flex-col items-center mb-6";
  const headingClasses = "text-xl font-bold mb-2 text-center";
  const subheadingClasses = "text-sm text-neutral-600 mb-6 text-center";
  const actionsClasses = "flex flex-col items-center gap-4 mt-6";
  const linkClasses = `text-blue-600 cursor-pointer text-sm hover:underline`; // Example color
  const disabledLinkClasses = "text-neutral-400 cursor-default text-sm";
  const testInfoClasses = "p-4 bg-neutral-100 rounded-lg mb-6 text-sm text-neutral-700";

  return (
    <div className={containerClasses} {...rest}>
      <div className={sectionClasses}>
        <div className={headingClasses}>Verification Code</div>
        <div className={subheadingClasses}>
          {isPhoneVerification
            ? `We've sent a verification code to +91 ${formData.phone || "XXXXX"}`
            : `We've sent a verification code to ${formData.email || "user@example.com"}`}
        </div>

        <OTPInputGroup
          value={otp}
          onChange={handleOTPChange}
          error={verificationError} // Display error from context
          autoFocus={true}
          // Pass Tailwind classes via className prop if needed
          // className="..."
        />

        <div className={actionsClasses}>
          <div className="flex gap-2 text-sm">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              className={resendDisabled ? disabledLinkClasses : linkClasses}
              onClick={!resendDisabled ? handleResendOTP : undefined}
              disabled={resendDisabled}
            >
              {resendDisabled ? `Resend in ${resendCountdown}s` : "Resend code"}
            </button>
          </div>

          <button
            type="button"
            className={linkClasses}
            onClick={toggleVerificationMethod}
          >
            {isPhoneVerification ? "Send code to email instead" : "Send code to phone instead"}
          </button>
        </div>
      </div>

      {/* Testing Information */}
      <div className={testInfoClasses}>
        <div className="font-medium mb-2">Testing Information:</div>
        <div>Use OTP "123456" for successful verification.</div>
        <div>Any other value will result in failure.</div>
      </div>

      {/* Navigation Buttons - The "Next" button here triggers the verification */}
      <FormButtons
        onBack={onPreviousStep}
        onNext={verifyOTPCode} // The "Next" button now calls verifyOTPCode
        nextButtonText={isVerifying ? "Verifying..." : "Verify & Proceed"}
        rightIcon={!isVerifying}
        isNextDisabled={isVerifying || otp.length !== 6}
        // Pass Tailwind classes via className prop if needed
        // className="..."
      />
       {/* Hidden button for potential programmatic trigger if needed, though FormButtons handles it */}
       {/* <Button id="verify-otp-button" onClick={verifyOTPCode} className="hidden" /> */}
    </div>
  );
}
