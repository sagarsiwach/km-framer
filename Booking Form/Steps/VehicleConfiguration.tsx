import { addPropertyControls, ControlType } from "framer";
import { useState, useEffect } from "react";
import Tokens from "https://framer.com/m/Design-tokens-UkAP.js";
import Button from "https://framer.com/m/Button-SLtw.js";
import InputField from "https://framer.com/m/InputField-d7w7.js";
import VehicleCards from "https://framer.com/m/VehicleCards-mBlt.js";
import VariantCard from "https://framer.com/m/VariantCard-5sVx.js";
import ColorSelector from "https://framer.com/m/ColorSelector-jPny.js";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function VehicleConfiguration(props) {
  const {
    // Customization options
    primaryColor = Tokens.colors.blue[600],
    backgroundColor = Tokens.colors.neutral[50],
    borderColor = Tokens.colors.neutral[200],

    // Initial values
    location = "",
    selectedVehicle = "",
    selectedVariant = "",
    selectedColor = "",

    // Component data
    vehicles = [
      {
        id: "km3000",
        name: "KM3000",
        price: "₹1.9 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "km4000",
        name: "KM4000",
        price: "₹2.6 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "km5000",
        name: "KM5000",
        price: "₹3.2 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "intercity350",
        name: "Intercity 350",
        price: "₹3.1 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "hermes75",
        name: "Hermes 75",
        price: "₹1.6 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
    ],

    variants = [
      {
        id: "standard",
        title: "Standard Variant",
        subtitle: "5.1h kWh Battery Pack",
        description: "250km Range (IDC)",
        price: "",
        includedText: "Included",
      },
      {
        id: "long-range",
        title: "Long Range Variant",
        subtitle: "5.1h kWh Battery Pack",
        description: "325km Range (IDC)",
        price: "₹15,500",
        includedText: "",
      },
    ],

    colors = [
      { id: "red", name: "Glossy Red", value: "#9B1C1C" },
      { id: "black", name: "Matte Black", value: "#1F2937" },
    ],

    // Event handlers
    onNextStep,
    onLocationChange,
    onVehicleSelect,
    onVariantSelect,
    onColorSelect,

    // Form validation
    errors = {},

    // Component styling
    style,
    ...rest
  } = props;

  // Local state for form inputs
  const [locationValue, setLocationValue] = useState(location);
  const [vehicleValue, setVehicleValue] = useState(selectedVehicle);
  const [variantValue, setVariantValue] = useState(selectedVariant);
  const [colorValue, setColorValue] = useState(selectedColor);

  // Update local state when props change
  useEffect(() => {
    setLocationValue(location);
    setVehicleValue(selectedVehicle);
    setVariantValue(selectedVariant);
    setColorValue(selectedColor);
  }, [location, selectedVehicle, selectedVariant, selectedColor]);

  // Handle location input change
  const handleLocationChange = (value) => {
    setLocationValue(value);
    if (onLocationChange) onLocationChange(value);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (id) => {
    setVehicleValue(id);
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

  // Handle next button click
  const handleNext = () => {
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
    marginBottom: Tokens.spacing[6],
  };

  const sectionTitleStyle = {
    fontSize: Tokens.fontSize.sm,
    fontWeight: Tokens.fontWeight.medium,
    color: Tokens.colors.neutral[600],
    textTransform: "uppercase",
    marginBottom: Tokens.spacing[3],
  };

  const buttonContainerStyle = {
    marginTop: Tokens.spacing[8],
  };

  // Determine if next button should be enabled
  const isNextEnabled =
    locationValue && vehicleValue && variantValue && colorValue;

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
          error={errors.location}
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
          />
        ))}
      </div>

      {/* Variant Selection Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Choose Variant</div>
        {variants.map((variant) => (
          <VariantCard
            key={variant.id}
            title={variant.title}
            subtitle={variant.subtitle}
            description={variant.description}
            price={variant.price}
            includedText={variant.includedText}
            isSelected={variant.id === variantValue}
            onClick={() => handleVariantSelect(variant.id)}
          />
        ))}
      </div>

      {/* Color Selection Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Choose Color</div>
        <ColorSelector
          label=""
          colors={colors}
          selectedColorId={colorValue}
          onChange={handleColorSelect}
        />
      </div>

      {/* Accessories Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Optional Component</div>
        {/* Accessories components would go here */}
        {/* This would be similar to the variant cards but with checkboxes */}
      </div>

      {/* Next Button */}
      <div style={buttonContainerStyle}>
        <Button
          text="Select Insurance"
          rightIcon="→"
          primaryColor={primaryColor}
          disabled={!isNextEnabled}
          onClick={handleNext}
        />
      </div>
    </div>
  );
}

addPropertyControls(VehicleConfiguration, {
  primaryColor: {
    type: ControlType.Color,
    title: "Primary Color",
    defaultValue: Tokens.colors.blue[600],
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background Color",
    defaultValue: Tokens.colors.neutral[50],
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: Tokens.colors.neutral[200],
  },
  location: {
    type: ControlType.String,
    title: "Location",
    defaultValue: "",
  },
  selectedVehicle: {
    type: ControlType.String,
    title: "Selected Vehicle",
    defaultValue: "",
  },
  selectedVariant: {
    type: ControlType.String,
    title: "Selected Variant",
    defaultValue: "",
  },
  selectedColor: {
    type: ControlType.String,
    title: "Selected Color",
    defaultValue: "",
  },
  vehicles: {
    type: ControlType.Array,
    title: "Vehicles",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        name: { type: ControlType.String },
        price: { type: ControlType.String },
        image: { type: ControlType.Image },
      },
    },
    defaultValue: [
      {
        id: "km3000",
        name: "KM3000",
        price: "₹1.9 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "km4000",
        name: "KM4000",
        price: "₹2.6 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "km5000",
        name: "KM5000",
        price: "₹3.2 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "intercity350",
        name: "Intercity 350",
        price: "₹3.1 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
      {
        id: "hermes75",
        name: "Hermes 75",
        price: "₹1.6 Lakhs",
        image:
          "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
      },
    ],
  },
  variants: {
    type: ControlType.Array,
    title: "Variants",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        title: { type: ControlType.String },
        subtitle: { type: ControlType.String },
        description: { type: ControlType.String },
        price: { type: ControlType.String },
        includedText: { type: ControlType.String },
      },
    },
    defaultValue: [
      {
        id: "standard",
        title: "Standard Variant",
        subtitle: "5.1h kWh Battery Pack",
        description: "250km Range (IDC)",
        price: "",
        includedText: "Included",
      },
      {
        id: "long-range",
        title: "Long Range Variant",
        subtitle: "5.1h kWh Battery Pack",
        description: "325km Range (IDC)",
        price: "₹15,500",
        includedText: "",
      },
    ],
  },
  colors: {
    type: ControlType.Array,
    title: "Colors",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        name: { type: ControlType.String },
        value: { type: ControlType.Color },
      },
    },
    defaultValue: [
      { id: "red", name: "Glossy Red", value: "#9B1C1C" },
      { id: "black", name: "Matte Black", value: "#1F2937" },
    ],
  },
  errors: {
    type: ControlType.Object,
    title: "Errors",
    controls: {
      location: { type: ControlType.String },
      vehicle: { type: ControlType.String },
      variant: { type: ControlType.String },
      color: { type: ControlType.String },
    },
    defaultValue: {},
  },
});
