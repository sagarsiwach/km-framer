// Adapted from booking-form/2. steps/3. FinancingOptions.tsx
import React, { useState, useEffect } from "react";
import { useBooking } from "../../context/BookingContext";
import SectionTitle from "../form-sections/SectionTitle";
import PaymentMethodSelector from "../step-components/PaymentMethodSelector";
import InputField from "../ui/InputField";
import FormButtons from "../form-sections/FormButtons";
import LoadingIndicator from "../form-sections/LoadingIndicator";
import ErrorDisplay from "../form-sections/ErrorDisplay";
import PriceDisplay from "../ui/PriceDisplay"; // Import PriceDisplay

export default function FinancingOptions(props) {
  const {
    onPreviousStep,
    onNextStep,
    primaryColor = "blue-600", // Example Tailwind color name
    borderColor = "neutral-300", // Example Tailwind color name
    className = "",
    ...rest
  } = props;

  const { formData, updateFormData, vehicleData, loading, apiError, calculateTotalPrice } = useBooking();

  // Local state for this step
  const [paymentMethod, setPaymentMethod] = useState(formData.paymentMethod || "full-payment");
  const [tenure, setTenure] = useState(formData.loanTenure || 36);
  const [downPayment, setDownPayment] = useState(formData.downPaymentAmount || 0);
  const [emiAmount, setEmiAmount] = useState(0); // Calculated EMI

  // Finance data from context
  const financeProviders = vehicleData?.finance_providers || [];
  const financeOptions = vehicleData?.finance_options || [];

  // Loan tenure options (can be dynamic)
  const tenureOptions = [
    { months: 12, label: "12 Months" },
    { months: 24, label: "24 Months" },
    { months: 36, label: "36 Months" },
    { months: 48, label: "48 Months" },
    { months: 60, label: "60 Months" },
  ];

  // Calculate total vehicle price (base + variant + components)
  // Use context's calculation which includes base, variant, and components
  const vehicleAndComponentsPrice = calculateTotalPrice();

  // Calculate insurance price (sum of selected plans)
  const calculateInsurancePrice = () => {
    let insuranceTotal = 0;
    const allSelectedInsuranceIds = [
      ...(formData.selectedCoreInsurance || []),
      ...(formData.selectedAdditionalCoverage || []),
    ];
    if (allSelectedInsuranceIds.length > 0 && vehicleData?.insurance_plans) {
      allSelectedInsuranceIds.forEach((planId) => {
        const plan = vehicleData.insurance_plans.find((p) => p.id === planId);
        if (plan) insuranceTotal += plan.price || 0;
      });
    }
    return insuranceTotal;
  };
  const insurancePrice = calculateInsurancePrice();

  // Grand total price (Vehicle + Components + Insurance)
  const grandTotalPrice = vehicleAndComponentsPrice; // Context calculateTotalPrice already includes insurance

  // Update form data in context when local state changes
  useEffect(() => {
    updateFormData({
      paymentMethod,
      loanTenure: tenure,
      downPaymentAmount: downPayment,
    });
  }, [paymentMethod, tenure, downPayment, updateFormData]);

  // Calculate EMI amount whenever relevant values change
  useEffect(() => {
    const calculateEmi = () => {
      if (paymentMethod !== "loan") {
        setEmiAmount(0);
        return;
      }
      // Find a sample interest rate (replace with actual logic if available)
      const sampleOption = financeOptions.find(opt => opt.tenure_months === tenure) || financeOptions[0];
      const interestRate = sampleOption ? sampleOption.interest_rate / 100 / 12 : 0.01; // Monthly rate (e.g., 12% annual / 12)
      const loanAmount = grandTotalPrice - downPayment;
      const tenureMonths = tenure;

      if (loanAmount <= 0 || tenureMonths <= 0) {
        setEmiAmount(0);
        return;
      }

      if (interestRate === 0) {
        setEmiAmount(Math.round(loanAmount / tenureMonths));
        return;
      }

      // EMI formula: P x R x (1+R)^N / [(1+R)^N-1]
      const emi = loanAmount * interestRate * Math.pow(1 + interestRate, tenureMonths) / (Math.pow(1 + interestRate, tenureMonths) - 1);
      setEmiAmount(Math.round(emi));
    };

    calculateEmi();
  }, [grandTotalPrice, downPayment, tenure, paymentMethod, financeOptions]);

  // Handlers
  const handlePaymentMethodSelect = (id) => setPaymentMethod(id);
  const handleTenureChange = (months) => setTenure(months);
  const handleDownPaymentChange = (value) => {
    const paymentValue = parseInt(value) || 0;
    // Ensure down payment doesn't exceed total price
    setDownPayment(Math.min(paymentValue, grandTotalPrice));
  };

  // Format price helper
  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`;

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col w-full ${className}`;
  const sectionClasses = "mb-8";
  const priceBoxClasses = "bg-neutral-100 rounded-lg p-4 mb-6";
  const flexBetweenClasses = "flex justify-between items-center";
  const priceLabelClasses = "text-sm text-neutral-500";
  const priceValueClasses = "text-base font-medium text-neutral-900";
  const priceValueLargeClasses = "text-xl font-bold text-neutral-900";
  const tenureOptionsContainerClasses = "flex gap-2 flex-wrap mb-4";
  const tenureOptionBaseClasses = "px-3 py-2 border rounded text-sm cursor-pointer transition-all";
  const tenureOptionStateClasses = (isSelected) => isSelected ? `bg-blue-600 text-white border-blue-600` : `bg-white text-neutral-800 border-neutral-300 hover:border-blue-600`;
  const emiBoxClasses = `${priceBoxClasses} mt-4`; // Reuse price box style

  if (loading && !vehicleData) return <LoadingIndicator text="Loading financing options..." />;
  if (apiError) return <ErrorDisplay error={apiError} />;

  return (
    <div className={containerClasses} {...rest}>
      {/* Price Summary */}
      <div className={priceBoxClasses}>
        <div className={flexBetweenClasses}>
          <div>
            <div className={priceLabelClasses}>Vehicle + Options</div>
            {/* Use PriceDisplay component for consistency */}
            <PriceDisplay price={vehicleAndComponentsPrice - insurancePrice} size="large" fontWeight="bold" />
          </div>
          <div>
            <div className={priceLabelClasses}>Insurance</div>
             <PriceDisplay price={insurancePrice} size="medium" fontWeight="medium" />
          </div>
          <div>
            <div className={priceLabelClasses}>Total</div>
             <PriceDisplay price={grandTotalPrice} size="medium" fontWeight="medium" />
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className={sectionClasses}>
        <PaymentMethodSelector
          title="Payment Method"
          selectedMethodId={paymentMethod}
          onSelect={handlePaymentMethodSelect}
          // Pass Tailwind classes via className prop if needed
          // className="..."
        />
      </div>

      {/* Loan Options - only show if EMI is selected */}
      {paymentMethod === "loan" && (
        <div className={sectionClasses}>
          <SectionTitle title="Loan Tenure" />
          <div className={tenureOptionsContainerClasses}>
            {tenureOptions.map((option) => (
              <button
                key={option.months}
                type="button"
                className={`${tenureOptionBaseClasses} ${tenureOptionStateClasses(option.months === tenure)}`}
                onClick={() => handleTenureChange(option.months)}
                aria-pressed={option.months === tenure}
              >
                {option.label}
              </button>
            ))}
          </div>

          <InputField
            label="Down Payment (Optional)"
            type="number"
            placeholder="Enter amount"
            value={downPayment.toString()} // InputField expects string
            onChange={(value) => handleDownPaymentChange(value)} // InputField passes string value
            // Pass Tailwind classes via className prop if needed
            // className="..."
          />

          {/* EMI Display Box */}
          <div className={emiBoxClasses}>
            <div className={flexBetweenClasses}>
              <div>
                <div className={priceLabelClasses}>Monthly EMI</div>
                <div className={priceValueLargeClasses}>
                  {emiAmount > 0 ? `${formatPrice(emiAmount)}/mo` : '-'}
                </div>
              </div>
              <div>
                <div className={priceLabelClasses}>Down Payment</div>
                <div className={priceValueClasses}>{formatPrice(downPayment)}</div>
              </div>
              <div>
                <div className={priceLabelClasses}>Tenure</div>
                <div className={priceValueClasses}>{tenure} months</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <FormButtons
        onBack={onPreviousStep}
        onNext={onNextStep}
        nextButtonText="Continue to Personal Info"
        // Pass Tailwind classes via className prop if needed
        // className="..."
      />
    </div>
  );
}
