// booking-form/steps/6. PaymentOverlay.tsx
import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import Button from "../components/ui/1. Button"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function PaymentOverlay(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],

    // Payment details
    totalAmount = "₹2,02,236",

    // Event handlers
    onPaymentSuccess,
    onPaymentFailure,
    onCancel,

    // Component styling
    style,
    ...rest
  } = props

  // Local state
  const [isProcessing, setIsProcessing] = useState(false)

  // Styling
  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    ...style,
  }

  const paymentCardStyle = {
    backgroundColor: "white",
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    width: "90%",
    maxWidth: "400px",
    boxShadow: tokens.boxShadow.xl,
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

  const amountStyle = {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    textAlign: "center",
    marginBottom: tokens.spacing[6],
  }

  const buttonGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacing[3],
  }

  // Demo payment processing
  const processPayment = (success) => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)

      if (success) {
        if (onPaymentSuccess) onPaymentSuccess()
      } else {
        if (onPaymentFailure) onPaymentFailure()
      }
    }, 2000)
  }

  return (
    <div style={overlayStyle} {...rest}>
      <div style={paymentCardStyle}>
        <div style={headingStyle}>Complete Payment</div>
        <div style={subheadingStyle}>
          In a real implementation, this would integrate with Razorpay
          or another payment gateway. For demo purposes, please use
          the buttons below.
        </div>

        <div style={amountStyle}>Total: {totalAmount}</div>

        <div style={buttonGroupStyle}>
          <Button
            text={
              isProcessing
                ? "Processing..."
                : "Simulate Successful Payment"
            }
            onClick={() => processPayment(true)}
            primaryColor={tokens.colors.green[600]}
            disabled={isProcessing}
          />

          <Button
            text="Simulate Failed Payment"
            onClick={() => processPayment(false)}
            primaryColor={tokens.colors.red[600]}
            disabled={isProcessing}
          />

          <Button
            text="Cancel"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  )
}

addPropertyControls(PaymentOverlay, {
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
  totalAmount: {
    type: ControlType.String,
    title: "Total Amount",
    defaultValue: "₹2,02,236",
  },
})
