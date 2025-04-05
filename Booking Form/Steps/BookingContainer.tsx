import { addPropertyControls, ControlType } from "framer";
import { useState } from "react";
import tokens from "https://framer.com/m/Designtokens-itkJ.js@bzdIZqhHc2iTYzb4LFjz";
import Logo, {
  KMCircleLogo,
  KMFullLogo,
} from "https://framer.com/m/Logo-exuM.js@Ap9zcYznZr2fY7PXR5Nn";

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
    style,
    ...rest
  } = props;

  // Basic state for UI demonstration
  const [currentStep, setCurrentStep] = useState(initialStep);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    backgroundColor,
    padding: tokens.spacing[6],
    width: "100%",
    height: "100%",
    fontFamily: tokens.fontFamily.sans,
    color: tokens.colors.neutral[900],
    boxSizing: "border-box",
    overflowY: "auto",
    ...style,
  };

  const headerStyle = {
    marginBottom: tokens.spacing[6],
  };

  const tagStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[500],
    marginBottom: tokens.spacing[2],
  };

  const headingStyle = {
    fontSize: tokens.fontSize["3xl"],
    fontWeight: tokens.fontWeight.bold,
    marginBottom: tokens.spacing[2],
  };

  const subheadingStyle = {
    fontSize: tokens.fontSize.base,
    lineHeight: tokens.lineHeight.relaxed,
    color: tokens.colors.neutral[600],
    marginBottom: tokens.spacing[6],
  };

  const dividerStyle = {
    height: 1,
    backgroundColor: tokens.colors.neutral[200],
    marginBottom: tokens.spacing[6],
  };

  const contentStyle = {
    flex: 1,
  };

  // Placeholder for step content rendering based on currentStep
  const renderStepContent = () => {
    // This will be developed further to render appropriate step components
    return <div>Step {currentStep} content will appear here</div>;
  };

  return (
    <div style={containerStyle} {...rest}>
      <div style={headerStyle}>
        <div style={tagStyle}>Buy Now</div>
        <h1 style={headingStyle}>{headingText}</h1>
        <p style={subheadingStyle}>{descriptionText}</p>
        <div style={dividerStyle} />
      </div>

      <div style={contentStyle}>{renderStepContent()}</div>
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
});
