// booking-form/steps/4. UserInformation.tsx
import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import InputField from "https://framer.com/m/InputField-oLfO.js"
import PhoneInput from "https://framer.com/m/PhoneInput-HEez.js"
import FormButtons from "https://framer.com/m/FormButtons-yqfJ.js"
import Checkbox from "https://framer.com/m/Checkbox-eHcJ.js"
import { validateUserInfo } from "https://framer.com/m/validation-cYtD.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function UserInformation(props) {
    const {
        // Customization options
        primaryColor = tokens.colors.blue[600],
        backgroundColor = tokens.colors.neutral[50],
        borderColor = tokens.colors.neutral[200],

        // Initial values
        fullName = "",
        email = "",
        phone = "",
        address = "",
        city = "",
        state = "",
        pincode = "",

        // Event handlers
        onPreviousStep,
        onNextStep,
        onFormDataChange,

        // Show fixed buttons (false when using container's buttons)
        showFixedButton = true,

        // Component styling
        style,
        ...rest
    } = props

    // Local state
    const [formData, setFormData] = useState({
        fullName: fullName || "",
        email: email || "",
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        termsAccepted: false,
    })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)

    // Update form data on any field change
    useEffect(() => {
        if (onFormDataChange && submitted === false) {
            onFormDataChange(formData)
        }
    }, [formData, submitted])

    // Handle input change
    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        })

        // Clear error for this field if any
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null,
            })
        }
    }

    // Validate form
    const validateForm = () => {
        const validationErrors = validateUserInfo(formData)

        // Add terms validation (not in the utility function)
        if (!formData.termsAccepted) {
            validationErrors.termsAccepted =
                "You must accept the terms and conditions"
        }

        setErrors(validationErrors)
        return Object.keys(validationErrors).length === 0
    }

    // Handle next button click
    const handleNext = () => {
        setSubmitted(true)

        if (validateForm()) {
            if (onNextStep) onNextStep()
        }
    }

    // Styling
    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        ...style,
    }

    const sectionStyle = {
        marginBottom: tokens.spacing[6],
    }

    const sectionTitleStyle = {
        fontSize: tokens.fontSize.sm,
        fontWeight: tokens.fontWeight.medium,
        color: tokens.colors.neutral[600],
        textTransform: "uppercase",
        marginBottom: tokens.spacing[3],
    }

    const rowStyle = {
        display: "flex",
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[4],
    }

    return (
        <div style={containerStyle} {...rest}>
            {/* Personal Information Section */}
            <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Personal Information</div>

                <InputField
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(value) => handleChange("fullName", value)}
                    error={submitted && errors.fullName ? errors.fullName : ""}
                    required={true}
                    borderColor={borderColor}
                    focusBorderColor={primaryColor}
                />

                <InputField
                    label="Email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(value) => handleChange("email", value)}
                    error={submitted && errors.email ? errors.email : ""}
                    required={true}
                    borderColor={borderColor}
                    focusBorderColor={primaryColor}
                />

                <PhoneInput
                    label="Mobile Number"
                    value={formData.phone}
                    onChange={(value) => handleChange("phone", value)}
                    error={submitted && errors.phone ? errors.phone : ""}
                    required={true}
                    borderColor={borderColor}
                    focusBorderColor={primaryColor}
                />
            </div>

            {/* Address Section */}
            <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Delivery Address</div>

                <InputField
                    label="Street Address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={(value) => handleChange("address", value)}
                    error={submitted && errors.address ? errors.address : ""}
                    required={true}
                    borderColor={borderColor}
                    focusBorderColor={primaryColor}
                />

                <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                        <InputField
                            label="City"
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={(value) => handleChange("city", value)}
                            error={submitted && errors.city ? errors.city : ""}
                            required={true}
                            borderColor={borderColor}
                            focusBorderColor={primaryColor}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <InputField
                            label="State"
                            placeholder="Enter your state"
                            value={formData.state}
                            onChange={(value) => handleChange("state", value)}
                            error={
                                submitted && errors.state ? errors.state : ""
                            }
                            required={true}
                            borderColor={borderColor}
                            focusBorderColor={primaryColor}
                        />
                    </div>
                </div>

                <InputField
                    label="Pincode"
                    placeholder="Enter 6-digit pincode"
                    value={formData.pincode}
                    onChange={(value) => handleChange("pincode", value)}
                    error={submitted && errors.pincode ? errors.pincode : ""}
                    required={true}
                    maxLength={6}
                    borderColor={borderColor}
                    focusBorderColor={primaryColor}
                />
            </div>

            {/* Terms and Privacy */}
            <div style={{ marginBottom: tokens.spacing[6] }}>
                <Checkbox
                    label="I agree to the Terms of Service and Privacy Policy, and consent to the processing of my personal information."
                    checked={formData.termsAccepted}
                    onChange={(value) => handleChange("termsAccepted", value)}
                    error={
                        submitted && errors.termsAccepted
                            ? errors.termsAccepted
                            : ""
                    }
                    required={true}
                    checkboxColor={primaryColor}
                />
            </div>

            {/* Privacy Notice */}
            <div
                style={{
                    fontSize: tokens.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[6],
                }}
            >
                By proceeding, you agree to our Terms of Service and Privacy
                Policy. Your information will be used to process your booking
                and for communication related to your purchase.
            </div>

            {/* Navigation Buttons - only shown if showFixedButton prop is true */}
            {showFixedButton && (
                <FormButtons
                    onBack={onPreviousStep}
                    onNext={handleNext}
                    nextButtonText="Continue to Verification"
                    primaryColor={primaryColor}
                />
            )}
        </div>
    )
}

addPropertyControls(UserInformation, {
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
    fullName: {
        type: ControlType.String,
        title: "Full Name",
        defaultValue: "",
    },
    email: {
        type: ControlType.String,
        title: "Email",
        defaultValue: "",
    },
    phone: {
        type: ControlType.String,
        title: "Phone",
        defaultValue: "",
    },
    address: {
        type: ControlType.String,
        title: "Address",
        defaultValue: "",
    },
    city: {
        type: ControlType.String,
        title: "City",
        defaultValue: "",
    },
    state: {
        type: ControlType.String,
        title: "State",
        defaultValue: "",
    },
    pincode: {
        type: ControlType.String,
        title: "Pincode",
        defaultValue: "",
    },
    showFixedButton: {
        type: ControlType.Boolean,
        title: "Show Fixed Button",
        defaultValue: true,
    },
})
