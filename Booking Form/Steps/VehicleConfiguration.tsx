import { addPropertyControls, ControlType } from "framer";
import { useState, useEffect } from "react";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";

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

    // Initial values
    location = "",
    selectedVehicle = "",
    selectedVariant = "",
    selectedColor = "",

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

  // Sample data
  const vehicles = [
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
  ];

  const variants = [
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
  ];

  const colors = [
    { id: "red", name: "Glossy Red", value: "#9B1C1C" },
    { id: "black", name: "Matte Black", value: "#1F2937" },
  ];

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

  // Input field styles
  const inputFieldStyle = {
    padding: tokens.spacing[4],
    borderRadius: tokens.borderRadius.DEFAULT,
    border: `1px solid ${borderColor}`,
    width: "100%",
    boxSizing: "border-box",
    fontSize: tokens.fontSize.base,
  };

  // Card styles for vehicles
  const vehicleCardStyle = (isSelected) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: tokens.spacing[5],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${isSelected ? primaryColor : borderColor}`,
    backgroundColor: "white",
    cursor: "pointer",
    marginBottom: tokens.spacing[4],
    boxShadow: isSelected ? `0 0 0 1px ${primaryColor}` : "none",
  });

  // Card styles for variants
  const variantCardStyle = (isSelected) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: tokens.spacing[5],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${isSelected ? primaryColor : borderColor}`,
    backgroundColor: "white",
    cursor: "pointer",
    marginBottom: tokens.spacing[4],
    boxShadow: isSelected ? `0 0 0 1px ${primaryColor}` : "none",
  });

  // Button style
  const buttonStyle = {
    backgroundColor: primaryColor,
    color: "white",
    padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    border: "none",
    cursor: isNextEnabled ? "pointer" : "not-allowed",
    opacity: isNextEnabled ? 1 : 0.7,
    width: "100%",
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  // Color selector styles
  const colorContainerStyle = {
    display: "flex",
    gap: tokens.spacing[4],
  };

  const colorItemStyle = (color, isSelected) => ({
    width: 50,
    height: 50,
    borderRadius: "50%",
    backgroundColor: color,
    cursor: "pointer",
    border: isSelected
      ? `2px solid ${primaryColor}`
      : `1px solid ${borderColor}`,
    boxShadow: isSelected ? `0 0 0 2px ${tokens.colors.blue[200]}` : "none",
  });

  return (
    <div style={containerStyle} {...rest}>
      {/* Location Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Location</div>
        <input
          type="text"
          placeholder="Area / Pincode"
          value={locationValue}
          onChange={(e) => handleLocationChange(e.target.value)}
          style={inputFieldStyle}
        />
        {errors.location && (
          <div
            style={{
              color: tokens.colors.red[600],
              fontSize: tokens.fontSize.xs,
              marginTop: tokens.spacing[1],
            }}
          >
            {errors.location}
          </div>
        )}
      </div>

      {/* Vehicle Selection Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Choose your Vehicle</div>
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            style={vehicleCardStyle(vehicle.id === vehicleValue)}
            onClick={() => handleVehicleSelect(vehicle.id)}
          >
            <img
              src={vehicle.image}
              alt={vehicle.name}
              style={{
                width: 80,
                height: 50,
                objectFit: "contain",
              }}
            />
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: tokens.fontSize.lg,
                  fontWeight: tokens.fontWeight.bold,
                  marginBottom: tokens.spacing[1],
                }}
              >
                {vehicle.name}
              </div>
              <div
                style={{
                  fontSize: tokens.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {vehicle.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Variant Selection Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Choose Variant</div>
        {variants.map((variant) => (
          <div
            key={variant.id}
            style={variantCardStyle(variant.id === variantValue)}
            onClick={() => handleVariantSelect(variant.id)}
          >
            <div>
              <div
                style={{
                  fontSize: tokens.fontSize.base,
                  fontWeight: tokens.fontWeight.semibold,
                  marginBottom: tokens.spacing[1],
                }}
              >
                {variant.title}
              </div>
              <div
                style={{
                  fontSize: tokens.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[1],
                }}
              >
                {variant.subtitle}
              </div>
              <div
                style={{
                  fontSize: tokens.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {variant.description}
              </div>
            </div>
            <div
              style={{
                fontWeight: tokens.fontWeight.semibold,
                fontSize: tokens.fontSize.sm,
              }}
            >
              {variant.price ? `+ ${variant.price}` : variant.includedText}
            </div>
          </div>
        ))}
      </div>

      {/* Color Selection Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Choose Color</div>
        <div style={colorContainerStyle}>
          {colors.map((color) => (
            <div
              key={color.id}
              style={colorItemStyle(color.value, color.id === colorValue)}
              onClick={() => handleColorSelect(color.id)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Optional Component Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Optional Component</div>
        <div
          style={{
            fontSize: tokens.fontSize.sm,
            color: tokens.colors.neutral[500],
          }}
        >
          (Optional components will be added here)
        </div>
      </div>

      {/* Next Button */}
      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={handleNext}
          disabled={!isNextEnabled}
        >
          <span>Select Insurance</span>
          <span>→</span>
        </button>
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
});
