// VehicleConfiguration.tsx
// Updated to fetch real data from the API

import { addPropertyControls, ControlType } from "framer";
import { useState, useEffect } from "react";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import InputField from "https://framer.com/m/InputField-d7w7.js";
import VehicleCards from "https://framer.com/m/VehicleCards-mBlt.js";
import Button from "https://framer.com/m/Button-SLtw.js";
import VariantCard from "https://framer.com/m/VariantCard-5sVx.js";
import ColorSelector from "https://framer.com/m/ColorSelector-jPny.js";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function VehicleConfiguration(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    borderColor = tokens.colors.neutral[200],

    // API endpoint for data
    dataEndpoint = "https://automation.unipack.asia/webhook/kabiramobility/booking/api/vehicle-data/?type=all",

    // Initial values
    location = "",
    selectedVehicleId = "",
    selectedVariantId = "",
    selectedColorId = "",
    selectedComponents = [],

    // Event handlers
    onNextStep,
    onLocationChange,
    onVehicleSelect,
    onVariantSelect,
    onColorSelect,
    onComponentSelect,
    onFormDataChange,

    // Form validation
    errors = {},

    // Component styling
    style,
    ...rest
  } = props;

  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationValue, setLocationValue] = useState(location);
  const [vehicleValue, setVehicleValue] = useState(selectedVehicleId);
  const [variantValue, setVariantValue] = useState(selectedVariantId);
  const [colorValue, setColorValue] = useState(selectedColorId);
  const [componentValues, setComponentValues] = useState(selectedComponents);
  const [vehicles, setVehicles] = useState([]);
  const [pricingData, setPricingData] = useState({});

  // Get the currently selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.id === vehicleValue) || null;

  // Fetch vehicle data on mount
  useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch vehicle data
        const response = await fetch(dataEndpoint);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.success && result.data) {
          setVehicles(result.data);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error("Error fetching vehicle data:", err);
        setError("Failed to load vehicle data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch pricing data separately
    const fetchPricingData = async () => {
      try {
        const response = await fetch(
          `${dataEndpoint.split("?")[0]}?type=pricing`,
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.success && result.data) {
          setPricingData(result.data);
        }
      } catch (err) {
        console.error("Error fetching pricing data:", err);
      }
    };

    fetchVehicleData();
    fetchPricingData();
  }, [dataEndpoint]);

  // Set default selection when vehicles load or change
  useEffect(() => {
    // If no vehicle is selected but we have vehicles, select the first one
    if (!vehicleValue && vehicles.length > 0) {
      setVehicleValue(vehicles[0].id);

      // Also notify parent component
      if (onVehicleSelect) {
        onVehicleSelect(vehicles[0].id);
      }
    }

    // If we have a vehicle selected but no variant, select the first variant
    if (
      vehicleValue &&
      !variantValue &&
      selectedVehicle?.variants?.length > 0
    ) {
      setVariantValue(selectedVehicle.variants[0].id);
      if (onVariantSelect) onVariantSelect(selectedVehicle.variants[0].id);
    }

    // If we have a vehicle selected but no color, select the first color
    if (vehicleValue && !colorValue && selectedVehicle?.colors?.length > 0) {
      setColorValue(selectedVehicle.colors[0].id);
      if (onColorSelect) onColorSelect(selectedVehicle.colors[0].id);
    }
  }, [vehicles, vehicleValue, selectedVehicle]);

  // Update form data on any field change
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        location: locationValue,
        vehicle: vehicleValue,
        variant: variantValue,
        color: colorValue,
        components: componentValues,
      });
    }
  }, [locationValue, vehicleValue, variantValue, colorValue, componentValues]);

  // Handle location input change
  const handleLocationChange = (value) => {
    setLocationValue(value);
    if (onLocationChange) onLocationChange(value);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (id) => {
    setVehicleValue(id);

    // Reset dependent selections when vehicle changes
    setVariantValue("");
    setColorValue("");
    setComponentValues([]);

    if (onVehicleSelect) onVehicleSelect(id);
  };

  // Handle variant selection
  const handleVariantSelect = (id) => {
    setVariantValue(id);
    if (onVariantSelect) onVariantSelect(id);
  };

  // Handle color selection
  const handleColorSelect = (id) => {
    setColorValue(id);
    if (onColorSelect) onColorSelect(id);
  };

  // Handle component selection
  const handleComponentSelect = (id, isSelected) => {
    // Get the component item
    const componentItem = selectedVehicle?.optionalComponents.find(
      (item) => item.id === id,
    );

    // If required, don't allow deselection
    if (componentItem && componentItem.required && !isSelected) {
      return;
    }

    let newComponents;

    if (isSelected) {
      newComponents = [...componentValues, id];
    } else {
      newComponents = componentValues.filter((cId) => cId !== id);
    }

    setComponentValues(newComponents);
    if (onComponentSelect) onComponentSelect(newComponents);
  };

  // Get price for a vehicle
  const getVehiclePrice = (vehicleId) => {
    if (!pricingData || !pricingData.summary) return null;

    // Extract model code from vehicle ID (assuming formats like B10, B20)
    const modelCode = vehicleId;

    // Find matching price
    const pricing = pricingData.summary.find((p) => p.modelCode === modelCode);
    return pricing ? pricing.formattedPrice : null;
  };

  // Handle next button click
  const handleNext = () => {
    // Additional validation could be done here
    if (onNextStep) onNextStep();
  };

  // Container styling
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

  const buttonContainerStyle = {
    marginTop: tokens.spacing[8],
  };

  // Determine if next button should be enabled
  const isNextEnabled =
    locationValue && vehicleValue && variantValue && colorValue;

  // Ensure required components are selected
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.optionalComponents) {
      const requiredComponents = selectedVehicle.optionalComponents
        .filter((comp) => comp.required)
        .map((comp) => comp.id);

      // Add any missing required components
      if (requiredComponents.length > 0) {
        const newComponents = [...componentValues];
        let changed = false;

        requiredComponents.forEach((compId) => {
          if (!componentValues.includes(compId)) {
            newComponents.push(compId);
            changed = true;
          }
        });

        if (changed) {
          setComponentValues(newComponents);
        }
      }
    }
  }, [selectedVehicle, componentValues]);

  // Loading state display
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: tokens.spacing[8] }}>
          Loading vehicle information...
        </div>
      </div>
    );
  }

  // Error state display
  if (error) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            padding: tokens.spacing[4],
            marginBottom: tokens.spacing[4],
            backgroundColor: tokens.colors.red[50],
            color: tokens.colors.red[700],
            borderRadius: tokens.borderRadius.DEFAULT,
            fontSize: tokens.fontSize.sm,
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
      {/* Location Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Location</div>
        <InputField
          label=""
          placeholder="Area / Pincode"
          value={locationValue}
          onChange={handleLocationChange}
          error={errors.location || ""}
          required={true}
          borderColor={borderColor}
          focusBorderColor={primaryColor}
          errorBorderColor={tokens.colors.red[600]}
        />
      </div>

      {/* Vehicle Selection Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Choose your Vehicle</div>
        {vehicles.map((vehicle) => (
          <VehicleCards
            key={vehicle.id}
            vehicleName={vehicle.name}
            vehicleImage={vehicle.image}
            price={getVehiclePrice(vehicle.id) || vehicle.price}
            isSelected={vehicle.id === vehicleValue}
            onClick={() => handleVehicleSelect(vehicle.id)}
            borderColor={borderColor}
            selectedBorderColor={primaryColor}
          />
        ))}
      </div>

      {/* Variant Selection Section - only show if a vehicle is selected */}
      {selectedVehicle && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Choose Variant</div>
          {selectedVehicle.variants.map((variant) => (
            <VariantCard
              key={variant.id}
              title={variant.title}
              subtitle={variant.subtitle}
              description={variant.description}
              price={
                variant.priceAddition > 0
                  ? `₹${variant.priceAddition.toLocaleString("en-IN")}`
                  : ""
              }
              includedText={variant.includedText}
              isSelected={variant.id === variantValue}
              onClick={() => handleVariantSelect(variant.id)}
              borderColor={borderColor}
              selectedBorderColor={primaryColor}
            />
          ))}
        </div>
      )}

      {/* Color Selection Section - only show if a vehicle is selected */}
      {selectedVehicle &&
        selectedVehicle.colors &&
        selectedVehicle.colors.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Choose Color</div>
            <ColorSelector
              colors={selectedVehicle.colors}
              selectedColorId={colorValue}
              onChange={handleColorSelect}
            />
          </div>
        )}

      {/* Optional Components Section - only show if a vehicle is selected */}
      {selectedVehicle &&
        selectedVehicle.optionalComponents &&
        selectedVehicle.optionalComponents.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Optional Component</div>
            {selectedVehicle.optionalComponents.map((component) => (
              <VariantCard
                key={component.id}
                title={component.title}
                subtitle={component.subtitle}
                price={
                  component.priceAddition > 0
                    ? `₹${component.priceAddition.toLocaleString("en-IN")}`
                    : ""
                }
                includedText={
                  component.includedText ||
                  (component.required ? "Mandatory" : "")
                }
                isSelected={componentValues.includes(component.id)}
                onClick={() => {
                  handleComponentSelect(
                    component.id,
                    !componentValues.includes(component.id),
                  );
                }}
                borderColor={borderColor}
                selectedBorderColor={primaryColor}
                style={{
                  opacity: component.required ? 0.8 : 1,
                }}
              />
            ))}
          </div>
        )}

      {/* Next Button */}
      <div style={buttonContainerStyle}>
        <Button
          text="Select Insurance"
          rightIcon={true}
          onClick={handleNext}
          disabled={!isNextEnabled}
          primaryColor={primaryColor}
          variant="primary"
        />
      </div>
    </div>
  );
}

addPropertyControls(VehicleConfiguration, {
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
    defaultValue: "https://your-n8n-endpoint.com/vehicle-data?type=all",
  },
  location: {
    type: ControlType.String,
    title: "Location",
    defaultValue: "",
  },
  selectedVehicleId: {
    type: ControlType.String,
    title: "Selected Vehicle",
    defaultValue: "",
  },
  selectedVariantId: {
    type: ControlType.String,
    title: "Selected Variant",
    defaultValue: "",
  },
  selectedColorId: {
    type: ControlType.String,
    title: "Selected Color",
    defaultValue: "",
  },
  selectedComponents: {
    type: ControlType.Array,
    title: "Selected Components",
    control: { type: ControlType.String },
    defaultValue: [],
  },
  errors: {
    type: ControlType.Object,
    title: "Errors",
    defaultValue: {},
  },
});
