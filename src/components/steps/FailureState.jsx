// Adapted from booking-form/2. steps/8. FailureState.tsx
import React from "react";
import Button from "../ui/Button"; // Assuming Button component is adapted

export default function FailureState(props) {
  const {
    // primaryColor = "blue-600", // Inherited via Button variants
    errorMessage = "Your payment could not be processed at this time.",
    errorCode = "ERR-PAYMENT-3042",
    onTryAgain, // Function to retry payment (e.g., show overlay again)
    onContactSupport, // Optional: Function for contact support action
    onStartOver, // Function to reset the booking flow
    className = "",
    ...rest
  } = props;

  // Error icon (basic SVG)
  const errorIcon = (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-red-600" // Tailwind color
    >
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="4" />
      <line x1="16" y1="16" x2="32" y2="32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="16" y1="32" x2="32" y2="16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col items-center p-6 ${className}`;
  const iconContainerClasses = "w-20 h-20 rounded-full bg-red-100 flex justify-center items-center mb-6";
  const headingClasses = "text-2xl font-bold text-red-600 mb-2 text-center";
  const subheadingClasses = "text-lg text-neutral-700 mb-2 text-center";
  const errorCodeClasses = "text-sm text-neutral-500 mb-6 text-center";
  const troubleshootingCardClasses = "w-full bg-neutral-50 rounded-lg p-6 mb-6 shadow"; // Added shadow
  const cardHeadingClasses = "text-lg font-bold mb-4 text-neutral-800"; // Adjusted color
  const tipClasses = "flex mb-3 gap-3 items-start"; // Added items-start
  const tipNumberClasses = "w-6 h-6 rounded-full bg-neutral-200 flex justify-center items-center text-sm font-medium flex-shrink-0";
  const tipTextClasses = "text-sm text-neutral-700 flex-1";
  const buttonContainerClasses = "flex flex-col gap-3 w-full max-w-xs mx-auto"; // Centered buttons

  return (
    <div className={containerClasses} {...rest}>
      <div className={iconContainerClasses}>{errorIcon}</div>

      <div className={headingClasses}>Payment Failed</div>
      <div className={subheadingClasses}>{errorMessage}</div>
      <div className={errorCodeClasses}>Error Code: {errorCode}</div>

      <div className={troubleshootingCardClasses}>
        <div className={cardHeadingClasses}>Troubleshooting Tips</div>
        <div className={tipClasses}>
          <div className={tipNumberClasses}>1</div>
          <div className={tipTextClasses}>Check if your card has sufficient balance</div>
        </div>
        <div className={tipClasses}>
          <div className={tipNumberClasses}>2</div>
          <div className={tipTextClasses}>Ensure your card is enabled for online transactions</div>
        </div>
        <div className={tipClasses}>
          <div className={tipNumberClasses}>3</div>
          <div className={tipTextClasses}>Try a different payment method</div>
        </div>
        <div className={tipClasses}>
          <div className={tipNumberClasses}>4</div>
          <div className={tipTextClasses}>Contact your bank if the issue persists</div>
        </div>
      </div>

      <div className={buttonContainerClasses}>
        <Button
          text="Try Again"
          onClick={onTryAgain} // Trigger retry action
          variant="primary"
          // className="..."
        />
        {onContactSupport && (
            <Button
            text="Contact Support"
            variant="outline"
            onClick={onContactSupport}
            // className="..."
            />
        )}
        <Button
          text="Start Over"
          variant="outline"
          onClick={onStartOver} // Reset the flow
          // className="..."
        />
      </div>
    </div>
  );
}
