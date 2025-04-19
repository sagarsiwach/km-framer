// Vehicle selector component
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"
import VehicleCards from "https://framer.com/m/VehicleCards-mBCf.js"
import SectionTitle from "https://framer.com/m/SectionTitle-OVrp.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function VehicleSelector(props) {
    const {
        title = "CHOOSE YOUR VEHICLE",
        vehicles = [],
        selectedVehicleId = "",
        onSelect,
        borderColor = tokens.colors.neutral[300],
        selectedBorderColor = tokens.colors.blue[600],
        style,
        ...rest
    } = props

    return (
        <div style={style} {...rest}>
            <SectionTitle title={title} />

            {vehicles.map((vehicle) => (
                <VehicleCards
                    key={vehicle.id}
                    vehicleName={vehicle.name}
                    vehicleImage={
                        vehicle.image_url ||
                        "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png"
                    }
                    vehicleCode={vehicle.model_code || ""}
                    price={vehicle.price || "Price on request"}
                    isSelected={vehicle.id === selectedVehicleId}
                    onClick={() => onSelect && onSelect(vehicle.id)}
                    borderColor={borderColor}
                    selectedBorderColor={selectedBorderColor}
                />
            ))}

            {vehicles.length === 0 && (
                <div
                    style={{
                        padding: tokens.spacing[4],
                        textAlign: "center",
                        color: tokens.colors.neutral[500],
                        fontSize: tokens.fontSize.sm,
                    }}
                >
                    No vehicles available. Please try a different selection.
                </div>
            )}
        </div>
    )
}

addPropertyControls(VehicleSelector, {
    title: {
        type: ControlType.String,
        title: "Section Title",
        defaultValue: "CHOOSE YOUR VEHICLE",
    },
    vehicles: {
        type: ControlType.Array,
        title: "Vehicles",
        control: {
            type: ControlType.Object,
            controls: {
                id: { type: ControlType.String },
                name: { type: ControlType.String },
                image_url: { type: ControlType.Image },
                model_code: { type: ControlType.String },
                price: { type: ControlType.String },
            },
        },
        defaultValue: [],
    },
    selectedVehicleId: {
        type: ControlType.String,
        title: "Selected Vehicle ID",
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
