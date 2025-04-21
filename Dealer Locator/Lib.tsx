// Lib.tsx
import React from "react";

// ========== CONSTANTS ==========
export const DEFAULT_CENTER_GOOGLE = { lat: 15.2993, lng: 74.124 }; // Goa, India
export const DEFAULT_CENTER_MAPBOX = [78.9629, 20.5937]; // Center of India [Lng, Lat]
export const DEFAULT_ZOOM = 4; // Start zoomed out on India
export const MAX_ZOOM = 18;
export const MIN_ZOOM = 3; // Allow slightly more zoom out
export const DEFAULT_SEARCH_RADIUS = 50; // km - Note: Radius logic wasn't fully implemented in locator, kept for reference

// Google Map Styles (Keep available if needed)
export const GOOGLE_MAP_STYLES = [
  { id: "standard", name: "Standard", styles: [] },
  {
    id: "monochrome_minimal",
    name: "Monochrome Minimal",
    styles: [
      { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      {
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }],
      },
      {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#f5f5f5" }],
      },
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ color: "#cfcfcf" }],
      },
      {
        featureType: "administrative.land_parcel",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#bdbdbd" }],
      },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "road.arterial",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#e0e0e0" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      { featureType: "road.local", stylers: [{ visibility: "on" }] },
      {
        featureType: "road.local",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#e9e9e9" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }],
      },
    ],
  },
];

// Sample dealer data (Keep for canvas preview)
export const SAMPLE_DEALERS: Dealer[] = [
  // Added explicit type
  {
    id: "1",
    name: "Kabira Mobility Showroom",
    address: {
      line1: "Plot No L-148 & 149, Verna Industrial Estate",
      line2: "Verna Goa",
      city: "Verna",
      state: "Goa",
      pincode: "403722",
      country: "India",
      formatted:
        "Plot No L-148 & 149, Verna Industrial Estate, Verna Goa, Verna, Goa, 403722, India",
    },
    coordinates: { lat: 15.3640954, lng: 73.9459574 },
    contact: {
      phone: "8574600700",
      email: "enquiry@kabiramobility.com",
      website: "https://www.kabiramobility.com",
    },
    hours: [
      { day: "Monday", open: "10:00", close: "17:00" },
      { day: "Tuesday", open: "10:00", close: "17:00" },
      { day: "Wednesday", open: "10:00", close: "17:00" },
      { day: "Thursday", open: "10:00", close: "17:00" },
      { day: "Friday", open: "10:00", close: "17:00" },
      { day: "Saturday", open: "10:00", close: "17:00" },
      { day: "Sunday", open: "Closed", close: "Closed" },
    ],
    services: ["sales", "service", "charging"],
    active: true,
    featured: true,
    imageUrl:
      "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM3000_apj2tj.png",
  },
  {
    id: "2",
    name: "GreenVolt Charging Hyderabad",
    address: {
      line1: "Plot 25, Gachibowli Rd",
      line2: "Opposite Deloitte",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500032",
      country: "India",
      formatted:
        "Plot 25, Gachibowli Rd, Opposite Deloitte, Hyderabad, Telangana, 500032, India",
    },
    coordinates: null, // Example of invalid coords for testing
    contact: {
      phone: "8574600700",
      email: "support.hyd@greenvolt.com",
      website: "https://www.kabiramobility.com",
    },
    hours: [
      { day: "Monday", open: "09:00", close: "19:00" },
      { day: "Tuesday", open: "09:00", close: "19:00" },
      { day: "Wednesday", open: "09:00", close: "19:00" },
      { day: "Thursday", open: "09:00", close: "19:00" },
      { day: "Friday", open: "09:00", close: "19:00" },
      { day: "Saturday", open: "09:00", close: "19:00" },
      { day: "Sunday", open: "09:00", close: "16:00" },
    ],
    services: ["charging"],
    active: true,
    featured: false,
  },
  {
    id: "3",
    name: "Valid Dealer Far Away",
    address: {
      city: "Mumbai",
      state: "MH",
      formatted: "Mumbai, MH, India",
      pincode: "400001",
      country: "India",
    },
    coordinates: { lat: 19.076, lng: 72.8777 },
    services: ["sales"],
    active: true,
    featured: false,
  },
];

