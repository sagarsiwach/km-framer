import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import Button from "https://framer.com/m/Button-SLtw.js";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function FailureState(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],

    // Error details
    errorMessage = "Your payment could not be processed at this time.",
    errorCode = "ERR-PAYMENT-3042",

    // Event handlers
    onTryAgain,
    onContactSupport,
    onStartOver,

    // Component styling
    style,
    ...rest
  } = props;

  // Styling
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: tokens.spacing[6],
    ...style,
  };

  const iconContainerStyle = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: tokens.colors.red[100],
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: tokens.spacing[6],
  };

  const headingStyle = {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.red[600],
    marginBottom: tokens.spacing[2],
    textAlign: "center",
  };

  const subheadingStyle = {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.neutral[700],
    marginBottom: tokens.spacing[2],
    textAlign: "center",
  };

  const errorCodeStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[500],
    marginBottom: tokens.spacing[6],
    textAlign: "center",
  };

  const troubleshootingCardStyle = {
    width: "100%",
    backgroundColor: tokens.colors.neutral[50],
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    marginBottom: tokens.spacing[6],
  };

  const cardHeadingStyle = {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing[4],
  };

  const tipStyle = {
    display: "flex",
    marginBottom: tokens.spacing[3],
    gap: tokens.spacing[3],
  };

  const tipNumberStyle = {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: tokens.colors.neutral[200],
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
  };

  const tipTextStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[700],
    flex: 1,
  };

  const buttonContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacing[3],
    width: "100%",
  };

  const errorIcon = (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="21" stroke="#DC2626" strokeWidth="4" />
      <line
        x1="16"
        y1="16"
        x2="32"
        y2="32"
        stroke="#DC2626"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="32"
        x2="32"
        y2="16"
        stroke="#DC2626"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div style={containerStyle} {...rest}>
      <div style={iconContainerStyle}>{errorIcon}</div>

      <div style={headingStyle}>Payment Failed</div>
      <div style={subheadingStyle}>{errorMessage}</div>
      <div style={errorCodeStyle}>Error Code: {errorCode}</div>

      <div style={troubleshootingCardStyle}>
        <div style={cardHeadingStyle}>Troubleshooting Tips</div>

        <div style={tipStyle}>
          <div style={tipNumberStyle}>1</div>
          <div style={tipTextStyle}>
            Check if your card has sufficient balance
          </div>
        </div>

        <div style={tipStyle}>
          <div style={tipNumberStyle}>2</div>
          <div style={tipTextStyle}>
            Ensure your card is enabled for online transactions
          </div>
        </div>

        <div style={tipStyle}>
          <div style={tipNumberStyle}>3</div>
          <div style={tipTextStyle}>Try a different payment method</div>
        </div>

        <div style={tipStyle}>
          <div style={tipNumberStyle}>4</div>
          <div style={tipTextStyle}>
            Contact your bank if the issue persists
          </div>
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <Button
          text="Try Again"
          onClick={onTryAgain}
          primaryColor={primaryColor}
        />

        <Button
          text="Contact Support"
          variant="outline"
          onClick={onContactSupport}
          primaryColor={primaryColor}
        />

        <Button
          text="Start Over"
          variant="outline"
          onClick={onStartOver}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}

addPropertyControls(FailureState, {
  primaryColor: {
    type: ControlType.Color,
    title: "Primary Color",
    defaultValue: tokens.colors.blue[600],
  },
  errorMessage: {
    type: ControlType.String,
    title: "Error Message",
    defaultValue: "Your payment could not be processed at this time.",
  },
  errorCode: {
    type: ControlType.String,
    title: "Error Code",
    defaultValue: "ERR-PAYMENT-3042",
  },
});
