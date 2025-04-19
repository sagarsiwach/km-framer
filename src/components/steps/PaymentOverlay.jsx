// Adapted from booking-form/2. steps/6. PaymentOverlay.tsx
import React, { useState } from "react";
import Button from "../ui/Button"; // Assuming Button component is adapted

export default function PaymentOverlay(props) {
  const {
    // primaryColor = "blue-600", // Inherited via Button variants
    totalAmount = "₹0",
    onPaymentSuccess,
    onPaymentFailure,
    onCancel,
    className = "",
    ...rest
  } = props;

  const [isProcessing, setIsProcessing] = useState(false);

  // Demo payment processing
  const processPayment = (success) => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      if (success && onPaymentSuccess) onPaymentSuccess();
      else if (!success && onPaymentFailure) onPaymentFailure();
    }, 2000); // Simulate 2 second delay
  };

  // Placeholder classes - apply Tailwind here
  const overlayClasses = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4";
  const paymentCardClasses = "bg-white rounded-lg p-6 w-full max-w-sm shadow-xl";
  const headingClasses = "text-xl font-bold mb-2 text-center text-neutral-900";
  const subheadingClasses = "text-sm text-neutral-600 mb-6 text-center";
  const amountClasses = "text-2xl font-bold text-center mb-6 text-neutral-900";
  const buttonGroupClasses = "flex flex-col gap-3";

  return (
    <div className={`${overlayClasses} ${className}`} {...rest}>
      <div className={paymentCardClasses}>
        <div className={headingClasses}>Complete Payment</div>
        <div className={subheadingClasses}>
          In a real implementation, this would integrate with a payment gateway. For demo purposes, please use the buttons below.
        </div>

        <div className={amountClasses}>Total: {totalAmount}</div>

        <div className={buttonGroupClasses}>
          <Button
            text={isProcessing ? "Processing..." : "Simulate Successful Payment"}
            onClick={() => processPayment(true)}
            variant="primary" // Use a success variant if available, or customize
            className="bg-green-600 hover:bg-green-700" // Example success color override
            disabled={isProcessing}
            loading={isProcessing} // Show spinner on primary button when loading
          />
          <Button
            text="Simulate Failed Payment"
            onClick={() => processPayment(false)}
            variant="destructive" // Use destructive variant
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
  );
}
