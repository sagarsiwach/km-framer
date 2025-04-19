// Adapted from booking-form/1. components/2. form-sections/6. VehicleSummary.tsx
import React from "react";
// Assuming PriceDisplay component is adapted and imported
import PriceDisplay from "../ui/PriceDisplay";

/**
 * Basic VehicleSummary component ready for Tailwind styling.
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
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Placeholder classes - apply Tailwind here
  const containerClasses = `mt-4 border-t border-neutral-200 pt-3 ${className}`;
  const headerClasses = "flex justify-between mb-1";
  const vehicleNameClasses = "text-xl font-bold font-geist text-neutral-900";
  const vehicleCodeClasses = "text-xs text-neutral-600 font-mono";
  const contentClasses = "flex justify-between mb-2";
  const locationContainerClasses = "flex flex-col";
  const locationLabelClasses = "text-sm text-neutral-600";
  const locationValueClasses = "text-base text-neutral-900";
  const pincodeClasses = "text-xs text-neutral-600";
  const priceContainerClasses = "flex flex-col items-end";
  const emiTextClasses = "text-xs text-neutral-600 mt-1";

  return (
    <div className={containerClasses} {...rest}>
      <div className={headerClasses}>
        <div className={vehicleNameClasses}>{vehicleName}</div>
        <div className={vehicleCodeClasses}>{vehicleCode}</div>
      </div>

      <div className={contentClasses}>
        <div className={locationContainerClasses}>
          <div className={locationLabelClasses}>Delivery Location</div>
          <div className={locationValueClasses}>{location}</div>
          {pincode && <div className={pincodeClasses}>{pincode}</div>}
        </div>

        <div className={priceContainerClasses}>
          <PriceDisplay
            price={totalPrice}
            size="large" // Corresponds to text-2xl in PriceDisplay example
            fontWeight="bold"
          />

          {showEmiInfo && (
            <>
              <div className={emiTextClasses}>
                EMI Starting from ₹{emiStartingFrom}/mo
              </div>
              {zeroDownpayment && (
                <div className={emiTextClasses}>
                  Available with Zero Downpayment
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
