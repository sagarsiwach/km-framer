// steps/VehicleConfigStep.jsx
import { useState, useEffect, useRef } from "react";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import useApiData from "../hooks/useApiData";
import useLocationSearch from "../hooks/useLocationSearch";
import { validateVehicleConfig } from "../utils/validation";

// Import Components
import { LocationField } from "../components/ui/LocationSearch";
import VehicleSelector from "../components/step-components/VehicleSelector";
import VariantSelector from "../components/step-components/VariantSelector";
import ColorPickerSection from "../components/step-components/ColorPickerSection";
import ComponentsSection from "../components/step-components/ComponentsSection";
import SectionTitle from "../components/form-sections/SectionTitle";
import FormButtons from "../components/form-sections/FormButtons";
import LoadingIndicator from "../components/form-sections/LoadingIndicator";
import ErrorDisplay from "../components/form-sections/ErrorDisplay";

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VehicleConfigStep(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],

    // API endpoint for data
    dataEndpoint = "https://booking-engine.sagarsiwach.workers.dev/",

    // Initial values
    location = "",
    selectedVehicleId = "",
    selectedVariantId = "",
    selectedColorId = "",
    selectedComponents = [],

    // Event handlers
    onNextStep,
    onFormDataChange,

    // Form validation
    errors = {},

    // Component styling
    style,
    ...rest
  } = props;

  // Use API data hook
  const {
    loading,
    error,
    data: vehicleData,
    retry,
    getVariantsForVehicle,
    getColorsForVehicle,
    getComponentsForVehicle
  } = useApiData(dataEndpoint);

  // Use location search hook
  const {
    location: locationValue,
    setLocation: setLocationValue,
    locationStatus,
    setLocationStatus,
    locationResults,
    setLocationResults,
    showLocationResults,
    setShowLocationResults,
    searchLocation,
    handleLocationSelect,
    getCurrentLocation,
    inputRef,
  } = useLocationSearch(vehicleData);

  // Local state for form fields
  const [vehicleValue, setVehicleValue] = useState(selectedVehicleId);
  const [variantValue, setVariantValue] = useState(selectedVariantId);
  const [colorValue, setColorValue] = useState(selectedColorId);
  const [componentValues, setComponentValues] = useState(selectedComponents);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [activeSection, setActiveSection] = useState("location");

  // Local state for validation
  const [validationErrors, setValidationErrors] = useState(errors);

  // Set location from props
  useEffect(() => {
    if (location && location !== locationValue) {
      setLocationValue(location);
    }
  }, [location]);

  // Handle initial field values
  useEffect(() => {
    if (selectedVehicleId && selectedVehicleId !== vehicleValue) {
      setVehicleValue(selectedVehicleId);
    }

    if (selectedVariantId && selectedVariantId !== variantValue) {
      setVariantValue(selectedVariantId);
    }

    if (selectedColorId && selectedColorId !== colorValue) {
      setColorValue(selectedColorId);
    }

    if (selectedComponents && JSON.stringify(selectedComponents) !== JSON.stringify(componentValues)) {
      setComponentValues(selectedComponents);
    }
  }, [selectedVehicleId, selectedVariantId, selectedColorId, selectedComponents]);

  // Set default selections when data loads
  useEffect(() => {
    if (vehicleData) {
      // If no vehicle is selected but we have vehicles, select the first one
      if (!vehicleValue && vehicleData.models && vehicleData.models.length > 0) {
        const firstVehicle = vehicleData.models[0];
        setVehicleValue(firstVehicle.id);
        notifyChange('selectedVehicle', firstVehicle.id);
      }

      // If vehicle selected but no variant, select the first/default variant
      if (vehicleValue) {
        const variants = getVariantsForVehicle(vehicleValue);
        if (!variantValue && variants.length > 0) {
          // Find default variant if available
          const defaultVariant = variants.find(v => v.is_default) || variants[0];
          setVariantValue(defaultVariant.id);
          notifyChange('selectedVariant', defaultVariant.id);
        }

        // If vehicle selected but no color, select the first/default color
        const colors = getColorsForVehicle(vehicleValue);
        if (!colorValue && colors.length > 0) {
          // Find default color if available
          const defaultColor = colors.find(c => c.is_default) || colors[0];
          setColorValue(defaultColor.id);
          notifyChange('selectedColor', defaultColor.id);
        }

        // Set required components
        const components = getComponentsForVehicle(vehicleValue);
        if (components.length > 0) {
          const requiredComponents = components
            .filter(comp => comp.is_required)
            .map(comp => comp.id);

          if (requiredComponents.length > 0) {
            // Only add required components that aren't already selected
            const newComponents = [...componentValues];
            let changed = false;

            requiredComponents.forEach(compId => {
              if (!componentValues.includes(compId)) {
                newComponents.push(compId);
                changed = true;
              }
            });

            if (changed) {
              setComponentValues(newComponents);
              notifyChange('optionalComponents', newComponents);
            }
          }
        }
      }
    }
  }, [vehicleData, vehicleValue]);

  // Notify parent of changes
  const notifyChange = (field, value) => {
    const formData = {
      location: field === 'location' ? value : locationValue,
      vehicle: field === 'selectedVehicle' ? value : vehicleValue,
      variant: field === 'selectedVariant' ? value : variantValue,
      color: field === 'selectedColor' ? value : colorValue,
      components: field === 'optionalComponents' ? value : componentValues,
    };

    if (onFormDataChange) {
      onFormDataChange(formData);
    }

    // Clear validation error when field changes
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle location change
  const handleLocationChange = (value) => {
    if (typeof value === 'object' && value.target) {
      setLocationValue(value.target.value);
      notifyChange('location', value.target.value);
    } else {
      setLocationValue(value);
      notifyChange('location', value);
    }

    // Automatically advance to next section when location is set
    if (value && typeof value === 'string' && value.length > 0) {
      setTimeout(() => {
        setActiveSection('vehicle');
      }, 500);
    }
  };

  // Handle vehicle selection
  const handleVehicleSelect = (id) => {
    setVehicleValue(id);
    notifyChange('selectedVehicle', id);

    // Reset dependent selections
    setVariantValue('');
    setColorValue('');
    setComponentValues([]);
    notifyChange('selectedVariant', '');
    notifyChange('selectedColor', '');
    notifyChange('optionalComponents', []);

    // Advance to variant section
    setTimeout(() => {
      setActiveSection('variant');
    }, 300);
  };

  // Handle variant selection
  const handleVariantSelect = (id) => {
    setVariantValue(id);
    notifyChange('selectedVariant', id);

    // Advance to color section
    setTimeout(() => {
      setActiveSection('color');
    }, 300);
  };

  // Handle color selection
  const handleColorSelect = (id) => {
    setColorValue(id);
    notifyChange('selectedColor', id);

    // Advance to components section
    setTimeout(() => {
      setActiveSection('components');
    }, 300);
  };

  // Handle component selection
  const handleComponentSelect = (id, isSelected) => {
    if (!vehicleData) return;

    // Get the component item
    const components = getComponentsForVehicle(vehicleValue);
    const componentItem = components.find(item => item.id === id);

    // If required, don't allow deselection
    if (componentItem && componentItem.is_required && !isSelected) {
      return;
    }

    let newComponents;
    if (isSelected) {
      newComponents = [...componentValues, id];
    } else {
      newComponents = componentValues.filter(cId => cId !== id);
    }

    setComponentValues(newComponents);
    notifyChange('optionalComponents', newComponents);
  };

  // Handle next button click
  const handleNext = () => {
    setSubmitted(true);

    // Validation
    const formData = {
      location: locationValue,
      selectedVehicle: vehicleValue,
      selectedVariant: variantValue,
      selectedColor: colorValue,
    };

    const errors = validateVehicleConfig(formData);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      // All validated, continue to next step
      if (onNextStep) onNextStep();
    } else {
      // Scroll to the first field with an error
      if (errors.location) {
        setActiveSection('location');
      } else if (errors.selectedVehicle) {
        setActiveSection('vehicle');
      } else if (errors.selectedVariant) {
        setActiveSection('variant');
      } else if (errors.selectedColor) {
        setActiveSection('color');
      }
    }
  };

  // Container styling
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflow: "auto",
    paddingBottom: "80px", // Space for next button
    ...style,
  };

  const sectionStyle = {
    marginBottom: tokens.spacing[8],
  };

  const buttonContainerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing[4],
    backgroundColor: "white",
    borderTop: `1px solid ${borderColor}`,
    zIndex: 100,
    width: "100%",
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <LoadingIndicator
          text="Loading vehicle information..."
          size="large"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle}>
        <ErrorDisplay
          error={error}
          showRetry={true}
          onRetry={retry}
        />
      </div>
    );
  }

  // Get data for selectors
  const vehicles = vehicleData?.models || [];
  const variants = vehicleValue ? getVariantsForVehicle(vehicleValue) : [];
  const colors = vehicleValue ? getColorsForVehicle(vehicleValue) : [];
  const components = vehicleValue ? getComponentsForVehicle(vehicleValue) : [];

  // Determine if next button should be enabled
  const isNextEnabled = locationValue && vehicleValue && variantValue && colorValue;

  return (
    <div style={containerStyle} {...rest}>
      {/* Location Section */}
      <div style={{
        ...sectionStyle,
        display: activeSection === 'location' ? 'block' : 'none',
      }}>
        <SectionTitle title="LOCATION" />
        <LocationField
          value={locationValue}
          onChange={handleLocationChange}
          onFocus={() => {
            setFocusedField("location");
            setActiveSection("location");
          }}
          onBlur={() => setFocusedField(null)}
          error={submitted && validationErrors.location || ""}
          showError={submitted && !!validationErrors.location}
          focusedField={focusedField}
          inputRef={inputRef}
          locationStatus={locationStatus}
          setLocationStatus={setLocationStatus}
          setLocationResults={setLocationResults}
          setShowLocationResults={setShowLocationResults}
          searchLocation={searchLocation}
          getCurrentLocation={getCurrentLocation}
          enableLocationServices={true}
        />
      </div>

      {/* Vehicle Selection Section */}
      <div style={{
        ...sectionStyle,
        display: activeSection === 'vehicle' ? 'block' : 'none',
      }}>
        <VehicleSelector
          title="CHOOSE YOUR VEHICLE"
          vehicles={vehicles}
          selectedVehicleId={vehicleValue}
          onSelect={handleVehicleSelect}
          borderColor={borderColor}
          selectedBorderColor={primaryColor}
        />
      </div>

      {/* Variant Selection Section */}
      <div style={{
        ...sectionStyle,
        display: activeSection === 'variant' ? 'block' : 'none',
      }}>
        <VariantSelector
          title="CHOOSE VARIANT"
          variants={variants}
          selectedVariantId={variantValue}
          onSelect={handleVariantSelect}
          borderColor={borderColor}
          selectedBorderColor={primaryColor}
        />
      </div>

      {/* Color Selection Section */}
      <div style={{
        ...sectionStyle,
        display: activeSection === 'color' ? 'block' : 'none',
      }}>
        <ColorPickerSection
          title="FINISH"
          colors={colors}
          selectedColorId={colorValue}
          on
