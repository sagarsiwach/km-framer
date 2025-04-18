// booking-form/steps/7. SuccessState.tsx
// Replace imports with:
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import Button from "https://framer.com/m/Button-FXtj.js"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function SuccessState(props) {
  const {
    // Customization options
    primaryColor = tokens.colors.blue[600],

    // Booking details
    bookingId = "KM-9876543",
    customerName = "John Doe",
    vehicleName = "KM3000",
    estimatedDelivery = "15 May, 2025",

    // Event handlers
    onViewBookingDetails,
    onTrackOrder,
    onStartOver,

    // Component styling
    style,
    ...rest
  } = props

  // Styling
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: tokens.spacing[6],
    ...style,
  }

  const iconContainerStyle = {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: tokens.colors.green[100],
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: tokens.spacing[6],
  }

  const headingStyle = {
    fontSize: tokens.fontSize["2xl"],
    fontWeight: tokens.fontWeight.bold,
    color: tokens.colors.green[600],
    marginBottom: tokens.spacing[2],
    textAlign: "center",
  }

  const subheadingStyle = {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.neutral[700],
    marginBottom: tokens.spacing[6],
    textAlign: "center",
  }

  const detailsCardStyle = {
    width: "100%",
    backgroundColor: tokens.colors.neutral[50],
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[6],
    marginBottom: tokens.spacing[6],
  }

  const detailRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: tokens.spacing[3],
  }

  const detailLabelStyle = {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.neutral[600],
  }

  const detailValueStyle = {
    fontSize: tokens.fontSize.sm,
    fontWeight: tokens.fontWeight.medium,
    color: tokens.colors.neutral[900],
  }

  const buttonContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacing[3],
    width: "100%",
  }

  const checkmarkIcon = (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 24L22 28L30 20"
        stroke="#16A34A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="21" stroke="#16A34A" strokeWidth="4" />
    </svg>
  )

  return (
    <div style={containerStyle} {...rest}>
      <div style={iconContainerStyle}>{checkmarkIcon}</div>

      <div style={headingStyle}>Booking Confirmed!</div>
      <div style={subheadingStyle}>
        Thank you for booking your {vehicleName} with Kabira Mobility.
      </div>

      <div style={detailsCardStyle}>
        <div
          style={{
            ...detailRowStyle,
            marginBottom: tokens.spacing[6],
          }}
        >
          <div
            style={{
              fontSize: tokens.fontSize.lg,
              fontWeight: tokens.fontWeight.bold,
            }}
          >
            Booking Details
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={detailLabelStyle}>Booking ID</div>
          <div style={detailValueStyle}>{bookingId}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={detailLabelStyle}>Customer Name</div>
          <div style={detailValueStyle}>{customerName}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={detailLabelStyle}>Vehicle</div>
          <div style={detailValueStyle}>{vehicleName}</div>
        </div>

        <div style={detailRowStyle}>
          <div style={detailLabelStyle}>Estimated Delivery</div>
          <div style={detailValueStyle}>{estimatedDelivery}</div>
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <Button
          text="View Booking Details"
          onClick={onViewBookingDetails}
          primaryColor={primaryColor}
        />

        <Button
          text="Track Order"
          variant="outline"
          onClick={onTrackOrder}
          primaryColor={primaryColor}
        />

        <Button
          text="Book Another"
          variant="outline"
          onClick={onStartOver}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  )
}

addPropertyControls(SuccessState, {
  primaryColor: {
    type: ControlType.Color,
    title: "Primary Color",
    defaultValue: tokens.colors.blue[600],
  },
  bookingId: {
    type: ControlType.String,
    title: "Booking ID",
    defaultValue: "KM-9876543",
  },
  customerName: {
    type: ControlType.String,
    title: "Customer Name",
    defaultValue: "John Doe",
  },
  vehicleName: {
    type: ControlType.String,
    title: "Vehicle Name",
    defaultValue: "KM3000",
  },
  estimatedDelivery: {
    type: ControlType.String,
    title: "Estimated Delivery",
    defaultValue: "15 May, 2025",
  },
})
