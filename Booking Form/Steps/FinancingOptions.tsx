import { addPropertyControls, ControlType } from "framer";
import { useState, useEffect } from "react";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import Button from "https://framer.com/m/Button-SLtw.js";
import InputField from "https://framer.com/m/InputField-d7w7.js";
import VariantCard from "https://framer.com/m/VariantCard-5sVx.js";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function FinancingOptions(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],

    // Initial values
    selectedPaymentMethod = "",
    loanTenure = 36,
    downPaymentAmount = 0,

    // Event handlers
    onPreviousStep,
    onNextStep,
    onPaymentMethodSelect,
    onLoanTenureChange,
    onDownPaymentChange,
    onFormDataChange,

    // Component styling
    style,
    ...rest
  } = props;

  // Payment methods
  const paymentMethods = [
    {
      id: "full-payment",
      title: "Full Payment",
      subtitle: "Pay the entire amount upfront",
      description: "",
    },
    {
      id: "loan",
      title: "EMI Option",
      subtitle: "Start your ride with Zero down payment",
      description: "EMI starting from ₹499/month",
    },
  ];

  // Loan tenure options
  const tenureOptions = [
    { months: 12, label: "12 Months" },
    { months: 24, label: "24 Months" },
    { months: 36, label: "36 Months" },
    { months: 48, label: "48 Months" },
    { months: 60, label: "60 Months" },
  ];

  // Local state
  const [paymentMethod, setPaymentMethod] = useState(
    selectedPaymentMethod || "full-payment",
  );
  const [tenure, setTenure] = useState(loanTenure);
  const [downPayment, setDownPayment] = useState(downPaymentAmount);
  const [emiAmount, setEmiAmount] = useState(499);

  // Update form data on any field change
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        paymentMethod,
        loanTenure: tenure,
        downPaymentAmount: downPayment,
      });
    }
  }, [paymentMethod, tenure, downPayment]);

  // Handle payment method selection
  const handlePaymentMethodSelect = (id) => {
    setPaymentMethod(id);
    if (onPaymentMethodSelect) onPaymentMethodSelect(id);
  };

  // Handle loan tenure change
  const handleTenureChange = (months) => {
    setTenure(months);
    // Demo calculation - in production would use a more complex formula
    setEmiAmount(Math.round(190236 / months));
    if (onLoanTenureChange) onLoanTenureChange(months);
  };

  // Handle down payment change
  const handleDownPaymentChange = (value) => {
    setDownPayment(parseInt(value) || 0);
    if (onDownPaymentChange) onDownPaymentChange(parseInt(value) || 0);
  };

  // Styling
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    ...style,
  };

  const sectionStyle = {
    marginBottom: tokens.spacing[6],
  };

  const sectionTitleStyle = {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.neutral[600],
    textTransform: "uppercase",
    marginBottom: tokens.spacing[3],
  };

  const priceBoxStyle = {
    backgroundColor: tokens.colors.neutral[100],
    borderRadius: tokens.borderRadius.DEFAULT,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
  };

  const flexBetweenStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const buttonContainerStyle = {
    display: "flex",
    gap: tokens.spacing[4],
    marginTop: tokens.spacing[8],
  };

  const tenureOptionsStyle = {
    display: "flex",
    gap: tokens.spacing[2],
    flexWrap: "wrap",
    marginBottom: tokens.spacing[4],
  };

  const tenureOptionStyle = (isSelected) => ({
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: isSelected ? primaryColor : "white",
    color: isSelected ? "white" : tokens.colors.neutral[800],
    border: `1px solid ${isSelected ? primaryColor : borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
  });

  return (
    <div style={containerStyle} {...rest}>
      {/* Price Summary */}
      <div style={priceBoxStyle}>
        <div style={flexBetweenStyle}>
          <div>
            <div
              style={{
                fontSize: tokens.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Vehicle Price
            </div>
            <div
              style={{
                fontSize: tokens.fontSize.xl,
                fontWeight: tokens.fontWeight.bold,
              }}
            >
              ₹1,90,236
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: tokens.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Insurance
            </div>
            <div style={{ fontSize: tokens.fontSize.base }}>₹12,000</div>
          </div>
          <div>
            <div
              style={{
                fontSize: tokens.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              Total
            </div>
            <div style={{ fontSize: tokens.fontSize.base }}>₹2,02,236</div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Payment Method</div>
        {paymentMethods.map((method) => (
          <VariantCard
            key={method.id}
            title={method.title}
            subtitle={method.subtitle}
            description={method.description}
            isSelected={method.id === paymentMethod}
            onClick={() => handlePaymentMethodSelect(method.id)}
            borderColor={borderColor}
            selectedBorderColor={primaryColor}
          />
        ))}
      </div>

      {/* Loan Options - only show if EMI is selected */}
      {paymentMethod === "loan" && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Loan Tenure</div>
          <div style={tenureOptionsStyle}>
            {tenureOptions.map((option) => (
              <div
                key={option.months}
                style={tenureOptionStyle(option.months === tenure)}
                onClick={() => handleTenureChange(option.months)}
              >
                {option.label}
              </div>
            ))}
          </div>

          <div style={sectionTitleStyle}>Down Payment (Optional)</div>
          <InputField
            type="number"
            placeholder="Enter amount"
            value={downPayment.toString()}
            onChange={handleDownPaymentChange}
            borderColor={borderColor}
            focusBorderColor={primaryColor}
          />

          <div
            style={{
              ...priceBoxStyle,
              marginTop: tokens.spacing[4],
            }}
          >
            <div style={flexBetweenStyle}>
              <div>
                <div
                  style={{
                    fontSize: tokens.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Monthly EMI
                </div>
                <div
                  style={{
                    fontSize: tokens.fontSize.xl,
                    fontWeight: tokens.fontWeight.bold,
                  }}
                >
                  ₹{emiAmount}/mo
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: tokens.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Down Payment
                </div>
                <div style={{ fontSize: tokens.fontSize.base }}>
                  ₹{downPayment.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: tokens.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Tenure
                </div>
                <div style={{ fontSize: tokens.fontSize.base }}>
                  {tenure} months
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          text="Continue to Personal Info"
          rightIcon={true}
          onClick={onNextStep}
          width="calc(50% - 8px)"
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}

addPropertyControls(FinancingOptions, {
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
  selectedPaymentMethod: {
    type: ControlType.String,
    title: "Payment Method",
    defaultValue: "full-payment",
  },
  loanTenure: {
    type: ControlType.Number,
    title: "Loan Tenure (months)",
    defaultValue: 36,
    min: 12,
    max: 60,
    step: 12,
  },
  downPaymentAmount: {
    type: ControlType.Number,
    title: "Down Payment",
    defaultValue: 0,
    min: 0,
    max: 200000,
    step: 1000,
  },
});
