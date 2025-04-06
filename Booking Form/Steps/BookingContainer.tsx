import { addPropertyControls, ControlType } from "framer";
import { useState } from "react";
import VehicleConfiguration from "https://framer.com/m/VehicleConfiguration-cIRx.js@TCZgNcXKLzOU7iutQ49s";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js@bzdIZqhHc2iTYzb4LFjz";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function BookingContainer(props) {
  const {
    initialStep = 1,
    primaryColor = tokens.colors.blue[600],
    backgroundColor = tokens.colors.neutral[50],
    headingText = "Book your Ride",
    subHeadingText = "Configure your Vehicle",
    descriptionText = "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.",
    productImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
    style,
    ...rest
  } = props;

  // State management
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    location: "",
    selectedVehicle: "km3000", // Default to KM3000
    selectedVariant: "",
    selectedColor: "",
    optionalComponents: [],
  });
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error for the field when changed
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Handle next step
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  // Main container style - modified to 70/30 split
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100%",
    fontFamily: tokens.fontFamily.sans,
    ...style,
  };

  // Left side with image - now 70%
  const imageContainerStyle = {
    flex: "7", // 70% of available space
    backgroundColor: "#CCCCCC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  };

  // Right side with form - now 30%
  const formContainerStyle = {
    flex: "3", // 30% of available space
    backgroundColor: backgroundColor,
    padding: tokens.spacing[4], // Reduced padding to fit smaller space
    overflowY: "auto",
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginBottom: tokens.spacing[4], // Reduced margin
  };

  const tagStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[500],
    marginBottom: tokens.spacing[1], // Reduced margin
  };

  const headingStyle = {
    fontSize: tokens.fontSize["2xl"], // Reduced size
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing[1], // Reduced margin
    margin: 0,
  };

  const subheadingStyle = {
    fontSize: tokens.fontSize.sm, // Reduced size
    lineHeight: tokens.lineHeight.relaxed,
    color: tokens.colors.neutral[600],
    marginBottom: tokens.spacing[0],
  };

  const dividerStyle = {
    height: 1,
    backgroundColor: tokens.colors.neutral[200],
    marginTop: tokens.spacing[4], // Reduced margin
    marginBottom: tokens.spacing[4], // Reduced margin
  };

  const contentStyle = {
    flex: 1,
  };

  const zeroStyle = {
    position: "absolute",
    fontSize: "200px",
    fontWeight: "bold",
    color: "white",
    opacity: 0.5,
    zIndex: 1,
  };

  return (
    <div style={containerStyle} {...rest}>
      {/* Left side - Product Image (now 70%) */}
      <div style={imageContainerStyle}>
        <div style={zeroStyle}>0</div>
        <img
          src={productImage}
          alt="Kabira Mobility Bike"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Right side - Form Content (now 30%) */}
      <div style={formContainerStyle}>
        <div style={headerStyle}>
          <div style={tagStyle}>Book your Ride</div>
          <h1 style={headingStyle}>{subHeadingText}</h1>
          <p style={subheadingStyle}>{descriptionText}</p>
          <div style={dividerStyle} />
        </div>

        <div style={contentStyle}>
          <VehicleConfiguration
            location={formData.location}
            selectedVehicle={formData.selectedVehicle}
            selectedVariant={formData.selectedVariant}
            selectedColor={formData.selectedColor}
            onLocationChange={(value) => handleChange("location", value)}
            onVehicleSelect={(value) => handleChange("selectedVehicle", value)}
            onVariantSelect={(value) => handleChange("selectedVariant", value)}
            onColorSelect={(value) => handleChange("selectedColor", value)}
            onNextStep={handleNextStep}
            errors={errors}
            primaryColor={primaryColor}
            compact={true} // Assuming VehicleConfiguration has a compact mode
          />
        </div>

        {/* Product summary at bottom (for KM3000) - with reduced text sizes */}
        {formData.selectedVehicle === "km3000" && (
          <div
            style={{
              marginTop: tokens.spacing[4], // Reduced margin
              borderTop: `1px solid ${tokens.colors.neutral[200]}`,
              paddingTop: tokens.spacing[3], // Reduced padding
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: tokens.spacing[1], // Reduced margin
              }}
            >
              <div
                style={{
                  fontSize: tokens.fontSize.xl, // Reduced size
                  fontWeight: tokens.fontWeight.bold,
                }}
              >
                KM3000
              </div>
              <div
                style={{
                  fontSize: tokens.fontSize.xs, // Reduced size
                  color: tokens.colors.neutral[600],
                }}
              >
                B18-0001
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: tokens.spacing[2], // Reduced margin
              }}
            >
              <div>
                <div style={{ fontSize: tokens.fontSize.sm }}>
                  Delivery Location
                </div>
                <div style={{ fontSize: tokens.fontSize.base }}>Verna, Goa</div>
                <div
                  style={{
                    fontSize: tokens.fontSize.xs,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  403722
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: tokens.fontSize.xl, // Reduced size
                    fontWeight: tokens.fontWeight.bold,
                  }}
                >
                  ₹1,90,236
                </div>
                <div
                  style={{
                    fontSize: tokens.fontSize.xs, // Reduced size
                    color: tokens.colors.neutral[600],
                  }}
                >
                  EMI Starting from ₹499/mo
                </div>
                <div
                  style={{
                    fontSize: tokens.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  Available with Zero Downpayment
                </div>
              </div>
            </div>

            <div style={{ marginTop: tokens.spacing[2] }}>
              <button
                style={{
                  backgroundColor: tokens.colors.neutral[800],
                  color: "white",
                  padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, // Reduced padding
                  borderRadius: tokens.borderRadius.DEFAULT,
                  width: "100%",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: tokens.fontSize.sm, // Smaller text
                }}
              >
                <span>Select Insurance</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

addPropertyControls(BookingContainer, {
  initialStep: {
    type: ControlType.Number,
    title: "Initial Step",
    defaultValue: 1,
    min: 1,
    max: 8,
    step: 1,
  },
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
  headingText: {
    type: ControlType.String,
    title: "Heading",
    defaultValue: "Book your Ride",
  },
  subHeadingText: {
    type: ControlType.String,
    title: "Subheading",
    defaultValue: "Configure your Vehicle",
  },
  descriptionText: {
    type: ControlType.String,
    title: "Description",
    defaultValue:
      "Get a personalised Feel and Experience of your Bike at your Nearest Kabira Mobility, Showroom.",
  },
  productImage: {
    type: ControlType.Image,
    title: "Product Image",
  },
});
