// API utility functions

/**
 * Base API URL
 */
const API_BASE_URL = "https://booking-engine.sagarsiwach.workers.dev/";

/**
 * Generic fetch function with error handling
 * @param {string} endpoint - API endpoint to call
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response data
 */
async function fetchApi(endpoint = "", options = {}) {
  try {
    // Add cache-busting parameter
    const url = `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${Date.now()}`;

    // Default options
    const defaultOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "omit",
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const responseText = await response.text();

    if (!responseText || responseText.trim() === "") {
      throw new Error("Empty response received");
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * Fetch vehicle data including models, variants, colors, and pricing
 * @returns {Promise<object>} Vehicle data
 */
export async function fetchVehicleData() {
  try {
    const result = await fetchApi();

    if (result.status === "success" && result.data) {
      return result.data;
    }

    throw new Error("Invalid data format received from API");
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    throw error;
  }
}

/**
 * Fetch location data by query (pincode or city name)
 * @param {string} query - Search query
 * @param {object} vehicleData - Vehicle data containing pricing info
 * @returns {Promise<array>} Location results
 */
export function searchLocationFromPricing(query, vehicleData) {
  try {
    if (!vehicleData || !vehicleData.pricing) {
      return [];
    }

    // If it's a 6-digit pincode, find matching locations
    if (/^\d{6}$/.test(query)) {
      const matchingLocations = vehicleData.pricing.filter(
        (p) => p.pincode_start <= parseInt(query) && p.pincode_end >= parseInt(query)
      ) || [];

      // Format results like Mapbox features for compatibility
      return matchingLocations.map((loc) => ({
        id: `loc-${loc.id}`,
        place_name: `${query}, ${loc.city || ""}, ${loc.state}, India`,
        place_type: ["postcode"],
        context: [
          { id: "postcode.123", text: query },
          { id: "place.123", text: loc.city || "" },
          { id: "region.123", text: loc.state },
        ],
        text: query,
      }));
    } else if (query.length >= 3) {
      // Search based on city/state
      const matchingLocations = vehicleData.pricing.filter(
        (p) =>
          (p.city && p.city.toLowerCase().includes(query.toLowerCase())) ||
          (p.state && p.state.toLowerCase().includes(query.toLowerCase()))
      ) || [];

      return matchingLocations.map((loc) => ({
        id: `loc-${loc.id}`,
        place_name: `${loc.city || ""}, ${loc.state}, India`,
        place_type: ["place"],
        context: [
          { id: "place.123", text: loc.city || "" },
          { id: "region.123", text: loc.state },
        ],
        text: loc.city || loc.state,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error searching location:", error);
    return [];
  }
}

/**
 * Submit booking form data
 * @param {object} formData - Booking form data
 * @returns {Promise<object>} Submission result
 */
export async function submitBooking(formData) {
  try {
    // In a real implementation, this would send the form data to an API
    // For now, we'll simulate a successful submission
    console.log("Submitting booking form:", formData);

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate a booking ID
    const bookingId = `KM-${Math.floor(Math.random() * 9000000) + 1000000}`;

    return {
      status: "success",
      bookingId,
      estimatedDelivery: "15 May, 2025",
    };
  } catch (error) {
    console.error("Error submitting booking:", error);
    throw error;
  }
}

/**
 * Send OTP to user's phone or email
 * @param {string} phone - User's phone number
 * @param {string} email - User's email address
 * @param {boolean} useEmail - Whether to send OTP to email instead of phone
 * @returns {Promise<object>} OTP sending result
 */
export async function sendOTP(phone, email, useEmail = false) {
  try {
    // In a real implementation, this would call an API to send the OTP
    // For now, we'll simulate a successful OTP sending
    console.log(`Sending OTP to ${useEmail ? email : phone} via ${useEmail ? 'email' : 'SMS'}`);

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      status: "success",
      message: `OTP has been sent to ${useEmail ? email : phone}`,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

/**
 * Verify OTP code
 * @param {string} otp - OTP code to verify
 * @param {string} phone - User's phone number
 * @returns {Promise<object>} Verification result
 */
export async function verifyOTP(otp, phone) {
  try {
    // In a real implementation, this would call an API to verify the OTP
    // For now, we'll accept the hardcoded "123456" as valid
    console.log(`Verifying OTP ${otp} for ${phone}`);

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, only accept "123456" as valid
    if (otp === "123456") {
      return {
        status: "success",
        verified: true,
      };
    } else {
      return {
        status: "error",
        verified: false,
        message: "Invalid OTP code",
      };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

/**
 * Process payment (mock implementation)
 * @param {object} paymentDetails - Payment details
 * @returns {Promise<object>} Payment result
 */
export async function processPayment(paymentDetails) {
  try {
    // In a real implementation, this would integrate with a payment gateway
    // For now, we'll simulate a payment process
    console.log("Processing payment:", paymentDetails);

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful payment (this would be handled by the payment gateway)
    return {
      status: "success",
      transactionId: `TX-${Date.now()}-${Math.round(Math.random() * 1000000)}`,
      message: "Payment processed successfully",
    };
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
}
