import React from 'react';
// Assuming BookingContainer will be refactored similarly and placed here:
// import BookingContainer from './containers/BookingContainer';

// Mock BookingContainer for now if the actual component isn't ready
const MockBookingContainer = (props) => (
    <div style={props.style} className="border p-4 rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-2">Booking Container Placeholder</h2>
        <p><span className="font-medium">Heading:</span> {props.headingText}</p>
        <p><span className="font-medium">Primary Color:</span> <span style={{ color: props.primaryColor }}>{props.primaryColor}</span></p>
        <p><span className="font-medium">API Base URL:</span> {props.apiBaseUrl}</p>
        <p><span className="font-medium">Initial Step:</span> {props.initialStep}</p>
        <img src={props.productImage} alt="Product" className="w-32 h-32 object-cover my-2 border rounded" />
        {props.enableDebug && (
            <>
                <h3 className="text-lg font-medium mt-4 mb-1">Debug Props:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-60">
                    {JSON.stringify(props, null, 2)}
                </pre>
            </>
        )}
    </div>
);

/**
 * Main Booking Form Component Wrapper
 */
export default function BookingForm(props) {
    const {
        // Basic settings
        initialStep = 1,
        primaryColor = "#2563EB", // Default blue-600
        backgroundColor = "#F9FAFB", // Default neutral-50 (Applied via style prop for now)
        borderColor = "#E5E7EB", // Default neutral-200 (Used by MockBookingContainer)
        apiBaseUrl = "https://booking-engine.sagarsiwach.workers.dev/",
        logoColor = "#FFFFFF",
        headingText = "Book your Ride",
        productImage = "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",

        // Configuration options
        enableDebug = false,

        // Event handlers
        onStepChange,
        onFormSubmit,

        // Styling
        style, // Pass through style if needed
        className = "", // Allow passing Tailwind classes
        ...rest
    } = props;

    // Use the actual BookingContainer once refactored
    const ContainerComponent = MockBookingContainer; // Replace with actual BookingContainer later

    return (
        <div className={`booking-form-wrapper ${className}`}>
            <ContainerComponent
                initialStep={initialStep}
                primaryColor={primaryColor}
                // Pass backgroundColor via style for the container, or handle internally
                style={{ ...style, backgroundColor: backgroundColor, borderColor: borderColor }}
                apiBaseUrl={apiBaseUrl}
                logoColor={logoColor}
                headingText={headingText}
                productImage={productImage}
                onStepChange={onStepChange}
                onFormSubmit={onFormSubmit}
                enableDebug={enableDebug}
                {...rest}
            />
        </div>
    );
}
