
/**
 * Validate email address format.
 * @param {string} email - Email to validate.
 * @returns {boolean} Whether the email is valid.
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  // Basic regex, consider using a more robust library for production
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits for India).
 * @param {string} phone - Phone number to validate.
 * @returns {boolean} Whether the phone is valid.
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, ""); // Remove non-digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Validate pincode (6 digits for India).
 * @param {string} pincode - Pincode to validate.
 * @returns {boolean} Whether the pincode is valid.
 */
export const isValidPincode = (pincode) => {
  if (!pincode || typeof pincode !== 'string') return false;
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate full name (at least two parts, letters and spaces).
 * @param {string} name - Name to validate.
 * @returns {boolean} Whether the name is valid.
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Requires at least two parts separated by space(s)
  const nameRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/;
  return nameRegex.test(name.trim());
};

/**
 * Check if a field has a non-empty value.
 * @param {*} value - Value to check.
 * @returns {boolean} Whether the field has a value.
 */
export const hasValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  // Consider other types like numbers (0 might be valid)
  if (typeof value === 'number') return true; // Assuming 0 is a valid value
  if (typeof value === "object") return Object.keys(value).length > 0; // Check for non-empty objects
  return !!value; // General truthiness check for other types (like boolean true)
};

/**
 * Validate OTP code (6 digits).
 * @param {string} otp - OTP to validate.
 * @returns {boolean} Whether the OTP is valid.
 */
export const isValidOTP = (otp) => {
  if (!otp || typeof otp !== 'string') return false;
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};


// --- Schema-based Validation Functions ---

/**
 * Validate user information form data.
 * @param {object} formData - Form data containing user info fields.
 * @returns {object} Object with validation errors (field: message). Empty if valid.
 */
export const validateUserInfo = (formData) => {
  const errors = {};

  if (!hasValue(formData.fullName)) {
    errors.fullName = "Full name is required";
  } else if (!isValidName(formData.fullName)) {
    errors.fullName = "Please enter your first and last name";
  }

  if (!hasValue(formData.email)) {
    errors.email = "Email is required";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!hasValue(formData.phone)) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = "Please enter a valid 10-digit phone number";
  }

  if (!hasValue(formData.address)) {
    errors.address = "Address is required";
  }

  if (!hasValue(formData.city)) {
    errors.city = "City is required";
  }

  if (!hasValue(formData.state)) {
    errors.state = "State is required";
  }

  if (!hasValue(formData.pincode)) {
    errors.pincode = "Pincode is required";
  } else if (!isValidPincode(formData.pincode)) {
    errors.pincode = "Please enter a valid 6-digit pincode";
  }

  // Note: Terms acceptance validation is often handled separately in the component
  // if (!formData.termsAccepted) {
  //   errors.termsAccepted = "You must accept the terms and conditions";
  // }

  return errors;
};

/**
 * Validate vehicle configuration form data.
 * @param {object} formData - Form data containing vehicle config fields.
 * @returns {object} Object with validation errors (field: message). Empty if valid.
 */
export const validateVehicleConfig = (formData) => {
  const errors = {};

  if (!hasValue(formData.location)) {
    errors.location = "Please select a location";
  }

  if (!hasValue(formData.selectedVehicle)) {
    errors.selectedVehicle = "Please select a vehicle";
  }

  if (!hasValue(formData.selectedVariant)) {
    errors.selectedVariant = "Please select a variant";
  }

  if (!hasValue(formData.selectedColor)) {
    errors.selectedColor = "Please select a color";
  }

  // Add validation for required components if needed
  // Example: if (!formData.optionalComponents || !formData.optionalComponents.includes(REQUIRED_COMPONENT_ID)) {
  //   errors.optionalComponents = "Required component is missing";
  // }

  return errors;
};
