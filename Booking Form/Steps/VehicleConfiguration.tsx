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
    dataEndpoint = "",

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

  // Fallback vehicle data for when no endpoint is provided
  const [vehicles, setVehicles] = useState([
    {
      id: "km3000",
      name: "KM3000",
      price: "₹1.9 Lakhs",
      image:
        "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      variants: [
        {
          id: "standard",
          title: "Standard Variant",
          subtitle: "5.1h kWh Battery Pack",
          description: "250km Range (IDC)",
          priceAddition: 0,
          includedText: "Included",
        },
        {
          id: "long-range",
          title: "Long Range Variant",
          subtitle: "5.1h kWh Battery Pack",
          description: "325km Range (IDC)",
          priceAddition: 15500,
          includedText: "",
        },
      ],
      colors: [
        { id: "red", name: "Glossy Red", value: "#9B1C1C" },
        { id: "black", name: "Matte Black", value: "#1F2937" },
      ],
      optionalComponents: [
        {
          id: "helmet",
          title: "Helmet",
          subtitle: "Protection",
          required: true,
          priceAddition: 0,
          includedText: "Mandatory",
        },
        {
          id: "saree-guard",
          title: "Saree Guard",
          subtitle: "Protection",
          required: false,
          priceAddition: 700,
          includedText: "",
        },
        {
          id: "smart-connectivity",
          title: "Smart Connectivity Package",
          subtitle: "GPS and App Integration",
          required: false,
          priceAddition: 7000,
          includedText: "",
        },
        {
          id: "off-road",
          title: "Off-Road Package",
          subtitle: "Fat Wheels + Mud Guards",
          required: false,
          priceAddition: 11999,
          includedText: "",
        },
      ],
    },
    {
      id: "km4000",
      name: "KM4000",
      price: "₹2.6 Lakhs",
      image:
        "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      variants: [
        {
          id: "standard",
          title: "Standard Variant",
          subtitle: "6.2h kWh Battery Pack",
          description: "300km Range (IDC)",
          priceAddition: 0,
          includedText: "Included",
        },
        {
          id: "long-range",
          title: "Long Range Variant",
          subtitle: "6.2h kWh Battery Pack",
          description: "380km Range (IDC)",
          priceAddition: 18500,
          includedText: "",
        },
      ],
      colors: [
        { id: "red", name: "Glossy Red", value: "#9B1C1C" },
        { id: "black", name: "Matte Black", value: "#1F2937" },
        { id: "blue", name: "Ocean Blue", value: "#1E3A8A" },
      ],
      optionalComponents: [
        {
          id: "helmet",
          title: "Helmet",
          subtitle: "Protection",
          required: true,
          priceAddition: 0,
          includedText: "Mandatory",
        },
        {
          id: "saree-guard",
          title: "Saree Guard",
          subtitle: "Protection",
          required: false,
          priceAddition: 700,
          includedText: "",
        },
      ],
    },
    {
      id: "km5000",
      name: "KM5000",
      price: "₹3.2 Lakhs",
      image:
        "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      variants: [
        {
          id: "standard",
          title: "Standard Variant",
          subtitle: "7.0h kWh Battery Pack",
          description: "350km Range (IDC)",
          priceAddition: 0,
          includedText: "Included",
        },
      ],
      colors: [
        { id: "black", name: "Matte Black", value: "#1F2937" },
        { id: "silver", name: "Silver Chrome", value: "#A3A3A3" },
      ],
      optionalComponents: [
        {
          id: "helmet",
          title: "Helmet",
          subtitle: "Protection",
          required: true,
          priceAddition: 0,
          includedText: "Mandatory",
        },
      ],
    },
    {
      id: "intercity350",
      name: "Intercity 350",
      price: "₹3.1 Lakhs",
      image:
        "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      variants: [
        {
          id: "standard",
          title: "Standard Variant",
          subtitle: "6.8h kWh Battery Pack",
          description: "320km Range (IDC)",
          priceAddition: 0,
          includedText: "Included",
        },
      ],
      colors: [
        { id: "black", name: "Matte Black", value: "#1F2937" },
        { id: "gray", name: "Slate Gray", value: "#4B5563" },
      ],
      optionalComponents: [
        {
          id: "helmet",
          title: "Helmet",
          subtitle: "Protection",
          required: true,
          priceAddition: 0,
          includedText: "Mandatory",
        },
      ],
    },
    {
      id: "hermes75",
      name: "Hermes 75",
      price: "₹1.6 Lakhs",
      image:
        "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      variants: [
        {
          id: "standard",
          title: "Standard Variant",
          subtitle: "4.2h kWh Battery Pack",
          description: "180km Range (IDC)",
          priceAddition: 0,
          includedText: "Included",
        },
      ],
      colors: [
        { id: "white", name: "Pearl White", value: "#FFFFFF" },
        { id: "black", name: "Matte Black", value: "#1F2937" },
        { id: "red", name: "Glossy Red", value: "#9B1C1C" },
      ],
      optionalComponents: [
        {
          id: "helmet",
          title: "Helmet",
          subtitle: "Protection",
          required: true,
          priceAddition: 0,
          includedText: "Mandatory",
        },
      ],
    },
  ]);

  // Get the currently selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.id === vehicleValue) || null;

  // Fetch data on mount if endpoint provided
  useEffect(() => {
    if (!dataEndpoint) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(dataEndpoint);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.vehicles) {
          setVehicles(data.vehicles);
        }
      } catch (err) {
        console.error("Error fetching vehicle data:", err);
        setError("Failed to load vehicle data. Using default data instead.");
        // Continue with default data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
  }, [vehicles, vehicleValue]);

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

  // Display error notice if there was a loading error
  const ErrorNotice = () => (
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
    </div>
  );

  return (
    <div style={containerStyle} {...rest}>
      {/* Error notice if needed */}
      {error && <ErrorNotice />}

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
            price={vehicle.price}
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
      {selectedVehicle && (
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
      {selectedVehicle && selectedVehicle.optionalComponents && (
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
              includedText={component.required ? "Mandatory" : ""}
              isSelected={componentValues.includes(component.id)}
              onClick={() => {
                handleComponentSelect(
                  component.id,
                  !componentValues.includes(component.id),
                );
              }}
              borderColor={borderColor}
              selectedBorderColor={primaryColor}
              style={{ opacity: component.required ? 0.8 : 1 }}
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
    defaultValue: "",
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
