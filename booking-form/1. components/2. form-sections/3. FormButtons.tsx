// Form navigation buttons component
// Replace imports with:
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import Button from "https://framer.com/m/Button-FXtj.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function FormButtons(props) {
  const {
    showBackButton = true,
    nextButtonText = "Next",
    backButtonText = "Back",
    showNextButton = true,
    isNextDisabled = false,
    primaryColor = tokens.colors.blue[600],
    onNext,
    onBack,
    rightIcon = true,
    gap = tokens.spacing[4],
    style,
    ...rest
  } = props

  const containerStyle = {
    display: "flex",
    gap,
    width: "100%",
    ...style,
  }

  return (
    <div style={containerStyle} {...rest}>
      {showBackButton && (
        <Button
          text={backButtonText}
          variant="outline"
          onClick={onBack}
          width={showNextButton ? "calc(50% - 8px)" : "100%"}
          primaryColor={primaryColor}
        />
      )}

      {showNextButton && (
        <Button
          text={nextButtonText}
          rightIcon={rightIcon}
          onClick={onNext}
          width={showBackButton ? "calc(50% - 8px)" : "100%"}
          primaryColor={primaryColor}
          disabled={isNextDisabled}
        />
      )}
    </div>
  )
}

addPropertyControls(FormButtons, {
  showBackButton: {
    type: ControlType.Boolean,
    title: "Show Back Button",
    defaultValue: true,
  },
  nextButtonText: {
    type: ControlType.String,
    title: "Next Button Text",
    defaultValue: "Next",
  },
  backButtonText: {
    type: ControlType.String,
    title: "Back Button Text",
    defaultValue: "Back",
  },
  showNextButton: {
    type: ControlType.Boolean,
    title: "Show Next Button",
    defaultValue: true,
  },
  isNextDisabled: {
    type: ControlType.Boolean,
    title: "Disable Next Button",
    defaultValue: false,
  },
  primaryColor: {
    type: ControlType.Color,
    title: "Primary Color",
    defaultValue: tokens.colors.blue[600],
  },
  rightIcon: {
    type: ControlType.Boolean,
    title: "Right Icon on Next",
    defaultValue: true,
  },
  gap: {
    type: ControlType.Number,
    title: "Gap Between Buttons",
    defaultValue: 16,
    min: 0,
    max: 32,
    step: 4,
  },
})