// ========== TYPESCRIPT TYPES ==========
export interface Coordinates {
  lat: number;
  lng: number;
}
export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  formatted: string;
}
export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}
export interface Hours {
  day: string;
  open: string;
  close: string;
}
export interface Dealer {
  id: string;
  name: string;
  address: Address;
  coordinates: Coordinates | null; // Allow null
  contact?: Contact;
  hours?: Hours[];
  services?: string[];
  rating?: number;
  distance?: number;
  imageUrl?: string;
  active?: boolean;
  featured?: boolean;
}
export type MapProvider = "google" | "mapbox" | "none";
export type Location = Coordinates | null;

// ========== UTILITY FUNCTIONS ==========

export const hexToRgba = (hex: string, alpha: number): string => {
  // Handle cases where Framer might pass "rgb(...)" or null/undefined
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
    // Only warn for truly unexpected non-hex strings
    if (hex && typeof hex === "string" && !hex.startsWith("rgb")) {
      console.warn(
        `Invalid hex color input to hexToRgba: ${hex}. Returning fallback.`
      );
    }
    return `rgba(0,0,0,${alpha})`; // Fallback
  }
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    console.warn(`Invalid hex length: #${hex}`);
    return `rgba(0,0,0,${alpha})`;
  }
  const r = parseInt(hex.substring(0, 2), 16),
    g = parseInt(hex.substring(2, 4), 16),
    b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn(`Failed parse hex: #${hex}`);
    return `rgba(0,0,0,${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const calculateDistance = (
  loc1: Location,
  loc2: Coordinates | null,
  unit: "km" | "miles" = "km"
): number | undefined => {
  if (
    !loc1 ||
    !loc2 ||
    loc1.lat == null ||
    loc1.lng == null ||
    loc2.lat == null ||
    loc2.lng == null ||
    isNaN(loc1.lat) ||
    isNaN(loc1.lng) ||
    isNaN(loc2.lat) ||
    isNaN(loc2.lng)
  ) {
    return undefined;
  }
  const rad = (n: number) => (n * Math.PI) / 180;
  const R = unit === "miles" ? 3958.8 : 6371;
  const dLat = rad(loc2.lat - loc1.lat);
  const dLng = rad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(loc1.lat)) *
      Math.cos(rad(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

export const formatPhone = (phone?: string): string => {
  return phone?.replace(/\D/g, "") || "";
};

export const formatAddress = (address?: Address): string => {
  if (!address) return "Address not available";
  if (address.formatted) return address.formatted;
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ];
  return parts.filter(Boolean).join(", ") || "Address not available";
};

export const formatUrl = (url?: string): string => {
  if (!url) return "";
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  return url;
};

export const getDirectionsUrl = (
  destination: Dealer | string | Coordinates | null,
  provider: MapProvider = "google"
): string => {
  if (!destination) return "#";
  let destinationParam = "";
  let baseUrl = "";

  const getCoords = (dest: Dealer | Coordinates): string | null => {
    let coordsToCheck: Coordinates | null = null;
    if ("coordinates" in dest) {
      coordsToCheck = dest.coordinates;
    } else if ("lat" in dest && "lng" in dest) {
      coordsToCheck = dest;
    }
    if (isValidCoordinates(coordsToCheck)) {
      return `${coordsToCheck.lat},${coordsToCheck.lng}`;
    }
    return null;
  };

  if (provider === "google") {
    baseUrl = "https://www.google.com/maps/dir/?api=1&destination=";
    if (typeof destination === "string") {
      destinationParam = encodeURIComponent(destination);
    } else if (typeof destination === "object" && destination !== null) {
      const coords = getCoords(destination);
      if (coords) {
        destinationParam = coords;
      } else if ("address" in destination && destination.address) {
        destinationParam = encodeURIComponent(
          destination.address.formatted || formatAddress(destination.address)
        );
      } else {
        return "#";
      }
    } else {
      return "#";
    }
  } else if (provider === "mapbox") {
    baseUrl = "https://search.mapbox.com/search/";
    if (typeof destination === "string") {
      destinationParam = encodeURIComponent(destination);
    } else if (typeof destination === "object" && destination !== null) {
      let primaryDest = "";
      if ("address" in destination && destination.address) {
        primaryDest =
          destination.address.formatted || formatAddress(destination.address);
      } else if ("name" in destination) {
        primaryDest = destination.name;
      }
      if (primaryDest) {
        destinationParam = encodeURIComponent(primaryDest);
      } else {
        const coords = getCoords(destination);
        if (coords) {
          const [lat, lng] = coords.split(",");
          destinationParam = encodeURIComponent(`${lng},${lat}`);
        } else {
          return "#";
        }
      }
    } else {
      return "#";
    }
    return `${baseUrl}${destinationParam}?source=framer`;
  } else {
    return "#";
  }
  return `${baseUrl}${destinationParam}`;
};

export const getInitialCenter = (
  provider: MapProvider
): Coordinates | [number, number] => {
  return provider === "google" ? DEFAULT_CENTER_GOOGLE : DEFAULT_CENTER_MAPBOX;
};

export const MAP_MARKER_SVG_BASE = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C9.92487 2 5 6.92487 5 13C5 21.5 16 30 16 30C16 30 27 21.5 27 13C27 6.92487 22.0751 2 16 2Z" fill="currentColor"/><circle cx="16" cy="13" r="4" fill="#FFFFFF"/></svg>`;

