// Utility functions for formatting values

/**
 * Format price for display
 * @param {number} price - The price to format
 * @param {boolean} showDecimal - Whether to show decimal places
 * @param {string} prefix - Currency prefix
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, showDecimal = false, prefix = "₹") => {
  if (typeof price !== "number") {
      return `${prefix}0`
  }

  if (showDecimal) {
      return `${prefix}${price.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
      })}`
  }

  return `${prefix}${price.toLocaleString("en-IN")}`
}

/**
* Format phone number for display
* @param {string} phone - Phone number to format
* @param {string} countryCode - Country code
* @returns {string} Formatted phone number
*/
export const formatPhoneNumber = (phone, countryCode = "+91") => {
  if (!phone) return ""

  // Clean the phone number to contain only digits
  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.length === 10) {
      return `${countryCode} ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`
  }

  return `${countryCode} ${cleaned}`
}

/**
* Format date for display
* @param {Date|string} date - Date to format
* @param {string} format - Format type ('short', 'medium', 'long')
* @returns {string} Formatted date string
*/
export const formatDate = (date, format = "medium") => {
  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
      return "Invalid date"
  }

  const options = {
      short: { day: "numeric", month: "short", year: "numeric" },
      medium: { day: "numeric", month: "long", year: "numeric" },
      long: {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
      },
  }

  return dateObj.toLocaleDateString(
      "en-IN",
      options[format] || options.medium
  )
}
