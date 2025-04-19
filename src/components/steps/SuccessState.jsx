// Adapted from booking-form/2. steps/7. SuccessState.tsx
import React from "react";
import Button from "../ui/Button"; // Assuming Button component is adapted

export default function SuccessState(props) {
  const {
    // primaryColor = "blue-600", // Inherited via Button variants
    bookingId = "KM-9876543",
    customerName = "John Doe",
    vehicleName = "KM3000",
    estimatedDelivery = "15 May, 2025",
    onViewBookingDetails, // Optional: Function to handle view details action
    onTrackOrder, // Optional: Function to handle track order action
    onStartOver, // Function to reset the booking flow
    className = "",
    ...rest
  } = props;

  // Checkmark icon (basic SVG)
  const checkmarkIcon = (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-green-600" // Tailwind color
    >
      <path
        d="M18 24L22 28L30 20"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="4" />
    </svg>
  );

  // Placeholder classes - apply Tailwind here
  const containerClasses = `flex flex-col items-center p-6 ${className}`;
  const iconContainerClasses = "w-20 h-20 rounded-full bg-green-100 flex justify-center items-center mb-6";
  const headingClasses = "text-2xl font-bold text-green-600 mb-2 text-center";
  const subheadingClasses = "text-lg text-neutral-700 mb-6 text-center";
  const detailsCardClasses = "w-full bg-neutral-50 rounded-lg p-6 mb-6 shadow"; // Added shadow
  const detailRowClasses = "flex justify-between mb-3";
  const detailLabelClasses = "text-sm text-neutral-600";
  const detailValueClasses = "text-sm font-medium text-neutral-900 text-right"; // Align value right
  const cardHeadingClasses = "text-lg font-bold mb-6 text-neutral-800"; // Adjusted color
  const buttonContainerClasses = "flex flex-col gap-3 w-full max-w-xs mx-auto"; // Centered buttons

  return (
    <div className={containerClasses} {...rest}>
      <div className={iconContainerClasses}>{checkmarkIcon}</div>

      <div className={headingClasses}>Booking Confirmed!</div>
      <div className={subheadingClasses}>
        Thank you for booking your {vehicleName} with Kabira Mobility.
      </div>

      <div className={detailsCardClasses}>
        <div className={cardHeadingClasses}>Booking Details</div>

        <div className={detailRowClasses}>
          <div className={detailLabelClasses}>Booking ID</div>
          <div className={detailValueClasses}>{bookingId}</div>
        </div>
        <div className={detailRowClasses}>
          <div className={detailLabelClasses}>Customer Name</div>
          <div className={detailValueClasses}>{customerName}</div>
        </div>
        <div className={detailRowClasses}>
          <div className={detailLabelClasses}>Vehicle</div>
          <div className={detailValueClasses}>{vehicleName}</div>
        </div>
        <div className={detailRowClasses}>
          <div className={detailLabelClasses}>Estimated Delivery</div>
          <div className={detailValueClasses}>{estimatedDelivery}</div>
        </div>
      </div>

      <div className={buttonContainerClasses}>
        {onViewBookingDetails && (
            <Button
            text="View Booking Details"
            onClick={onViewBookingDetails}
            variant="primary" // Use primary variant
            // className="..." // Add custom classes if needed
            />
        )}
        {onTrackOrder && (
            <Button
            text="Track Order"
            variant="outline"
            onClick={onTrackOrder}
            // className="..."
            />
        )}
        <Button
          text="Book Another"
          variant="outline"
          onClick={onStartOver} // Reset the flow
          // className="..."
        />
      </div>
    </div>
  );
}
