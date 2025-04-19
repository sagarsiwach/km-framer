// Adapted from booking-form/2. steps/2. InsuranceSelection.tsx
import React, { useState, useEffect } from "react";
import { useBooking } from "../../context/BookingContext";
import SectionTitle from "../form-sections/SectionTitle";
import ProviderSelector from "../step-components/ProviderSelector";
import VariantCard from "../ui/VariantCard";
import FormButtons from "../form-sections/FormButtons";
import LoadingIndicator from "../form-sections/LoadingIndicator";
import ErrorDisplay from "../form-sections/ErrorDisplay";

export default function InsuranceSelection(props) {
  const {
    onPreviousStep,
    onNextStep,
    primaryColor = "blue-600", // Example Tailwind color name
    borderColor = "neutral-300", // Example Tailwind color name
    selectedBorderColor = "blue-600", // Example Tailwind color name
    className = "",
    ...rest
  } = props;

  const { formData, updateFormData, vehicleData, loading, apiError } = useBooking();

  // Local state to manage selections within this step
  const [selectedTenureId, setSelectedTenureId] = useState(formData.selectedTenure || "1year");
  const [selectedProviderId, setSelectedProviderId] = useState(formData.selectedProvider || "");
  const [selectedCoreInsuranceIds, setSelectedCoreInsuranceIds] = useState(formData.selectedCoreInsurance || []);
  const [selectedAdditionalCoverageIds, setSelectedAdditionalCoverageIds] = useState(formData.selectedAdditionalCoverage || []);

  // Available options (can be dynamic based on API/context)
  const tenures = [
    { id: "1year", name: "01 Year" },
    { id: "5years", name: "05 Years" },
  ];

  const providers = vehicleData?.insurance_providers || [];
  const allPlans = vehicleData?.insurance_plans || [];

  // Filter plans based on type
  const corePlans = allPlans.filter((plan) => plan.plan_type === "CORE");
  const additionalPlans = allPlans.filter((plan) => plan.plan_type === "ADDITIONAL");

  // Set default provider and required core plans when data loads
  useEffect(() => {
    if (!loading && !apiError) {
      if (!selectedProviderId && providers.length > 0) {
        setSelectedProviderId(providers[0].id);
      }
      // Ensure required plans are always selected
      const requiredIds = corePlans
        .filter((plan) => plan.is_required)
        .map((plan) => plan.id);

      // Combine current selections with required ones, removing duplicates
      setSelectedCoreInsuranceIds(prev => [...new Set([...prev, ...requiredIds])]);

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, apiError, providers, corePlans, selectedProviderId]); // Removed selectedCoreInsuranceIds.length dependency to avoid loop

  // Update context whenever local state changes
  useEffect(() => {
    updateFormData({
      selectedTenure: selectedTenureId,
      selectedProvider: selectedProviderId,
      selectedCoreInsurance: selectedCoreInsuranceIds,
      selectedAdditionalCoverage: selectedAdditionalCoverageIds,
    });
  }, [selectedTenureId, selectedProviderId, selectedCoreInsuranceIds, selectedAdditionalCoverageIds, updateFormData]);

  // Handlers
  const handleTenureSelect = (id) => setSelectedTenureId(id);
  const handleProviderSelect = (id) => setSelectedProviderId(id);

  const handleCoreInsuranceSelect = (id, isSelected) => {
    const plan = corePlans.find((p) => p.id === id);
    if (plan?.is_required && !isSelected) return; // Prevent deselecting required

    setSelectedCoreInsuranceIds((prev) =>
      isSelected ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleAdditionalCoverageSelect = (id, isSelected) => {
    setSelectedAdditionalCoverageIds((prev) =>
      isSelected ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  // Calculate total price for display
  const calculateTotalPrice = () => {
    let total = 0;
    [...selectedCoreInsuranceIds, ...selectedAdditionalCoverageIds].forEach((id) => {
      const plan = allPlans.find((p) => p.id === id);
      if (plan) total += plan.price || 0;
    });
    return total;
  };

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col w-full ${className}`;
  const sectionClasses = "mb-8";
  const optionsContainerClasses = "flex flex-wrap gap-3 mb-4";
  // Note: Tailwind doesn't support dynamic class names like `bg-${primaryColor}` directly.
  // You'll need to either:
  // 1. Use full class names: `bg-blue-600`, `border-blue-600`, etc.
  // 2. Configure Tailwind safelist if colors are truly dynamic.
  // 3. Apply styles conditionally using inline styles or CSS variables.
  // For simplicity, I'll use example static classes here. Adjust as needed.
  const optionButtonBaseClasses = "flex-1 min-w-[100px] px-4 py-3 border rounded text-base font-medium text-center cursor-pointer transition-all duration-200 ease-in-out";
  const optionButtonStateClasses = (isSelected) => isSelected ? `bg-blue-600 text-white border-blue-600` : `bg-white text-neutral-900 border-neutral-300 hover:border-blue-600 hover:bg-blue-50`;
  const totalPriceBoxClasses = "p-4 bg-neutral-100 rounded-lg mb-6";
  const totalPriceFlexClasses = "flex justify-between items-center";
  const totalPriceLabelClasses = "font-medium text-neutral-800";
  const totalPriceValueClasses = "text-lg font-bold text-neutral-900";

  if (loading && !vehicleData) return <LoadingIndicator text="Loading insurance options..." />; // Show loading only if vehicleData isn't ready
  if (apiError) return <ErrorDisplay error={apiError} />;

  return (
    <div className={containerClasses} {...rest}>
      {/* Tenure Section */}
      <div className={sectionClasses}>
        <SectionTitle title="Tenure" />
        <div className={optionsContainerClasses}>
          {tenures.map((tenure) => (
            <button
              key={tenure.id}
              type="button"
              className={`${optionButtonBaseClasses} ${optionButtonStateClasses(tenure.id === selectedTenureId)}`}
              onClick={() => handleTenureSelect(tenure.id)}
              aria-pressed={tenure.id === selectedTenureId}
            >
              {tenure.name}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Section */}
      <div className={sectionClasses}>
        <ProviderSelector
          title="Provider"
          providers={providers}
          selectedProviderId={selectedProviderId}
          onSelect={handleProviderSelect}
          // Pass Tailwind classes via className prop if needed
          // className="..."
        />
      </div>

      {/* Core Insurance Coverage */}
      <div className={sectionClasses}>
        <SectionTitle title="Core Insurance Coverage" />
        {corePlans.map((insurance) => (
          <VariantCard
            key={insurance.id}
            title={insurance.title}
            subtitle={insurance.subtitle}
            description={insurance.description}
            pricePrefix=""
            price={insurance.price > 0 ? `₹${insurance.price.toLocaleString("en-IN")}` : ""}
            includedText={insurance.is_required ? "Mandatory" : (insurance.price <= 0 ? "Included" : "")}
            isSelected={selectedCoreInsuranceIds.includes(insurance.id)}
            onClick={() => handleCoreInsuranceSelect(insurance.id, !selectedCoreInsuranceIds.includes(insurance.id))}
            className={insurance.is_required ? 'opacity-80 cursor-default' : ''}
          />
        ))}
      </div>

      {/* Additional Coverage */}
      <div className={sectionClasses}>
        <SectionTitle title="Additional Coverage" />
        {additionalPlans.map((coverage) => (
          <VariantCard
            key={coverage.id}
            title={coverage.title}
            subtitle={coverage.subtitle}
            description={coverage.description}
            pricePrefix="+"
            price={coverage.price > 0 ? `₹${coverage.price.toLocaleString("en-IN")}` : ""}
            includedText={coverage.price <= 0 ? "Included" : ""}
            isSelected={selectedAdditionalCoverageIds.includes(coverage.id)}
            onClick={() => handleAdditionalCoverageSelect(coverage.id, !selectedAdditionalCoverageIds.includes(coverage.id))}
          />
        ))}
      </div>

      {/* Total Price Box */}
      <div className={totalPriceBoxClasses}>
        <div className={totalPriceFlexClasses}>
          <div className={totalPriceLabelClasses}>Total Insurance Coverage</div>
          <div className={totalPriceValueClasses}>
            ₹{calculateTotalPrice().toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <FormButtons
        onBack={onPreviousStep}
        onNext={onNextStep}
        nextButtonText="Continue to Financing"
        // Pass Tailwind classes via className prop if needed
        // className="..."
      />
    </div>
  );
}
