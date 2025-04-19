import { useState, useCallback } from "react";
// Assuming validation functions are imported from the adapted utils file
import {
  hasValue,
  isValidEmail,
  isValidName,
  isValidOTP,
  isValidPhone,
  isValidPincode,
  // Removed Framer-specific imports like validateUserInfo, validateVehicleConfig
} from "../utils/validation";

/**
 * Custom hook for form validation (simplified for React).
 * @param {object} initialValues - Initial form values
 * @param {function} validationSchema - Function that validates the form data
 * @returns {object} Form state and utility functions
 */
export default function useFormValidation(initialValues, validationSchema) {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a specific field based on the schema
  const validateField = useCallback(
    (name, value) => {
      if (!validationSchema) return null;
      const fieldData = { [name]: value };
      const fieldErrors = validationSchema(fieldData); // Run schema on single field
      return fieldErrors[name] || null; // Return error for the specific field
    },
    [validationSchema]
  );

  // Handle field change (e.g., from InputField onChange)
  const handleChange = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      // Clear error for the field being changed
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors] // Depend on errors to ensure clearing logic is up-to-date
  );

  // Handle field blur (e.g., from InputField onBlur)
  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      // Validate the field on blur
      const error = validateField(name, values[name]);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      } else if (errors[name]) {
        // Clear error if validation passes on blur
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validateField, values, errors] // Depend on errors here too
  );

  // Validate the entire form based on the schema
  const validateForm = useCallback(() => {
    if (!validationSchema) return true; // No schema, always valid

    const formErrors = validationSchema(values); // Run schema on all current values
    const hasErrors = Object.keys(formErrors).length > 0;

    setErrors(formErrors); // Set all current errors

    // Mark all fields with errors as touched
    if (hasErrors) {
      const newTouched = {};
      Object.keys(formErrors).forEach((key) => {
        newTouched[key] = true;
      });
      setTouched((prev) => ({ ...prev, ...newTouched }));
    }

    return !hasErrors; // Return true if form is valid
  }, [validationSchema, values]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues || {});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Programmatically set a field's value
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Optionally mark as touched or validate here if needed
  }, []);

  // Check if the form is currently valid without setting errors/touched
  const isFormValid = useCallback(() => {
    if (!validationSchema) return true;
    const formErrors = validationSchema(values);
    return Object.keys(formErrors).length === 0;
  }, [validationSchema, values]);

  // Handle form submission attempt
  const handleSubmit = useCallback(
    (callback) => { // Callback is the function to run on successful submission
      return async (e) => { // Returns the event handler
        if (e) e.preventDefault(); // Prevent default form submission if used with <form>

        setIsSubmitting(true);
        const isValid = validateForm(); // Validate and set errors/touched state

        if (isValid && callback) {
          try {
            await callback(values); // Execute the provided submit logic
          } catch (submitError) {
            console.error("Submission callback error:", submitError);
            // Optionally set a general form error state here
          }
        }

        setIsSubmitting(false);
        return isValid; // Return validation status
      };
    },
    [validateForm, values] // Depend on validateForm and values
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    isFormValid, // Expose the check function
    validateForm, // Expose the validate-and-set-errors function
    setErrors, // Allow manually setting errors if needed
  };
}
