// Custom hook for form validation
import { useState, useCallback } from "react";
import * as validators from "../utils/2. validation";

/**
 * Custom hook for form validation
 * @param {object} initialValues - Initial form values
 * @param {function} validationSchema - Function that validates the form data
 * @returns {object} Form state and utility functions
 */
export default function useFormValidation(initialValues, validationSchema) {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a specific field
  const validateField = useCallback((name, value) => {
    if (!validationSchema) return null;

    // Create a temporary object with just the field being validated
    const fieldData = { [name]: value };

    // Run the validation function on this field
    const fieldErrors = validationSchema(fieldData);

    return fieldErrors[name] || null;
  }, [validationSchema]);

  // Handle field change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    const error = validateField(name, values[name]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validationSchema) return true;

    const formErrors = validationSchema(values);
    const hasErrors = Object.keys(formErrors).length > 0;

    setErrors(formErrors);

    // Mark all fields as touched if there are errors
    if (hasErrors) {
      const newTouched = {};
      Object.keys(formErrors).forEach(key => {
        newTouched[key] = true;
      });
      setTouched(prev => ({
        ...prev,
        ...newTouched
      }));
    }

    return !hasErrors;
  }, [validationSchema, values]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues || {});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return validateForm();
  }, [validateForm]);

  // Handle form submission
  const handleSubmit = useCallback((callback) => {
    return async (e) => {
      if (e) e.preventDefault();

      setIsSubmitting(true);

      const isValid = validateForm();

      if (isValid && callback) {
        await callback(values);
      }

      setIsSubmitting(false);

      return isValid;
    };
  }, [validateForm, values]);

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
    isFormValid,
    validateForm,
  };
}
