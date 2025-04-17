// Variant selector component
import { useState, useEffect } from "react";
import { addPropertyControls, ControlType } from "framer";
import tokens from "https://framer.com/m/DesignTokens-itkJ.js";
import VariantCard from "../ui/VariantCard";
import SectionTitle from "../form-sections/SectionTitle";

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VariantSelector(props) {
  const {
    title = "CHOOSE VARIANT",
    variants = [],
    selectedVariantId = "",
    onSelect,
    borderColor = tokens.colors.neutral[300],
    selectedBorderColor = tokens.colors.blue[600],
    style,
    ...rest
  } = props;

  return (
    <div style={style} {...rest}>
      <SectionTitle title={title} />

      {variants.map((variant) => (
        <VariantCard
          key={variant.id}
          title={variant.title}
          subtitle={variant.subtitle}
          description={variant.description}
          price={
            variant.price_addition > 0
              ? `₹${variant.price_addition.toLocaleString("en-IN")}`
              : ""
          }
          includedText={variant.is_default ? "Included" : ""}
          isSelected={variant.id === selectedVariantId}
          onClick={() => onSelect && onSelect(variant.id)}
          borderColor={borderColor}
          selectedBorderColor={selectedBorderColor}
        />
      ))}

      {variants.length === 0 && (
        <div
          style={{
            padding: tokens.spacing[4],
            textAlign: "center",
            color: tokens.colors.neutral[500],
            fontSize: tokens.fontSize.sm,
          }}
        >
          No variants available. Please select a vehicle first.
        </div>
      )}
    </div>
  );
}

addPropertyControls(VariantSelector, {
  title: {
    type: ControlType.String,
    title: "Section Title",
    defaultValue: "CHOOSE VARIANT",
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
        price_addition: { type: ControlType.Number },
        is_default: { type: ControlType.Boolean },
      },
    },
    defaultValue: [],
  },
  selectedVariantId: {
    type: ControlType.String,
    title: "Selected Variant ID",
    defaultValue: "",
  },
  borderColor: {
    type: ControlType.Color,
    title: "Border Color",
    defaultValue: tokens.colors.neutral[300],
  },
  selectedBorderColor: {
    type: ControlType.Color,
    title: "Selected Border Color",
    defaultValue: tokens.colors.blue[600],
  },
});
