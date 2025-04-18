// Components and accessories section
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import SectionTitle from "https://framer.com/m/SectionTitle-OVrp.js"
import VariantCard from "https://framer.com/m/VariantCard-jgTj.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function ComponentsSection(props) {
  const {
    components = [],
    selectedComponentIds = [],
    onSelect,
    borderColor = tokens.colors.neutral[300],
    selectedBorderColor = tokens.colors.blue[600],
    style,
    ...rest
  } = props

  // Group components by type
  const componentTypes = [...new Set(components.map((c) => c.component_type))]

  // Map component types to human-readable names
  const getComponentTypeName = (type) => {
    switch (type) {
      case "ACCESSORY":
        return "Accessories"
      case "PACKAGE":
        return "Packages"
      case "WARRANTY":
        return "Warranty"
      case "SERVICE":
        return "Servicing"
      default:
        return "Optional Components"
    }
  }

  return (
    <div style={style} {...rest}>
      {componentTypes.map((componentType) => {
        // Filter components for this type
        const componentsOfType = components.filter(
          (c) => c.component_type === componentType
        )

        if (componentsOfType.length === 0) return null

        return (
          <div
            key={componentType}
            style={{ marginBottom: tokens.spacing[8] }}
          >
            <SectionTitle
              title={getComponentTypeName(componentType)}
            />

            {componentsOfType.map((component) => (
              <VariantCard
                key={component.id}
                title={component.title}
                subtitle={component.subtitle}
                description={component.description}
                price={
                  component.price > 0
                    ? `₹${component.price.toLocaleString("en-IN")}`
                    : ""
                }
                includedText={
                  component.is_required ? "Mandatory" : ""
                }
                isSelected={selectedComponentIds.includes(
                  component.id
                )}
                onClick={() => {
                  if (onSelect) {
                    const isCurrentlySelected =
                      selectedComponentIds.includes(
                        component.id
                      )
                    onSelect(
                      component.id,
                      !isCurrentlySelected
                    )
                  }
                }}
                borderColor={borderColor}
                selectedBorderColor={selectedBorderColor}
                style={{
                  opacity: component.is_required ? 0.8 : 1,
                }}
              />
            ))}
          </div>
        )
      })}

      {components.length === 0 && (
        <div
          style={{
            padding: tokens.spacing[4],
            textAlign: "center",
            color: tokens.colors.neutral[500],
            fontSize: tokens.fontSize.sm,
          }}
        >
          No components available. Please select a vehicle first.
        </div>
      )}
    </div>
  )
}

addPropertyControls(ComponentsSection, {
  components: {
    type: ControlType.Array,
    title: "Components",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        title: { type: ControlType.String },
        subtitle: { type: ControlType.String },
        description: { type: ControlType.String },
        price: { type: ControlType.Number },
        is_required: { type: ControlType.Boolean },
        component_type: { type: ControlType.String },
      },
    },
    defaultValue: [],
  },
  selectedComponentIds: {
    type: ControlType.Array,
    title: "Selected Component IDs",
    control: {
      type: ControlType.String,
    },
    defaultValue: [],
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
})
