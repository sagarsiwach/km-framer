// Vehicle summary component that appears at bottom
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import PriceDisplay from "https://framer.com/m/PriceDisplay-Q1nh.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VehicleSummary(props) {
    const {
        vehicleName = "KM3000",
        vehicleCode = "B10-0001",
        location = "Delhi, India",
        pincode = "",
        totalPrice = 199000,
        showEmiInfo = true,
        emiStartingFrom = 499,
        zeroDownpayment = true,
        style,
        ...rest
    } = props

    const containerStyle = {
        marginTop: tokens.spacing[4],
        borderTop: `1px solid ${tokens.colors.neutral[200]}`,
        paddingTop: tokens.spacing[4],
        paddingBottom: tokens.spacing[4],
        paddingLeft: tokens.spacing[4],
        paddingRight: tokens.spacing[4],
        ...style,
    }

    const headerStyle = {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: tokens.spacing[1],
    }

    const vehicleNameStyle = {
        fontSize: tokens.fontSize.xl,
        fontWeight: tokens.fontWeight.bold,
        fontFamily: "Geist, sans-serif",
        color: tokens.colors.neutral[900],
    }

    const vehicleCodeStyle = {
        fontSize: tokens.fontSize.xs,
        color: tokens.colors.neutral[600],
        fontFamily: "JetBrains Mono, monospace",
    }

    const contentStyle = {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: tokens.spacing[2],
    }

    const locationContainerStyle = {
        display: "flex",
        flexDirection: "column",
    }

    const locationLabelStyle = {
        fontSize: tokens.fontSize.sm,
        color: tokens.colors.neutral[600],
    }

    const locationValueStyle = {
        fontSize: tokens.fontSize.base,
        color: tokens.colors.neutral[900],
    }

    const pincodeStyle = {
        fontSize: tokens.fontSize.xs,
        color: tokens.colors.neutral[600],
    }

    const priceContainerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
    }

    const emiTextStyle = {
        fontSize: tokens.fontSize.xs,
        color: tokens.colors.neutral[600],
        marginTop: tokens.spacing[1],
    }

    return (
        <div style={containerStyle} {...rest}>
            <div style={headerStyle}>
                <div style={vehicleNameStyle}>{vehicleName}</div>
                <div style={vehicleCodeStyle}>{vehicleCode}</div>
            </div>

            <div style={contentStyle}>
                <div style={locationContainerStyle}>
                    <div style={locationLabelStyle}>Delivery Location</div>
                    <div style={locationValueStyle}>{location}</div>
                    {pincode && <div style={pincodeStyle}>{pincode}</div>}
                </div>

                <div style={priceContainerStyle}>
                    <PriceDisplay
                        price={totalPrice}
                        size="large"
                        fontWeight="bold"
                    />

                    {showEmiInfo && (
                        <>
                            <div style={emiTextStyle}>
                                EMI Starting from ₹{emiStartingFrom}/mo
                            </div>
                            {zeroDownpayment && (
                                <div style={emiTextStyle}>
                                    Available with Zero Downpayment
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

addPropertyControls(VehicleSummary, {
    vehicleName: {
        type: ControlType.String,
        title: "Vehicle Name",
        defaultValue: "KM3000",
    },
    vehicleCode: {
        type: ControlType.String,
        title: "Vehicle Code",
        defaultValue: "B10-0001",
    },
    location: {
        type: ControlType.String,
        title: "Location",
        defaultValue: "Delhi, India",
    },
    pincode: {
        type: ControlType.String,
        title: "Pincode",
        defaultValue: "",
    },
    totalPrice: {
        type: ControlType.Number,
        title: "Total Price",
        defaultValue: 199000,
    },
    showEmiInfo: {
        type: ControlType.Boolean,
        title: "Show EMI Info",
        defaultValue: true,
    },
    emiStartingFrom: {
        type: ControlType.Number,
        title: "EMI Starting From",
        defaultValue: 499,
    },
    zeroDownpayment: {
        type: ControlType.Boolean,
        title: "Zero Downpayment",
        defaultValue: true,
    },
})
