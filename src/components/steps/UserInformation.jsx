// Adapted from booking-form/2. steps/4. UserInformation.tsx
import React, { useState, useEffect } from "react";
import { useBooking } from "../../context/BookingContext";
import InputField from "../ui/InputField";
import PhoneInput from "../ui/PhoneInput";
import Checkbox from "../ui/Checkbox";
import FormButtons from "../form-sections/FormButtons";
import { validateUserInfo } from "../../utils/validation"; // Assuming validation utils are adapted

export default function UserInformation(props) {
  const {
    onPreviousStep,
    onNextStep,
    // primaryColor = "blue-600", // Example Tailwind color name - Inherited from Button/Checkbox
    // borderColor = "neutral-300", // Example Tailwind color name - Inherited from InputField
    className = "",
    ...rest
  } = props;

  const { formData, updateFormData, errors: contextErrors, setErrors: setContextErrors } = useBooking();

  // Local state for form values, initialized from context
  const [localFormData, setLocalFormData] = useState({
    fullName: formData.fullName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    address: formData.address || "",
    city: formData.city || "",
    state: formData.state || "",
    pincode: formData.pincode || "",
    termsAccepted: formData.termsAccepted || false,
  });
  const [submitted, setSubmitted] = useState(false);

  // Use context errors for display
  const errors = contextErrors || {};

  // Update context whenever local form data changes
  useEffect(() => {
    // Only update context if data actually changed to prevent loops
    if (JSON.stringify(localFormData) !== JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        termsAccepted: formData.termsAccepted,
    })) {
        updateFormData(localFormData);
    }
  }, [localFormData, updateFormData, formData]);

  // Handle input change
  const handleChange = (field, value) => {
    setLocalFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field in context if it exists and user is typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setContextErrors(newErrors);
    }
  };

  // Validate form on submit
  const validateForm = () => {
    const validationErrors = validateUserInfo(localFormData); // Validate local data

    // Add terms validation
    if (!localFormData.termsAccepted) {
      validationErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setContextErrors(validationErrors); // Update context with errors
    return Object.keys(validationErrors).length === 0;
  };

  // Handle next button click
  const handleNext = () => {
    setSubmitted(true); // Mark as submitted to show errors
    if (validateForm()) {
      if (onNextStep) onNextStep();
    } else {
        // Optional: Scroll to the first error field
        const firstErrorField = Object.keys(errors)[0];
        const errorElement = document.getElementById(firstErrorField); // Assuming inputs have IDs matching field names
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col w-full ${className}`;
  const sectionClasses = "mb-8";
  const sectionTitleClasses = "text-sm font-medium text-neutral-600 uppercase mb-3 tracking-wider";
  const rowClasses = "flex flex-col md:flex-row md:gap-4"; // Responsive row
  const colClasses = "flex-1 w-full md:w-auto mb-0"; // Adjusted width and margin for responsiveness
  const checkboxContainerClasses = "mb-6";
  const privacyNoticeClasses = "text-xs text-neutral-500 mb-6";

  return (
    <div className={containerClasses} {...rest}>
      {/* Personal Information Section */}
      <div className={sectionClasses}>
        <div className={sectionTitleClasses}>Personal Information</div>
        <InputField
          id="fullName" // Add ID for potential scrolling
          label="Full Name"
          placeholder="Enter your full name"
          value={localFormData.fullName}
          onChange={(value) => handleChange("fullName", value)}
          error={submitted && errors.fullName ? errors.fullName : ""}
          required={true}
          // Pass Tailwind classes via className prop if needed
          // className="..."
        />
        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={localFormData.email}
          onChange={(value) => handleChange("email", value)}
          error={submitted && errors.email ? errors.email : ""}
          required={true}
          // className="..."
        />
        <PhoneInput
          id="phone"
          label="Mobile Number"
          value={localFormData.phone}
          onChange={(value) => handleChange("phone", value)}
          error={submitted && errors.phone ? errors.phone : ""}
          required={true}
          // className="..."
        />
      </div>

      {/* Address Section */}
      <div className={sectionClasses}>
        <div className={sectionTitleClasses}>Delivery Address</div>
        <InputField
          id="address"
          label="Street Address"
          placeholder="Enter your address"
          value={localFormData.address}
          onChange={(value) => handleChange("address", value)}
          error={submitted && errors.address ? errors.address : ""}
          required={true}
          // className="..."
        />
        <div className={rowClasses}>
          <div className={colClasses}>
            <InputField
              id="city"
              label="City"
              placeholder="Enter your city"
              value={localFormData.city}
              onChange={(value) => handleChange("city", value)}
              error={submitted && errors.city ? errors.city : ""}
              required={true}
              // className="..."
            />
          </div>
          <div className={colClasses}>
            <InputField
              id="state"
              label="State"
              placeholder="Enter your state"
              value={localFormData.state}
              onChange={(value) => handleChange("state", value)}
              error={submitted && errors.state ? errors.state : ""}
              required={true}
              // className="..."
            />
          </div>
        </div>
        <InputField
          id="pincode"
          label="Pincode"
          placeholder="Enter 6-digit pincode"
          value={localFormData.pincode}
          onChange={(value) => handleChange("pincode", value)}
          error={submitted && errors.pincode ? errors.pincode : ""}
          required={true}
          maxLength={6}
          // className="..."
        />
      </div>

      {/* Terms and Privacy */}
      <div className={checkboxContainerClasses}>
        <Checkbox
          id="termsAccepted"
          label="I agree to the Terms of Service and Privacy Policy, and consent to the processing of my personal information."
          checked={localFormData.termsAccepted}
          onChange={(value) => handleChange("termsAccepted", value)}
          error={submitted && errors.termsAccepted ? errors.termsAccepted : ""}
          required={true}
          // Pass Tailwind classes via className prop if needed
          // className="..."
        />
      </div>

      {/* Privacy Notice */}
      <div className={privacyNoticeClasses}>
        By proceeding, you agree to our Terms of Service and Privacy Policy. Your information will be used to process your booking and for communication related to your purchase.
      </div>

      {/* Navigation Buttons */}
      <FormButtons
        onBack={onPreviousStep}
        onNext={handleNext}
        nextButtonText="Continue to Verification"
        // Pass Tailwind classes via className prop if needed
        // className="..."
      />
    </div>
  );
}
