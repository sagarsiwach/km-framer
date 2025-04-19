import React from 'react';
import BookingForm from './BookingForm'; // Import the refactored component

function App() {
  // Default props for the BookingForm, similar to Framer controls
  const bookingFormProps = {
    initialStep: 1,
    primaryColor: "#2563EB", // Tailwind blue-600
    backgroundColor: "#F9FAFB", // Tailwind neutral-50
    borderColor: "#E5E7EB", // Tailwind neutral-200
    apiBaseUrl: "https://booking-engine.sagarsiwach.workers.dev/",
    logoColor: "#FFFFFF",
    headingText: "Book Your Awesome Ride",
    productImage: "https://framerusercontent.com/images/kGiQohfz1kTljpgxcUnUxGNSE.png",
    enableDebug: true,
    onStepChange: (step) => console.log("Step changed:", step),
    onFormSubmit: (data) => console.log("Form submitted:", data),
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">React Booking Form</h1>
      {/* Render the BookingForm with props */}
      <BookingForm {...bookingFormProps} />
    </div>
  );
}

export default App;
