// Provider selector component
import { useState, useEffect } from "react";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import SectionTitle from "../form-sections/1. SectionTitle";

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function ProviderSelector(props) {
  const {
    title = "PROVIDER",
    providers = [],
    selectedProviderId = "",
    onSelect,
    borderColor = tokens.colors.neutral[300],
    selectedColor = tokens.colors.blue[600],
    style,
    ...rest
  } = props;

  const optionsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacing[3],
    marginBottom: tokens.spacing[4],
  };

  const optionButtonStyle = (isSelected) => ({
    flex: 1,
    minWidth: "120px",
    padding: tokens.spacing[4],
    backgroundColor: isSelected ? selectedColor : "white",
    color: isSelected ? "white" : tokens.colors.neutral[900],
    border: `1px solid ${isSelected ? selectedColor : borderColor}`,
    borderRadius: tokens.borderRadius.DEFAULT,
    fontSize: tokens.fontSize.base,
    fontWeight: tokens.fontWeight.medium,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  return (
    <div style={style} {...rest}>
      <SectionTitle title={title} />

      <div style={optionsContainerStyle}>
        {providers.map((provider) => (
          <div
            key={provider.id}
            style={optionButtonStyle(provider.id === selectedProviderId)}
            onClick={() => onSelect && onSelect(provider.id)}
          >
            {provider.name}
          </div>
        ))}
      </div>

      {providers.length === 0 && (
        <div
          style={{
            padding: tokens.spacing[4],
            textAlign: "center",
            color: tokens.colors.neutral[500],
            fontSize: tokens.fontSize.sm,
          }}
        >
          No providers available.
        </div>
      )}
    </div>
  );
}

addPropertyControls(ProviderSelector, {
  title: {
    type: ControlType.String,
    title: "Section Title",
    defaultValue: "PROVIDER",
  },
  providers: {
    type: ControlType.Array,
    title: "Providers",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        name: { type: ControlType.String },
      },
    },
    defaultValue: [],
  },
  selectedProviderId: {
    type: ControlType.String,
    title: "Selected Provider ID",
    defaultValue: "",
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: tokens.colors.neutral[300],
  },
  selectedColor: {
    type: ControlType.Color,
    title: "Selected Color",
    defaultValue: tokens.colors.blue[600],
  },
});
