// Payment method selector component
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import VariantCard from "https://framer.com/m/VariantCard-jgTj.js"
import SectionTitle from "https://framer.com/m/SectionTitle-OVrp.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function PaymentMethodSelector(props) {
  const {
    title = "PAYMENT METHOD",
    methods = [
      {
        id: "full-payment",
        title: "Full Payment",
        subtitle: "Pay the entire amount upfront",
        description: "",
      },
      {
        id: "loan",
        title: "EMI Option",
        subtitle: "Start your ride with Zero down payment",
        description: "EMI starting from ₹499/month",
      },
    ],
    selectedMethodId = "",
    onSelect,
    borderColor = tokens.colors.neutral[300],
    selectedBorderColor = tokens.colors.blue[600],
    style,
    ...rest
  } = props

  return (
    <div style={style} {...rest}>
      <SectionTitle title={title} />

      {methods.map((method) => (
        <VariantCard
          key={method.id}
          title={method.title}
          subtitle={method.subtitle}
          description={method.description}
          isSelected={method.id === selectedMethodId}
          onClick={() => onSelect && onSelect(method.id)}
          borderColor={borderColor}
          selectedBorderColor={selectedBorderColor}
        />
      ))}
    </div>
  )
}

addPropertyControls(PaymentMethodSelector, {
  title: {
    type: ControlType.String,
    title: "Section Title",
    defaultValue: "PAYMENT METHOD",
  },
  methods: {
    type: ControlType.Array,
    title: "Payment Methods",
    control: {
      type: ControlType.Object,
      controls: {
        id: { type: ControlType.String },
        title: { type: ControlType.String },
        subtitle: { type: ControlType.String },
        description: { type: ControlType.String },
      },
    },
    defaultValue: [
      {
        id: "full-payment",
        title: "Full Payment",
        subtitle: "Pay the entire amount upfront",
        description: "",
      },
      {
        id: "loan",
        title: "EMI Option",
        subtitle: "Start your ride with Zero down payment",
        description: "EMI starting from ₹499/month",
      },
    ],
  },
  selectedMethodId: {
    type: ControlType.String,
    title: "Selected Method ID",
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
})
