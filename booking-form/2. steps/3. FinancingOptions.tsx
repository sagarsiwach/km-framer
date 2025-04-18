// booking-form/steps/3. FinancingOptions.tsx
// Replace imports with:
import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import Button from "https://framer.com/m/Button-FXtj.js"
import InputField from "https://framer.com/m/InputField-oLfO.js"
import FormButtons from "https://framer.com/m/FormButtons-yqfJ.js"
import SectionTitle from "https://framer.com/m/SectionTitle-OVrp.js"
import PaymentMethodSelector from "https://framer.com/m/PaymentMethodSelector-oi31.js"

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

    // API endpoint for data
    dataEndpoint = "https://booking-engine.sagarsiwach.workers.dev/",

    // Vehicle data
    selectedVehicleId = "",
    selectedVariantId = "",
    selectedLocation = "",

    // Initial values
    selectedPaymentMethod = "full-payment",
    loanTenure = 36,
    downPaymentAmount = 0,

    // Event handlers
    onPreviousStep,
    onNextStep,
    onFormDataChange,

    // Component styling
    style,
    ...rest
  } = props

  // Local state
  const [paymentMethod, setPaymentMethod] = useState(
    selectedPaymentMethod || "full-payment"
  )
  const [tenure, setTenure] = useState(loanTenure)
  const [downPayment, setDownPayment] = useState(downPaymentAmount)
  const [emiAmount, setEmiAmount] = useState(499)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [financeData, setFinanceData] = useState({
    providers: [],
    options: [],
  })
  const [vehiclePrice, setVehiclePrice] = useState(0)
  const [insurancePrice, setInsurancePrice] = useState(12000)
  const [totalPrice, setTotalPrice] = useState(0)

  // Loan tenure options
  const tenureOptions = [
    { months: 12, label: "12 Months" },
    { months: 24, label: "24 Months" },
    { months: 36, label: "36 Months" },
    { months: 48, label: "48 Months" },
    { months: 60, label: "60 Months" },
  ]

  // Fetch pricing data based on selected vehicle and location
  useEffect(() => {
    if (!selectedVehicleId) return

    const fetchPricingData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(dataEndpoint)

        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status}`
          )
        }

        const result = await response.json()

        if (result.status === "success" && result.data) {
          // Set finance data
          setFinanceData({
            providers: result.data.finance_providers || [],
            options: result.data.finance_options || [],
          })

          // Find the price for the selected vehicle
          if (result.data.pricing) {
            const vehiclePricing = result.data.pricing.find(
              (item) => item.model_id === selectedVehicleId
            )

            if (vehiclePricing) {
              const price = vehiclePricing.base_price || 0
              setVehiclePrice(price)
              setTotalPrice(price + insurancePrice)

              // Calculate EMI
              calculateEmi(price, tenure)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching pricing data:", err)
        setError("Failed to load pricing data. Using default values.")

        // Set default values for testing
        const defaultPrice = 190000 // 1.9 lakhs
        setVehiclePrice(defaultPrice)
        setTotalPrice(defaultPrice + insurancePrice)
        calculateEmi(defaultPrice, tenure)
      } finally {
        setLoading(false)
      }
    }

    fetchPricingData()
  }, [dataEndpoint, selectedVehicleId, selectedLocation])

  // Update form data on any field change
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        paymentMethod,
        loanTenure: tenure,
        downPaymentAmount: downPayment,
      })
    }
  }, [paymentMethod, tenure, downPayment])

  // Calculate EMI amount
  const calculateEmi = (price, tenureMonths) => {
    // Simple EMI calculation
    // In reality, this would use a more complex formula with interest rates
    const effectivePrice = price - downPayment
    const emi = Math.round(effectivePrice / tenureMonths)
    setEmiAmount(emi)
  }

  // Handle payment method selection
  const handlePaymentMethodSelect = (id) => {
    setPaymentMethod(id)
  }

  // Handle loan tenure change
  const handleTenureChange = (months) => {
    setTenure(months)
    calculateEmi(vehiclePrice, months)
  }

  // Handle down payment change
  const handleDownPaymentChange = (value) => {
    const paymentValue = parseInt(value) || 0
    setDownPayment(paymentValue)
    calculateEmi(vehiclePrice, tenure)
  }

  // Format price for display
  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`
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

  const priceBoxStyle = {
    backgroundColor: tokens.colors.neutral[100],
    borderRadius: tokens.borderRadius.DEFAULT,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
  }

  const flexBetweenStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }

  const tenureOptionsStyle = {
    display: "flex",
    gap: tokens.spacing[2],
    flexWrap: "wrap",
    marginBottom: tokens.spacing[4],
  }

  const tenureOptionStyle = (isSelected) => ({
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    backgroundColor: isSelected ? primaryColor : "white",
    color: isSelected ? "white" : tokens.colors.neutral[800],
    border: `1px solid ${isSelected ? primaryColor : borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    fontSize: tokens.fontSize.sm,
    cursor: "pointer",
  })

  return (
    <div style={containerStyle} {...rest}>
      {/* Error display if needed */}
      {error && (
        <div
          style={{
            padding: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
            backgroundColor: tokens.colors.red[50],
            color: tokens.colors.red[700],
            borderRadius: tokens.borderRadius.DEFAULT,
            fontSize: tokens.fontSize.sm,
          }}
        >
          {error}
        </div>
      )}

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
              {formatPrice(vehiclePrice)}
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
            <div style={{ fontSize: tokens.fontSize.base }}>
              {formatPrice(insurancePrice)}
            </div>
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
            <div style={{ fontSize: tokens.fontSize.base }}>
              {formatPrice(totalPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div style={sectionStyle}>
        <PaymentMethodSelector
          title="Payment Method"
          selectedMethodId={paymentMethod}
          onSelect={handlePaymentMethodSelect}
          borderColor={borderColor}
          selectedBorderColor={primaryColor}
        />
      </div>

      {/* Loan Options - only show if EMI is selected */}
      {paymentMethod === "loan" && (
        <div style={sectionStyle}>
          <SectionTitle title="Loan Tenure" />
          <div style={tenureOptionsStyle}>
            {tenureOptions.map((option) => (
              <div
                key={option.months}
                style={tenureOptionStyle(
                  option.months === tenure
                )}
                onClick={() =>
                  handleTenureChange(option.months)
                }
              >
                {option.label}
              </div>
            ))}
          </div>

          <SectionTitle title="Down Payment (Optional)" />
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
      <FormButtons
        onBack={onPreviousStep}
        onNext={onNextStep}
        nextButtonText="Continue to Personal Info"
        primaryColor={primaryColor}
      />
    </div>
  )
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
  dataEndpoint: {
    type: ControlType.String,
    title: "Pricing API Endpoint",
    defaultValue: "https://booking-engine.sagarsiwach.workers.dev/",
  },
  selectedVehicleId: {
    type: ControlType.String,
    title: "Selected Vehicle ID",
    defaultValue: "",
  },
  selectedVariantId: {
    type: ControlType.String,
    title: "Selected Variant ID",
    defaultValue: "",
  },
  selectedLocation: {
    type: ControlType.String,
    title: "Selected Location",
    defaultValue: "",
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
})
