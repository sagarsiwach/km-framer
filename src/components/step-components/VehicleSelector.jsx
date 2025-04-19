// Adapted from booking-form/1. components/3. step-components/1. VehicleSelector.tsx
import React from "react";
// Assuming SectionTitle and VehicleCards components are adapted and imported
import SectionTitle from "../form-sections/SectionTitle";
import VehicleCards from "../ui/VehicleCards"; // Note: Renamed from VehicleCard to VehicleCards in original import

/**
 * Basic VehicleSelector component ready for Tailwind styling.
 */
export default function VehicleSelector(props) {
  const {
    title = "CHOOSE YOUR VEHICLE",
    vehicles = [], // Expects array of { id, name, image_url, model_code, price (string) }
    selectedVehicleId = "",
    onSelect,
    // borderColor, // Removed for Tailwind
    // selectedBorderColor, // Removed for Tailwind
    className = "", // Allow passing Tailwind classes
    getVehiclePrice = () => "Price on request", // Function to get price string
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const containerClasses = `${className}`;
  const noVehiclesClasses = "p-4 text-center text-neutral-500 text-sm";

  return (
    <div className={containerClasses} {...rest}>
      <SectionTitle title={title} />

      {vehicles.map((vehicle) => (
        <VehicleCards // Use the correct component name
          key={vehicle.id}
          vehicleName={vehicle.name}
          vehicleImage={
            vehicle.image_url ||
            "https://via.placeholder.com/160x120.png?text=No+Image" // Placeholder image
          }
          vehicleCode={vehicle.model_code || ""}
          // Price is not displayed by VehicleCards component itself, but passed here if needed elsewhere
          // price={getVehiclePrice(vehicle.id)}
          isSelected={vehicle.id === selectedVehicleId}
          onClick={() => onSelect && onSelect(vehicle.id)}
          // Pass Tailwind classes or rely on VehicleCards' internal state styling
          // className="..."
          // borderColor and selectedBorderColor props removed
        />
      ))}

      {vehicles.length === 0 && (
        <div className={noVehiclesClasses}>
          No vehicles available. Please try a different selection.
        </div>
      )}
    </div>
  );
}
