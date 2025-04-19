
/**
 * Format price for display.
 * @param {number} price - The price to format.
 * @param {boolean} [showDecimal=false] - Whether to show decimal places.
 * @param {string} [prefix="₹"] - Currency prefix.
 * @returns {string} Formatted price string.
 */
export const formatPrice = (price, showDecimal = false, prefix = "₹") => {
  if (typeof price !== "number" || isNaN(price)) {
    // Handle invalid input gracefully
    return `${prefix}0`;
  }

  const options = showDecimal
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { minimumFractionDigits: 0, maximumFractionDigits: 0 };

  // Use try-catch for toLocaleString as it can fail in rare cases
  try {
    return `${prefix}${price.toLocaleString("en-IN", options)}`;
  } catch (error) {
    console.error("Error formatting price:", error);
    // Fallback to simple formatting
    return `${prefix}${showDecimal ? price.toFixed(2) : Math.round(price)}`;
  }
};

/**
 * Format phone number for display (Indian format).
 * @param {string} phone - Phone number to format (expecting 10 digits).
 * @param {string} [countryCode="+91"] - Country code.
 * @returns {string} Formatted phone number or original if invalid.
 */
export const formatPhoneNumber = (phone, countryCode = "+91") => {
  if (!phone || typeof phone !== 'string') return "";

  const cleaned = phone.replace(/\D/g, ""); // Remove non-digits

  if (cleaned.length === 10) {
    // Format as +91 XXXXX XXXXX
    return `${countryCode} ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }

  // Return original (with country code) if not 10 digits after cleaning
  return `${countryCode} ${cleaned}`;
};

/**
 * Format date for display.
 * @param {Date|string|number} date - Date to format (Date object, ISO string, or timestamp).
 * @param {'short'|'medium'|'long'} [format='medium'] - Format type.
 * @returns {string} Formatted date string or "Invalid date".
 */
export const formatDate = (date, format = "medium") => {
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    try {
      dateObj = new Date(date); // Attempt to parse string/number
    } catch (e) {
      return "Invalid date";
    }
  }

  // Check if the date is valid after potential parsing
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const optionsMap = {
    short: { day: "numeric", month: "short", year: "numeric" }, // e.g., 19 Apr, 2025
    medium: { day: "numeric", month: "long", year: "numeric" }, // e.g., 19 April, 2025
    long: { weekday: "long", day: "numeric", month: "long", year: "numeric" }, // e.g., Saturday, 19 April, 2025
  };

  const options = optionsMap[format] || optionsMap.medium; // Default to medium

  try {
    return dateObj.toLocaleDateString("en-IN", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    // Fallback to ISO string part
    return dateObj.toISOString().split('T')[0];
  }
};