const decodeHtmlEntities = (text: string): string => {
  if (!text) return "";
  if (typeof document === "undefined") {
    return text
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "'");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

export const createEnhancedPopupContent = (
  dealer: Dealer,
  theme: any,
  distanceUnit: string
): string => {
  const addressText = dealer.address
    ? decodeHtmlEntities(
        dealer.address.formatted || formatAddress(dealer.address)
      )
    : "Address unavailable";
  const iconSpan = (name: string, color: string) =>
    `<span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle; margin-right: 4px; color: ${color};">${name}</span>`;
  return `<div style="font-family: ${
    theme.typography.fontFamily || "Geist, sans-serif"
  }; color: ${
    theme.colors.onSurface
  }; max-width: 220px; padding: 8px 12px; border-radius: 6px; font-size: 13px; line-height: 1.5;">
              <h3 style="margin: 0 0 6px; font-size: 15px; font-weight: 600; line-height: 1.3;">${decodeHtmlEntities(
                dealer.name
              )}</h3>
              <p style="margin: 0 0 8px; font-size: 12px; color: ${
                theme.colors.neutral?.[600] || "#6B7280"
              };">${addressText}</p>
              ${
                dealer.distance !== undefined && dealer.distance >= 0
                  ? `<div style="display: flex; align-items: center; margin-bottom: 6px; font-size: 12px; color: ${
                      theme.colors.neutral?.[700] || "#4B5563"
                    }; font-weight: 500;">${iconSpan(
                      "near_me",
                      theme.colors.primary
                    )} ${dealer.distance} ${distanceUnit} away</div>`
                  : ""
              }
              ${
                dealer.services && dealer.services.length > 0
                  ? `<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
                ${
                  dealer.services.some(
                    (s) =>
                      s.toLowerCase() === "sales" || s.toLowerCase() === "store"
                  )
                    ? `<span style="font-size: 11px; color: ${
                        theme.colors.sales
                      }; display: inline-flex; align-items: center;">${iconSpan(
                        "storefront",
                        theme.colors.sales
                      )}Sales</span>`
                    : ""
                }
                ${
                  dealer.services.some(
                    (s) =>
                      s.toLowerCase() === "service" ||
                      s.toLowerCase() === "repair"
                  )
                    ? `<span style="font-size: 11px; color: ${
                        theme.colors.service
                      }; display: inline-flex; align-items: center;">${iconSpan(
                        "settings",
                        theme.colors.service
                      )}Service</span>`
                    : ""
                }
                ${
                  dealer.services.includes("charging")
                    ? `<span style="font-size: 11px; color: ${
                        theme.colors.accent
                      }; display: inline-flex; align-items: center;">${iconSpan(
                        "bolt",
                        theme.colors.accent
                      )}Charging</span>`
                    : ""
                }
              </div>`
                  : ""
              }
            </div>`;
};

export const isValidCoordinates = (coords: any): coords is Coordinates => {
  return (
    coords &&
    typeof coords.lat === "number" &&
    typeof coords.lng === "number" &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng) &&
    coords.lat !== null &&
    coords.lng !== null &&
    isFinite(coords.lat) &&
    isFinite(coords.lng) &&
    Math.abs(coords.lat) <= 90 &&
    Math.abs(coords.lng) <= 180
  );
};
