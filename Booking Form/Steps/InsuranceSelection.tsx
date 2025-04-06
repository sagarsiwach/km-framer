import { addPropertyControls, ControlType } from "framer";
import { useState, useEffect } from "react";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import Button from "https://framer.com/m/Button-SLtw.js";
import VariantCard from "https://framer.com/m/VariantCard-5sVx.js";

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
    dataEndpoint = "https://your-n8n-endpoint.com/insurance-data",

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
  } = props;

  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insuranceData, setInsuranceData] = useState({
    tenures: [],
    providers: [],
    coreInsurance: [],
    additionalCoverage: [],
  });

  const [tenureValue, setTenureValue] = useState(selectedTenureId);
  const [providerValue, setProviderValue] = useState(selectedProviderId);
  const [coreInsuranceValues, setCoreInsuranceValues] = useState(
    selectedCoreInsuranceIds,
  );
  const [additionalCoverageValues, setAdditionalCoverageValues] = useState(
    selectedAdditionalCoverageIds,
  );

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!dataEndpoint) {
        // When no endpoint is provided, use fallback data for testing/development
        setInsuranceData({
          tenures: [
            { id: "1year", name: "01 Year" },
            { id: "5years", name: "05 Years" },
          ],
          providers: [
            { id: "icici", name: "ICICI Lombard" },
            { id: "hdfc", name: "HDFC ERGO" },
            { id: "bajaj", name: "Bajaj Allianz" },
          ],
          coreInsurance: [
            {
              id: "base",
              title: "Base Insurance",
              subtitle: "03 Free Service with 01 Labour Charge",
              price: 9942,
              required: true,
            },
            {
              id: "personal-accident",
              title: "Personal Accident Cover",
              subtitle: "02 Service + 01 Inspection Camp",
              price: 1582,
              required: true,
            },
            {
              id: "zero-depreciation",
              title: "Zero Depreciation",
              subtitle: "02 Service + 01 Inspection Camp",
              price: 1582,
              required: false,
            },
            {
              id: "roadside-assistance",
              title: "Road Side Assistance",
              subtitle: "On-Road Tow and Repair",
              price: 117,
              required: false,
            },
          ],
          additionalCoverage: [
            {
              id: "rim-protection",
              title: "Rim Protection",
              subtitle: "03 Free Service with 01 Labour Charge",
              price: 1000,
              required: false,
            },
            {
              id: "rodent-protection",
              title: "Rodent Protection",
              subtitle: "02 Service + 01 Inspection Camp",
              price: 2999,
              required: false,
            },
          ],
        });

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(dataEndpoint);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        setInsuranceData(
          data.insuranceOptions || {
            tenures: [],
            providers: [],
            coreInsurance: [],
            additionalCoverage: [],
          },
        );
      } catch (err) {
        console.error("Error fetching insurance data:", err);
        setError("Failed to load insurance data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataEndpoint]);

  // Set default values after data is loaded
  useEffect(() => {
    // Set default tenure if not already set
    if (
      !tenureValue &&
      insuranceData.tenures &&
      insuranceData.tenures.length > 0
    ) {
      setTenureValue(insuranceData.tenures[0].id);
      if (onTenureSelect) onTenureSelect(insuranceData.tenures[0].id);
    }

    // Set default provider if not already set
    if (
      !providerValue &&
      insuranceData.providers &&
      insuranceData.providers.length > 0
    ) {
      setProviderValue(insuranceData.providers[0].id);
      if (onProviderSelect) onProviderSelect(insuranceData.providers[0].id);
    }

    // Set required core insurance options
    if (coreInsuranceValues.length === 0 && insuranceData.coreInsurance) {
      const requiredInsurance = insuranceData.coreInsurance
        .filter((ins) => ins.required)
        .map((ins) => ins.id);

      setCoreInsuranceValues(requiredInsurance);
      if (onCoreInsuranceSelect) onCoreInsuranceSelect(requiredInsurance);
    }
  }, [insuranceData]);

  // Update form data on any field change
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        tenure: tenureValue,
        provider: providerValue,
        coreInsurance: coreInsuranceValues,
        additionalCoverage: additionalCoverageValues,
      });
    }
  }, [
    tenureValue,
    providerValue,
    coreInsuranceValues,
    additionalCoverageValues,
  ]);

  // Handlers
  const handleTenureSelect = (id) => {
    setTenureValue(id);
    if (onTenureSelect) onTenureSelect(id);
  };

  const handleProviderSelect = (id) => {
    setProviderValue(id);
    if (onProviderSelect) onProviderSelect(id);
  };

  const handleCoreInsuranceSelect = (id, isSelected) => {
    // Get the insurance item
    const insuranceItem = insuranceData.coreInsurance.find(
      (item) => item.id === id,
    );

    // If required, don't allow deselection
    if (insuranceItem && insuranceItem.required && !isSelected) {
      return;
    }

    let newValues;
    if (isSelected) {
      newValues = [...coreInsuranceValues, id];
    } else {
      newValues = coreInsuranceValues.filter((item) => item !== id);
    }

    setCoreInsuranceValues(newValues);
    if (onCoreInsuranceSelect) onCoreInsuranceSelect(newValues);
  };

  const handleAdditionalCoverageSelect = (id, isSelected) => {
    let newValues;
    if (isSelected) {
      newValues = [...additionalCoverageValues, id];
    } else {
      newValues = additionalCoverageValues.filter((item) => item !== id);
    }

    setAdditionalCoverageValues(newValues);
    if (onAdditionalCoverageSelect) onAdditionalCoverageSelect(newValues);
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

  const optionsContainerStyle = {
    display: "flex",
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[4],
  };

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
  });

  const buttonContainerStyle = {
    display: "flex",
    gap: tokens.spacing[4],
    marginTop: tokens.spacing[8],
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;

    // Add core insurance prices
    insuranceData.coreInsurance.forEach((item) => {
      if (coreInsuranceValues.includes(item.id)) {
        total += item.price || 0;
      }
    });

    // Add additional coverage prices
    insuranceData.additionalCoverage.forEach((item) => {
      if (additionalCoverageValues.includes(item.id)) {
        total += item.price || 0;
      }
    });

    return total;
  };

  // Loading and error states
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: tokens.spacing[8] }}>
          Loading insurance information...
        </div>
      </div>
    );
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
    );
  }

  return (
    <div style={containerStyle} {...rest}>
      {/* Tenure Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Tenure</div>
        <div style={optionsContainerStyle}>
          {insuranceData.tenures.map((tenure) => (
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
          {insuranceData.providers.map((provider) => (
            <div
              key={provider.id}
              style={optionButtonStyle(provider.id === providerValue)}
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
        {insuranceData.coreInsurance.map((insurance) => (
          <VariantCard
            key={insurance.id}
            title={insurance.title}
            subtitle={insurance.subtitle}
            pricePrefix=""
            price={`₹${insurance.price.toLocaleString("en-IN")}`}
            includedText={insurance.required ? "Mandatory" : ""}
            isSelected={coreInsuranceValues.includes(insurance.id)}
            onClick={() =>
              handleCoreInsuranceSelect(
                insurance.id,
                !coreInsuranceValues.includes(insurance.id),
              )
            }
            borderColor={borderColor}
            selectedBorderColor={primaryColor}
            style={{ opacity: insurance.required ? 0.9 : 1 }}
          />
        ))}
      </div>

      {/* Additional Coverage */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Additional Coverage</div>
        {insuranceData.additionalCoverage.map((coverage) => (
          <VariantCard
            key={coverage.id}
            title={coverage.title}
            subtitle={coverage.subtitle}
            pricePrefix=""
            price={`₹${coverage.price.toLocaleString("en-IN")}`}
            isSelected={additionalCoverageValues.includes(coverage.id)}
            onClick={() =>
              handleAdditionalCoverageSelect(
                coverage.id,
                !additionalCoverageValues.includes(coverage.id),
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
  );
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
    defaultValue: "",
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
});
