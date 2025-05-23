import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect } from "react"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import Button from "https://framer.com/m/Button-SLtw.js"
import VariantCard from "https://framer.com/m/VariantCard-5sVx.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function InsuranceSelection(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],

    // API endpoint for data
    dataEndpoint = "https://booking-engine.sagarsiwach.workers.dev/",

    // Initial values
    selectedTenureId = "",
    selectedProviderId = "",
    selectedCoreInsuranceIds = [],
    selectedAdditionalCoverageIds = [],

    // Event handlers
    onPreviousStep,
    onNextStep,
    onTenureSelect,
    onProviderSelect,
    onCoreInsuranceSelect,
    onAdditionalCoverageSelect,
    onFormDataChange,

    // Component styling
    style,
    ...rest
  } = props

  // Local state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [insuranceData, setInsuranceData] = useState({})

  const [tenureValue, setTenureValue] = useState(selectedTenureId)
  const [providerValue, setProviderValue] = useState(selectedProviderId)
  const [coreInsuranceValues, setCoreInsuranceValues] = useState(
    selectedCoreInsuranceIds
  )
  const [additionalCoverageValues, setAdditionalCoverageValues] = useState(
    selectedAdditionalCoverageIds
  )

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch insurance data
        const response = await fetch(dataEndpoint)

        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status}`
          )
        }

        const result = await response.json()

        if (result.status === "success" && result.data) {
          // Extract insurance providers and plans
          setInsuranceData({
            providers: result.data.insurance_providers || [],
            plans: result.data.insurance_plans || [],
          })
        } else {
          throw new Error("Invalid data format received from API")
        }
      } catch (err) {
        console.error("Error fetching insurance data:", err)
        setError(
          "Failed to load insurance data. Please try again later."
        )

        // Set fallback data for testing/development
        setInsuranceData({
          providers: [
            { id: 1, name: "DIGIT" },
            { id: 2, name: "ICICI LOMBARD" },
            { id: 3, name: "TURTLEMINT" },
            { id: 4, name: "BAJAJ ALLIANZ" },
          ],
          plans: [
            {
              id: 1,
              provider_id: 3,
              provider_name: "TURTLEMINT",
              plan_type: "CORE",
              title: "BASE INSURANCE",
              subtitle: "STANDARD LINE FOR BASE INSURANCE",
              description: "Basic required insurance coverage",
              price: 9942,
              is_required: true,
              tenure_months: 12,
            },
            {
              id: 2,
              provider_id: 3,
              provider_name: "TURTLEMINT",
              plan_type: "CORE",
              title: "PERSONAL ACCIDENT COVER",
              subtitle:
                "STANDARD LINE FOR PERSONAL ACCIDENT COVER",
              description: "Coverage for personal injuries",
              price: 9942,
              is_required: true,
              tenure_months: 12,
            },
            {
              id: 5,
              provider_id: 3,
              provider_name: "TURTLEMINT",
              plan_type: "ADDITIONAL",
              title: "RIM PROTECTION",
              subtitle: "STANDARD LINE FOR RIM PROTECTION",
              description: "Coverage for wheel rim damage",
              price: 9942,
              is_required: false,
              tenure_months: 12,
            },
            {
              id: 6,
              provider_id: 3,
              provider_name: "TURTLEMINT",
              plan_type: "ADDITIONAL",
              title: "RODENT PROTECTION",
              subtitle: "STANDARD LINE FOR RODENT PROTECTION",
              description: "Coverage for rodent damage to wiring",
              price: 9942,
              is_required: false,
              tenure_months: 12,
            },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dataEndpoint])

  // Prepare data for display
  const tenures = [
    { id: "1year", name: "01 Year" },
    { id: "5years", name: "05 Years" },
  ]

  const providers = insuranceData.providers || []

  const corePlans = insuranceData.plans
    ? insuranceData.plans.filter((plan) => plan.plan_type === "CORE")
    : []

  const additionalPlans = insuranceData.plans
    ? insuranceData.plans.filter((plan) => plan.plan_type === "ADDITIONAL")
    : []

  // Set default values after data is loaded
  useEffect(() => {
    // Set default tenure if not already set
    if (!tenureValue && tenures.length > 0) {
      setTenureValue(tenures[0].id)
      if (onTenureSelect) onTenureSelect(tenures[0].id)
    }

    // Set default provider if not already set
    if (!providerValue && providers.length > 0) {
      setProviderValue(providers[0].id)
      if (onProviderSelect) onProviderSelect(providers[0].id)
    }

    // Set required core insurance options
    if (coreInsuranceValues.length === 0 && corePlans.length > 0) {
      const requiredInsurance = corePlans
        .filter((plan) => plan.is_required)
        .map((plan) => plan.id)

      setCoreInsuranceValues(requiredInsurance)
      if (onCoreInsuranceSelect) onCoreInsuranceSelect(requiredInsurance)
    }
  }, [insuranceData, tenures, providers, corePlans])

  // Update form data on any field change
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        tenure: tenureValue,
        provider: providerValue,
        coreInsurance: coreInsuranceValues,
        additionalCoverage: additionalCoverageValues,
      })
    }
  }, [
    tenureValue,
    providerValue,
    coreInsuranceValues,
    additionalCoverageValues,
  ])

  // Handlers
  const handleTenureSelect = (id) => {
    setTenureValue(id)
    if (onTenureSelect) onTenureSelect(id)
  }

  const handleProviderSelect = (id) => {
    setProviderValue(id)
    if (onProviderSelect) onProviderSelect(id)
  }

  const handleCoreInsuranceSelect = (id, isSelected) => {
    // Get the insurance item
    const insuranceItem = corePlans.find((item) => item.id === id)

    // If required, don't allow deselection
    if (insuranceItem && insuranceItem.is_required && !isSelected) {
      return
    }

    let newValues
    if (isSelected) {
      newValues = [...coreInsuranceValues, id]
    } else {
      newValues = coreInsuranceValues.filter((item) => item !== id)
    }

    setCoreInsuranceValues(newValues)
    if (onCoreInsuranceSelect) onCoreInsuranceSelect(newValues)
  }

  const handleAdditionalCoverageSelect = (id, isSelected) => {
    let newValues
    if (isSelected) {
      newValues = [...additionalCoverageValues, id]
    } else {
      newValues = additionalCoverageValues.filter((item) => item !== id)
    }

    setAdditionalCoverageValues(newValues)
    if (onAdditionalCoverageSelect) onAdditionalCoverageSelect(newValues)
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

  const optionsContainerStyle = {
    display: "flex",
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[4],
  }

  const optionButtonStyle = (isSelected) => ({
    flex: 1,
    padding: tokens.spacing[4],
    backgroundColor: isSelected ? primaryColor : "white",
    color: isSelected ? "white" : tokens.colors.neutral[900],
    border: `1px solid ${isSelected ? primaryColor : borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  })

  const buttonContainerStyle = {
    display: "flex",
    gap: tokens.spacing[4],
    marginTop: tokens.spacing[8],
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0

    // Add core insurance prices
    corePlans.forEach((item) => {
      if (coreInsuranceValues.includes(item.id)) {
        total += item.price || 0
      }
    })

    // Add additional coverage prices
    additionalPlans.forEach((item) => {
      if (additionalCoverageValues.includes(item.id)) {
        total += item.price || 0
      }
    })

    return total
  }

  // Loading and error states
  if (loading) {
    return (
      <div style={containerStyle}>
        <div
          style={{ textAlign: "center", padding: tokens.spacing[8] }}
        >
          Loading insurance information...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            textAlign: "center",
            padding: tokens.spacing[8],
            color: tokens.colors.red[600],
          }}
        >
          {error}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: tokens.spacing[4],
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: primaryColor,
              color: "white",
              border: "none",
              borderRadius: tokens.borderRadius.DEFAULT,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle} {...rest}>
      {/* Tenure Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Tenure</div>
        <div style={optionsContainerStyle}>
          {tenures.map((tenure) => (
            <div
              key={tenure.id}
              style={optionButtonStyle(tenure.id === tenureValue)}
              onClick={() => handleTenureSelect(tenure.id)}
            >
              {tenure.name}
            </div>
          ))}
        </div>
      </div>

      {/* Provider Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Provider</div>
        <div style={optionsContainerStyle}>
          {providers.map((provider) => (
            <div
              key={provider.id}
              style={optionButtonStyle(
                provider.id === providerValue
              )}
              onClick={() => handleProviderSelect(provider.id)}
            >
              {provider.name}
            </div>
          ))}
        </div>
      </div>

      {/* Core Insurance Coverage */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Core Insurance Coverage</div>
        {corePlans.map((insurance) => (
          <VariantCard
            key={insurance.id}
            title={insurance.title}
            subtitle={insurance.subtitle}
            description={insurance.description}
            pricePrefix=""
            price={`₹${insurance.price.toLocaleString("en-IN")}`}
            includedText={insurance.is_required ? "Mandatory" : ""}
            isSelected={coreInsuranceValues.includes(insurance.id)}
            onClick={() =>
              handleCoreInsuranceSelect(
                insurance.id,
                !coreInsuranceValues.includes(insurance.id)
              )
            }
            borderColor={borderColor}
            selectedBorderColor={primaryColor}
            style={{ opacity: insurance.is_required ? 0.9 : 1 }}
          />
        ))}
      </div>

      {/* Additional Coverage */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Additional Coverage</div>
        {additionalPlans.map((coverage) => (
          <VariantCard
            key={coverage.id}
            title={coverage.title}
            subtitle={coverage.subtitle}
            description={coverage.description}
            pricePrefix=""
            price={`₹${coverage.price.toLocaleString("en-IN")}`}
            isSelected={additionalCoverageValues.includes(
              coverage.id
            )}
            onClick={() =>
              handleAdditionalCoverageSelect(
                coverage.id,
                !additionalCoverageValues.includes(coverage.id)
              )
            }
            borderColor={borderColor}
            selectedBorderColor={primaryColor}
          />
        ))}
      </div>

      {/* Total Price Box */}
      <div
        style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.neutral[100],
          borderRadius: tokens.borderRadius.DEFAULT,
          marginBottom: tokens.spacing[6],
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: tokens.fontWeight.medium }}>
            Total Insurance Coverage
          </div>
          <div
            style={{
              fontSize: tokens.fontSize.lg,
              fontWeight: tokens.fontWeight.bold,
            }}
          >
            ₹{calculateTotalPrice().toLocaleString("en-IN")}
          </div>
        </div>
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
          text="Financing and Payment"
          rightIcon={true}
          onClick={onNextStep}
          width="calc(50% - 8px)"
          primaryColor={primaryColor}
        />
      </div>
    </div>
  )
}

addPropertyControls(InsuranceSelection, {
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
    title: "Data Endpoint",
    defaultValue: "https://booking-engine.sagarsiwach.workers.dev/",
  },
  selectedTenureId: {
    type: ControlType.String,
    title: "Selected Tenure",
    defaultValue: "",
  },
  selectedProviderId: {
    type: ControlType.String,
    title: "Selected Provider",
    defaultValue: "",
  },
  selectedCoreInsuranceIds: {
    type: ControlType.Array,
    title: "Selected Core Insurance",
    control: { type: ControlType.String },
    defaultValue: [],
  },
  selectedAdditionalCoverageIds: {
    type: ControlType.Array,
    title: "Selected Additional Coverage",
    control: { type: ControlType.String },
    defaultValue: [],
  },
})
