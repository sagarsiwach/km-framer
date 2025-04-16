import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useRef } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import Button from "https://framer.com/m/Button-SLtw.js"

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

    // Component styling
    style,
    ...rest
  } = props

  // Local state
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState(null)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(30)
  const [isPhoneVerification, setIsPhoneVerification] = useState(true)

  // Refs for OTP inputs
  const inputRefs = useRef([])

  // Auto-fill OTP if provided (for testing)
  useEffect(() => {
    if (autoFillOTP && autoFillOTP.length === 6) {
      const autoFillArray = autoFillOTP.split("")
      setOtpValues(autoFillArray)
    }
  }, [autoFillOTP])

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

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value.slice(0, 1)
    setOtpValues(newOtpValues)

    // Auto-move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  // Handle key down events for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (
        !otpValues[index] &&
        index > 0 &&
        inputRefs.current[index - 1]
      ) {
        inputRefs.current[index - 1].focus()
      }
    }
  }

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 6).split("")
      const newOtpValues = [...otpValues]

      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtpValues[index] = digit
        }
      })

      setOtpValues(newOtpValues)

      // Focus last filled input or next empty one
      const lastIndex = Math.min(digits.length, 5)
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus()
      }
    }
  }

  // Handle resend OTP
  const handleResendOTP = () => {
    setResendDisabled(true)
    setResendCountdown(30)
    // In a real implementation, would call an API to resend OTP
  }

  // Toggle between phone and email verification
  const toggleVerificationMethod = () => {
    setIsPhoneVerification(!isPhoneVerification)
    setOtpValues(["", "", "", "", "", ""])
    setVerificationError(null)
  }

  // Verify OTP
  const verifyOTP = () => {
    const otp = otpValues.join("")

    if (otp.length !== 6) {
      setVerificationError("Please enter a valid 6-digit OTP")
      return
    }

    setIsVerifying(true)
    setVerificationError(null)

    // Mock verification for testing
    setTimeout(() => {
      setIsVerifying(false)

      // For testing, accept 123456 or any value from autoFillOTP as valid
      if (otp === "123456" || (autoFillOTP && otp === autoFillOTP)) {
        if (onVerificationSuccess) onVerificationSuccess()
      } else {
        setVerificationError("Invalid OTP. Please try again.")
        if (onVerificationFailure) onVerificationFailure()
      }
    }, 1500)
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

  const otpInputContainerStyle = {
    display: "flex",
    gap: tokens.spacing[2],
    marginBottom: tokens.spacing[6],
    justifyContent: "center",
  }

  const otpInputStyle = {
    width: "40px",
    height: "48px",
    fontSize: tokens.fontSize.xl,
    textAlign: "center",
    border: `1px solid ${borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    outline: "none",
  }

  const actionsStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacing[4],
  }

  const linkStyle = {
    color: primaryColor,
    cursor: "pointer",
    fontSize: tokens.fontSize.sm,
  }

  const errorStyle = {
    color: tokens.colors.red[600],
    fontSize: tokens.fontSize.sm,
    marginBottom: tokens.spacing[4],
    textAlign: "center",
  }

  const buttonContainerStyle = {
    display: "flex",
    gap: tokens.spacing[4],
    marginTop: tokens.spacing[8],
    width: "100%",
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
        <div style={otpInputContainerStyle} onPaste={handlePaste}>
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) =>
                handleChange(index, e.target.value)
              }
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={otpInputStyle}
            />
          ))}
        </div>

        {/* Error message */}
        {verificationError && (
          <div style={errorStyle}>{verificationError}</div>
        )}

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

      {/* Testing Buttons */}
      <div
        style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.neutral[100],
          borderRadius: tokens.borderRadius.DEFAULT,
          marginBottom: tokens.spacing[6],
          fontSize: tokens.fontSize.sm,
        }}
      >
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

      {/* Navigation Buttons */}
      <div style={buttonContainerStyle}>
        <Button
          text="Back"
          variant="outline"
          onClick={onPreviousStep}
          width="calc(50% - 8px)"
          primaryColor={primaryColor}
        />
        <Button
          text={isVerifying ? "Verifying..." : "Verify & Proceed"}
          rightIcon={!isVerifying}
          onClick={verifyOTP}
          width="calc(50% - 8px)"
          primaryColor={primaryColor}
          disabled={isVerifying || otpValues.join("").length !== 6}
        />
      </div>
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
})
