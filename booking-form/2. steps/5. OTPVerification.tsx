// booking-form/steps/5. OTPVerification.tsx
import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import OTPInputGroup from "https://framer.com/m/OTPInputGroup-MaEj.js"
import FormButtons from "https://framer.com/m/FormButtons-yqfJ.js"
import { isValidOTP } from "https://framer.com/m/validation-cYtD.js"
import { sendOTP, verifyOTP } from "https://framer.com/m/api-A6AK.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function OTPVerification(props) {
    const {
        // Customization options
        primaryColor = tokens.colors.blue[600],
        backgroundColor = tokens.colors.neutral[50],
        borderColor = tokens.colors.neutral[200],

        // Contact info
        phoneNumber = "+91 9876543210",
        email = "user@example.com",

        // Event handlers
        onPreviousStep,
        onVerificationSuccess,
        onVerificationFailure,

        // For testing (auto-fill OTP)
        autoFillOTP = "123456",

        // Show fixed buttons (false when using container's buttons)
        showFixedButton = true,

        // Component styling
        style,
        ...rest
    } = props

    // Local state
    const [otp, setOtp] = useState(autoFillOTP || "")
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationError, setVerificationError] = useState(null)
    const [resendDisabled, setResendDisabled] = useState(true)
    const [resendCountdown, setResendCountdown] = useState(30)
    const [isPhoneVerification, setIsPhoneVerification] = useState(true)

    // Resend timer countdown
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1)
            }, 1000)
            return () => clearTimeout(timer)
        } else {
            setResendDisabled(false)
        }
    }, [resendCountdown])

    // Handle OTP change
    const handleOTPChange = (value) => {
        setOtp(value)
        if (verificationError) {
            setVerificationError(null)
        }
    }

    // Handle resend OTP
    const handleResendOTP = async () => {
        setResendDisabled(true)
        setResendCountdown(30)

        try {
            // In a real app, this would call your API to resend the OTP
            await sendOTP(
                phoneNumber.replace(/\D/g, ""),
                email,
                !isPhoneVerification
            )
        } catch (error) {
            console.error("Error sending OTP:", error)
        }
    }

    // Toggle between phone and email verification
    const toggleVerificationMethod = () => {
        setIsPhoneVerification(!isPhoneVerification)
        setOtp("")
        setVerificationError(null)

        // Simulate sending OTP to new destination
        handleResendOTP()
    }

    // Verify OTP
    const verifyOTPCode = async () => {
        if (!isValidOTP(otp)) {
            setVerificationError("Please enter a valid 6-digit OTP")
            return
        }

        setIsVerifying(true)
        setVerificationError(null)

        try {
            // For demo purposes, we'll just check if the OTP is "123456"
            if (otp === "123456" || (autoFillOTP && otp === autoFillOTP)) {
                setTimeout(() => {
                    setIsVerifying(false)
                    if (onVerificationSuccess) onVerificationSuccess()
                }, 1500)
            } else {
                setTimeout(() => {
                    setIsVerifying(false)
                    setVerificationError("Invalid OTP. Please try again.")
                    if (onVerificationFailure) onVerificationFailure()
                }, 1500)
            }
        } catch (error) {
            setIsVerifying(false)
            setVerificationError("Verification failed. Please try again.")
            if (onVerificationFailure) onVerificationFailure()
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: tokens.spacing[6],
    }

    const headingStyle = {
        fontSize: tokens.fontSize.xl,
        fontWeight: tokens.fontWeight.bold,
        marginBottom: tokens.spacing[2],
        textAlign: "center",
    }

    const subheadingStyle = {
        fontSize: tokens.fontSize.sm,
        color: tokens.colors.neutral[600],
        marginBottom: tokens.spacing[6],
        textAlign: "center",
    }

    const actionsStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacing[4],
        marginTop: tokens.spacing[6],
    }

    const linkStyle = {
        color: primaryColor,
        cursor: "pointer",
        fontSize: tokens.fontSize.sm,
    }

    const errorStyle = {
        color: tokens.colors.red[600],
        fontSize: tokens.fontSize.sm,
        marginTop: tokens.spacing[4],
        textAlign: "center",
    }

    const testInfoStyle = {
        padding: tokens.spacing[4],
        backgroundColor: tokens.colors.neutral[100],
        borderRadius: tokens.borderRadius.DEFAULT,
        marginBottom: tokens.spacing[6],
        fontSize: tokens.fontSize.sm,
    }

    return (
        <div style={containerStyle} {...rest}>
            <div style={sectionStyle}>
                <div style={headingStyle}>Verification Code</div>
                <div style={subheadingStyle}>
                    {isPhoneVerification
                        ? `We've sent a verification code to ${phoneNumber}`
                        : `We've sent a verification code to ${email}`}
                </div>

                {/* OTP Input Fields */}
                <OTPInputGroup
                    value={otp}
                    onChange={handleOTPChange}
                    error={verificationError}
                    borderColor={borderColor}
                    focusBorderColor={primaryColor}
                    errorBorderColor={tokens.colors.red[600]}
                    autoFocus={true}
                />

                {/* Action links */}
                <div style={actionsStyle}>
                    <div style={{ display: "flex", gap: tokens.spacing[2] }}>
                        <div style={{ fontSize: tokens.fontSize.sm }}>
                            Didn't receive the code?
                        </div>
                        <div
                            style={{
                                ...linkStyle,
                                color: resendDisabled
                                    ? tokens.colors.neutral[400]
                                    : primaryColor,
                                cursor: resendDisabled ? "default" : "pointer",
                            }}
                            onClick={resendDisabled ? null : handleResendOTP}
                        >
                            {resendDisabled
                                ? `Resend in ${resendCountdown}s`
                                : "Resend code"}
                        </div>
                    </div>

                    <div style={linkStyle} onClick={toggleVerificationMethod}>
                        {isPhoneVerification
                            ? "Send code to email instead"
                            : "Send code to phone instead"}
                    </div>
                </div>
            </div>

            {/* Testing Information */}
            <div style={testInfoStyle}>
                <div
                    style={{
                        fontWeight: tokens.fontWeight.medium,
                        marginBottom: tokens.spacing[2],
                    }}
                >
                    Testing Information:
                </div>
                <div>Use OTP "123456" for successful verification.</div>
                <div>Any other value will result in failure.</div>
            </div>

            {/* Navigation Buttons - only shown if showFixedButton prop is true */}
            {showFixedButton && (
                <FormButtons
                    onBack={onPreviousStep}
                    onNext={verifyOTPCode}
                    nextButtonText={
                        isVerifying ? "Verifying..." : "Verify & Proceed"
                    }
                    rightIcon={!isVerifying}
                    isNextDisabled={isVerifying || otp.length !== 6}
                    primaryColor={primaryColor}
                />
            )}
        </div>
    )
}

addPropertyControls(OTPVerification, {
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
    phoneNumber: {
        type: ControlType.String,
        title: "Phone Number",
        defaultValue: "+91 9876543210",
    },
    email: {
        type: ControlType.String,
        title: "Email",
        defaultValue: "user@example.com",
    },
    autoFillOTP: {
        type: ControlType.String,
        title: "Auto-fill OTP (testing)",
        defaultValue: "123456",
    },
    showFixedButton: {
        type: ControlType.Boolean,
        title: "Show Fixed Button",
        defaultValue: true,
    },
})
