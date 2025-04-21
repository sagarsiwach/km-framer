// Lib.tsx
import React from "react";

// ========== CONSTANTS ==========
// Default center remains useful, even if provider is Mapbox
export const DEFAULT_CENTER_GOOGLE = { lat: 15.2993, lng: 74.124 }; // Goa, India
export const DEFAULT_CENTER_MAPBOX = [74.124, 15.2993]; // Lng, Lat for Mapbox
export const DEFAULT_ZOOM = 11; // Adjusted default zoom
export const MAX_ZOOM = 18;
export const MIN_ZOOM = 4;
export const DEFAULT_SEARCH_RADIUS = 50; // km - Example

// SVG Icons - Ensure you have these named correctly
export const ICONS = {
  store:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.551 5.035C5.509 5.052 5.465 5.082 5.453 5.102C5.44 5.122 5.205 5.797 4.93 6.603L4.43 8.069L4.448 8.459C4.477 9.076 4.63 9.42 5.048 9.807L5.255 9.998V12.728C5.255 15.363 5.257 15.46 5.322 15.541L5.39 15.625H9.987H14.583L14.664 15.544L14.744 15.463L14.756 12.706L14.767 9.949L14.937 9.82L15.152 9.655C15.38 9.478 15.63 9.135 15.708 8.843C15.781 8.566 15.827 8.046 15.791 7.853C15.772 7.777 15.555 7.097 15.299 6.345C14.935 5.277 14.814 4.962 14.744 4.9C14.653 4.82 10.015 4.822 7.602 4.824C6.293 4.825 5.593 4.838 5.551 5.035ZM14.472 6.694C14.673 7.294 14.836 7.797 14.835 7.811C14.833 7.841 5.148 7.849 5.148 7.82C5.148 7.805 5.814 5.616 5.875 5.447C5.888 5.412 6.744 5.403 10.003 5.403L14.106 5.404L14.472 6.694ZM14.966 8.61C14.917 9.156 14.486 9.574 13.94 9.606C13.464 9.633 13.12 9.418 12.9 9.0L12.774 8.687L12.657 8.687C12.552 8.687 12.433 8.77 12.35 9.0C12.101 9.671 11.189 9.893 10.65 9.439C10.511 9.321 10.328 9.048 10.328 8.958C10.328 8.924 10.286 8.848 10.236 8.788C10.167 8.706 10.114 8.687 10.027 8.687C9.867 8.687 9.778 8.767 9.706 9.0C9.661 9.143 9.597 9.239 9.461 9.374C9.135 9.693 8.712 9.763 8.313 9.564C8.054 9.434 7.902 9.27 7.768 8.974C7.661 8.738 7.592 8.687 7.427 8.687C7.299 8.687 7.2 8.784 7.117 9.008C7.038 9.22 6.816 9.474 6.625 9.573C6.407 9.687 6.004 9.701 5.744 9.592C5.504 9.492 5.266 9.286 5.157 9.068C5.081 8.914 5 8.46 5.035 8.424C5.045 8.414 7.288 8.406 10.019 8.406H14.985L14.966 8.61ZM10.989 10.015C11.599 10.348 12.325 10.252 12.821 9.772L13.008 9.591L13.204 9.776C13.844 10.381 14.86 10.354 15.437 9.717L15.563 9.577L15.689 9.717C15.981 10.039 16.435 10.227 16.882 10.209L17.159 10.197L17.159 12.618L17.159 15.04H16.148H15.137V13.21V11.381L15.05 11.291L14.963 11.208H12.507H10.051L9.948 11.311L9.845 11.416V13.228V15.04H8.857H7.868L7.859 12.627L7.85 10.215H8.09C8.572 10.215 8.976 10.052 9.268 9.739L9.436 9.558L9.615 9.73C9.714 9.834 9.879 9.959 9.989 10.015Z" fill="currentColor"/></svg>',
  bolt: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.333 18.333V12.5H5.833C5.462 12.5 5.19 12.228 5.19 11.857C5.19 11.486 5.462 11.214 5.833 11.214H8.333V5.857C8.333 5.486 8.605 5.214 8.976 5.214C9.186 5.214 9.375 5.32 9.488 5.503L14.488 11.932C14.678 12.235 14.608 12.613 14.305 12.803C14.208 12.867 14.102 12.898 14 12.898H11.667V18.333C11.667 18.704 11.395 18.976 11.024 18.976C10.653 18.976 10.381 18.704 10.381 18.333V18.143L10.464 17.964L13.464 12.08H11.807L8.333 18.333Z" fill="currentColor"/></svg>',
  search:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.209 13.466C15.473 12.03 16.25 10.11 16.25 8.005C16.25 3.998 13.002 0.75 8.995 0.75C4.988 0.75 1.74 3.998 1.74 8.005C1.74 12.012 4.988 15.26 8.995 15.26C10.737 15.26 12.32 14.695 13.59 13.788L17.844 18.041C18.234 18.431 18.867 18.431 19.257 18.041C19.647 17.651 19.647 17.018 19.257 16.628L14.998 12.37C14.76 12.669 14.49 12.948 14.209 13.213V13.466ZM8.995 13.24C6.102 13.24 3.76 10.898 3.76 8.005C3.76 5.112 6.102 2.77 8.995 2.77C11.888 2.77 14.23 5.112 14.23 8.005C14.23 10.898 11.888 13.24 8.995 13.24Z" fill="currentColor"/></svg>',
  close:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.944 2.944C3.334 2.553 3.967 2.553 4.357 2.944L10 8.586L15.643 2.944C16.033 2.553 16.666 2.553 17.056 2.944C17.447 3.334 17.447 3.967 17.056 4.357L11.414 10L17.056 15.643C17.447 16.033 17.447 16.666 17.056 17.056C16.666 17.447 16.033 17.447 15.643 17.056L10 11.414L4.357 17.056C3.967 17.447 3.334 17.447 2.944 17.056C2.553 16.666 2.553 16.033 2.944 15.643L8.586 10L2.944 4.357C2.553 3.967 2.553 3.334 2.944 2.944Z" fill="currentColor"/></svg>',
  my_location:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1_1)"><path d="M9.167 19.125V17.458C7.431 17.264 5.941 16.545 4.698 15.302C3.455 14.059 2.736 12.569 2.542 10.833H0.875V9.167H2.542C2.736 7.431 3.455 5.941 4.698 4.698C5.941 3.455 7.431 2.736 9.167 2.542V0.875H10.833V2.542C12.569 2.736 14.059 3.455 15.302 4.698C16.545 5.941 17.264 7.431 17.458 9.167H19.125V10.833H17.458C17.264 12.569 16.545 14.059 15.302 15.302C14.059 16.545 12.569 17.264 10.833 17.458V19.125H9.167ZM10 15.833C11.611 15.833 12.986 15.264 14.125 14.125C15.264 12.986 15.833 11.611 15.833 10C15.833 8.389 15.264 7.014 14.125 5.875C12.986 4.736 11.611 4.167 10 4.167C8.389 4.167 7.014 4.736 5.875 5.875C4.736 7.014 4.167 8.389 4.167 10C4.167 11.611 4.736 12.986 5.875 14.125C7.014 15.264 8.389 15.833 10 15.833ZM10 13.333C9.083 13.333 8.299 13.007 7.646 12.354C6.993 11.701 6.667 10.917 6.667 10C6.667 9.083 6.993 8.299 7.646 7.646C8.299 6.993 9.083 6.667 10 6.667C10.917 6.667 11.701 6.993 12.354 7.646C13.007 8.299 13.333 9.083 13.333 10C13.333 10.917 13.007 11.701 12.354 12.354C11.701 13.007 10.917 13.333 10 13.333Z" fill="currentColor"/></g><defs><clipPath id="clip0_1_1"><rect width="20" height="20" fill="white"/></clipPath></defs></svg>',
  arrow_back:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.466 9.465C6.176 9.754 6.176 10.246 6.466 10.535L10.911 14.98C11.201 15.27 11.693 15.27 11.982 14.98C12.272 14.691 12.272 14.199 11.982 13.91L8.071 10L11.982 6.09C12.272 5.801 12.272 5.309 11.982 5.02C11.693 4.73 11.201 4.73 10.911 5.02L6.466 9.465ZM17.5 9.375C17.914 9.375 18.25 9.66 18.25 10C18.25 10.34 17.914 10.625 17.5 10.625H7.5C7.086 10.625 6.75 10.34 6.75 10C6.75 9.66 7.086 9.375 7.5 9.375H17.5Z" fill="currentColor"/></svg>',
  arrow_forward:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.534 9.465C13.824 9.754 13.824 10.246 13.534 10.535L9.089 14.98C8.799 15.27 8.307 15.27 8.018 14.98C7.728 14.691 7.728 14.199 8.018 13.91L11.929 10L8.018 6.09C7.728 5.801 7.728 5.309 8.018 5.02C8.307 4.73 8.799 4.73 9.089 5.02L13.534 9.465ZM2.5 9.375C2.086 9.375 1.75 9.66 1.75 10C1.75 10.34 2.086 10.625 2.5 10.625H12.5C12.914 10.625 13.25 10.34 13.25 10C13.25 9.66 12.914 9.375 12.5 9.375H2.5Z" fill="currentColor"/></svg>',
  call: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.334 14.034C16.14 13.611 14.9 13.275 13.734 13.04C13.371 12.975 12.987 13.071 12.717 13.341L11.181 14.877C8.775 13.65 6.351 11.223 5.121 8.82L6.66 7.284C6.93 7.014 7.026 6.63 6.96 6.267C6.726 5.101 6.39 3.858 5.967 2.667C5.862 2.331 5.559 2.097 5.199 2.097H2.751C2.331 2.097 2 2.43 2 2.847C2 11.1 8.898 18 17.151 18C17.571 18 17.901 17.667 17.901 17.247V14.802C17.904 14.442 17.67 14.139 17.334 14.034Z" fill="currentColor"/></svg>',
  language:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 18.333C14.602 18.333 18.333 14.602 18.333 10C18.333 5.398 14.602 1.667 10 1.667C5.398 1.667 1.667 5.398 1.667 10C1.667 14.602 5.398 18.333 10 18.333ZM9.05 16.649C8.578 15.772 8.25 14.786 8.098 13.75H11.902C11.75 14.786 11.422 15.772 10.95 16.649C10.66 17.21 10.34 17.73 10 18.198C9.66 17.73 9.34 17.21 9.05 16.649ZM8.333 12.083V10.833H5.54C5.449 11.235 5.385 11.651 5.35 12.083H8.333ZM9.167 12.083H10.833V10.833H9.167V12.083ZM11.667 12.083H14.65C14.615 11.651 14.551 11.235 14.46 10.833H11.667V12.083ZM14.65 9.167H11.667V7.917H14.46C14.551 8.349 14.615 8.765 14.65 9.167ZM10.833 9.167H9.167V7.917H10.833V9.167ZM8.333 9.167H5.35C5.385 8.765 5.449 8.349 5.54 7.917H8.333V9.167ZM10.95 3.351C11.422 4.228 11.75 5.214 11.902 6.25H8.098C8.25 5.214 8.578 4.228 9.05 3.351C9.34 2.79 9.66 2.27 10 1.802C10.34 2.27 10.66 2.79 10.95 3.351ZM13.963 13.75C14.67 13.239 15.239 12.57 15.631 11.803C16.02 11.041 16.232 10.183 16.25 9.286L16.25 9.167H16.667C17.26 9.167 17.822 8.978 18.264 8.642C18.292 8.62 18.318 8.595 18.333 8.566V7.917H16.667C16.596 7.039 16.371 6.205 16.018 5.447C15.587 4.523 14.928 3.746 14.119 3.188C13.531 2.776 12.88 2.455 12.19 2.243L12.097 2.214L11.902 2.463C11.546 2.917 11.23 3.415 10.95 3.938C10.67 3.415 10.354 2.917 10 2.463L9.803 2.214L9.71 2.243C9.02 2.455 8.369 2.776 7.781 3.188C6.972 3.746 6.313 4.523 5.882 5.447C5.529 6.205 5.304 7.039 5.233 7.917H3.567V8.566C3.582 8.595 3.608 8.62 3.636 8.642C4.078 8.978 4.64 9.167 5.233 9.167H5.65L5.648 9.286C5.668 10.183 5.88 11.041 6.269 11.803C6.661 12.57 7.23 13.239 7.937 13.75H13.963Z" fill="currentColor"/></svg>',
  directions_car:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.769 4.195C15.468 4.131 15.145 4.153 14.88 4.25L10.07 6.056C9.99 6.085 9.916 6.127 9.85 6.18L6.18 9.85C6.127 9.916 6.085 9.99 6.056 10.07L4.25 14.88C4.153 15.145 4.131 15.468 4.195 15.769C4.258 16.07 4.421 16.338 4.659 16.534L4.66 16.535C4.94 16.76 5.29 16.854 5.633 16.791L10.82 15.886C10.906 15.872 10.989 15.842 11.063 15.798L15.798 11.063C15.842 10.989 15.872 10.906 15.886 10.82L16.791 5.633C16.854 5.29 16.76 4.94 16.535 4.66L16.534 4.659C16.338 4.421 16.07 4.258 15.769 4.195ZM14.667 6.195L10.475 7.041L12.959 9.525L13.805 5.333L14.667 6.195ZM5.333 13.805L6.195 14.667L10.387 13.821L7.903 11.337L5.333 13.805ZM13.542 10.625L10.625 13.542L9.375 12.292L12.292 9.375L13.542 10.625Z" fill="currentColor"/></svg>',
  map_pin:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 17.5C10 17.5 15 12.5 15 8.75C15 6.134 12.761 4.167 10 4.167C7.239 4.167 5 6.134 5 8.75C5 12.5 10 17.5 10 17.5ZM10 10.833C11.15 10.833 12.083 9.9 12.083 8.75C12.083 7.6 11.15 6.667 10 6.667C8.85 6.667 7.917 7.6 7.917 8.75C7.917 9.9 8.85 10.833 10 10.833Z" fill="currentColor"/></svg>',
  error:
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 18.333C14.602 18.333 18.333 14.602 18.333 10C18.333 5.398 14.602 1.667 10 1.667C5.398 1.667 1.667 5.398 1.667 10C1.667 14.602 5.398 18.333 10 18.333ZM9.167 14.167V12.5H10.833V14.167H9.167ZM9.167 10.833V5.833H10.833V10.833H9.167Z" fill="currentColor"/></svg>',
};

// Google Map Styles - Keep available even if default is Mapbox
// Includes the monochrome style added previously
export const GOOGLE_MAP_STYLES = [
  { id: "standard", name: "Standard", styles: [] },
  // ... other styles like silver, dark, neutral_blue ...
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
export const SAMPLE_DEALERS = [
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
    coordinates: {
      lat: 15.3640954,
      lng: 73.9459574,
    },
    contact: {
      phone: "8574600700",
      email: "enquiry@kabiramobility.com",
      website: "https://www.kabiramobility.com",
    },
    hours: [
      {
        day: "Monday",
        open: "10:00",
        close: "17:00",
      },
      {
        day: "Tuesday",
        open: "10:00",
        close: "17:00",
      },
      {
        day: "Wednesday",
        open: "10:00",
        close: "17:00",
      },
      {
        day: "Thursday",
        open: "10:00",
        close: "17:00",
      },
      {
        day: "Friday",
        open: "10:00",
        close: "17:00",
      },
      {
        day: "Saturday",
        open: "10:00",
        close: "17:00",
      },
      {
        day: "Sunday",
        open: "Closed",
        close: "Closed",
      },
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
    coordinates: {
      lat: 17.4375,
      lng: 78.4482,
    },
    contact: {
      phone: "8574600700",
      email: "support.hyd@greenvolt.com",
      website: "https://www.kabiramobility.com",
    },
    hours: [
      {
        day: "Monday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Tuesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Wednesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Thursday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Friday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Saturday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Sunday",
        open: "09:00",
        close: "16:00",
      },
    ],
    services: ["charging"],
    active: true,
    featured: true,
    imageUrl:
      "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM3000_apj2tj.png",
  },
  {
    id: "3",
    name: "PowerUp Service Center Pune",
    address: {
      line1: "MIDC Area, Phase 1",
      line2: "Near Tata Motors",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411019",
      country: "India",
      formatted:
        "MIDC Area, Phase 1, Near Tata Motors, Pune, Maharashtra, 411019, India",
    },
    coordinates: {
      lat: 18.5832,
      lng: 73.8479,
    },
    contact: {
      phone: "8574600700",
      email: "service.pune@powerup.in",
      website: "https://www.kabiramobility.com",
    },
    hours: [
      {
        day: "Monday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Tuesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Wednesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Thursday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Friday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Saturday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Sunday",
        open: "09:00",
        close: "16:00",
      },
    ],
    services: ["service"],
    active: true,
    featured: true,
    imageUrl:
      "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM3000_apj2tj.png",
  },
  {
    id: "4",
    name: "EV Next Dealer Chennai",
    address: {
      line1: "Anna Salai, T Nagar",
      line2: "Above Pothys",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600017",
      country: "India",
      formatted:
        "Anna Salai, T Nagar, Above Pothys, Chennai, Tamil Nadu, 600017, India",
    },
    coordinates: {
      lat: 13.0475,
      lng: 80.258,
    },
    contact: {
      phone: "8574600700",
      email: "info.chennai@evnext.co.in",
      website: "https://www.kabiramobility.com",
    },
    hours: [
      {
        day: "Monday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Tuesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Wednesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Thursday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Friday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Saturday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Sunday",
        open: "09:00",
        close: "16:00",
      },
    ],
    services: ["sales"],
    active: true,
    featured: true,
    imageUrl:
      "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM3000_apj2tj.png",
  },
  {
    id: "5",
    name: "ChargePoint Bengaluru",
    address: {
      line1: "Koramangala 4th Block",
      line2: "Near Forum Mall",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      country: "India",
      formatted:
        "Koramangala 4th Block, Near Forum Mall, Bengaluru, Karnataka, 560034, India",
    },
    coordinates: {
      lat: 12.9352,
      lng: 77.6245,
    },
    contact: {
      phone: "8574600700",
      email: "support@chargepointindia.com",
      website: "https://www.kabiramobility.com",
    },
    hours: [
      {
        day: "Monday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Tuesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Wednesday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Thursday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Friday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Saturday",
        open: "09:00",
        close: "19:00",
      },
      {
        day: "Sunday",
        open: "09:00",
        close: "16:00",
      },
    ],
    services: ["sales", "service", "charging"],
    active: true,
    featured: true,
    imageUrl:
      "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM3000_apj2tj.png",
  },
];

// ========== TYPESCRIPT TYPES ==========
export interface Coordinates {
  lat: number;
  lng: number;
}
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  formatted: string; // Ensure this is always present
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
  coordinates: Coordinates;
  contact?: Contact;
  hours?: Hours[];
  services?: string[]; // e.g., ["sales", "service", "charging"]
  rating?: number;
  distance?: number; // Calculated dynamically
  imageUrl?: string; // Optional image URL for detail view
}
export type MapProvider = "google" | "mapbox";
export type Location = Coordinates | null;

// ========== UTILITY FUNCTIONS ==========

// hexToRgba (Keep as is)
export const hexToRgba = (hex, alpha) => {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(0,0,0,${alpha})`;
  } // Fallback for invalid hex
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// calculateDistance (Keep as is)
export const calculateDistance = (
  loc1: Location,
  loc2: Coordinates,
  unit = "km"
): number | undefined => {
  // Return undefined if calculation impossible
  if (
    !loc1 ||
    !loc2 ||
    isNaN(loc1.lat) ||
    isNaN(loc1.lng) ||
    isNaN(loc2.lat) ||
    isNaN(loc2.lng)
  )
    return undefined;
  const rad = (n) => (n * Math.PI) / 180;
  const R = unit === "miles" ? 3958.8 : 6371; // Earth radius in km or miles
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
  return Math.round(distance * 10) / 10; // Round to one decimal place
};

// formatPhone (Keep as is)
export const formatPhone = (phone?: string): string => {
  // Add more sophisticated formatting if needed
  return phone || "";
};

// formatAddress (Keep as is, rely on 'formatted')
export const formatAddress = (address?: Address): string => {
  if (!address) return "Address not available";
  return address.formatted;
};

// formatUrl (Keep as is)
export const formatUrl = (url?: string): string => {
  if (!url) return "";
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  return url;
};

// getDirectionsUrl (Keep as is)
export const getDirectionsUrl = (
  destination: Dealer | string | Coordinates | null,
  provider: MapProvider = "google" // Default to google for fallback
): string => {
  if (!destination) return "#";

  let destinationParam = "";
  let baseUrl = "";

  if (provider === "google") {
    baseUrl = "https://www.google.com/maps/dir/?api=1&destination=";
    if (typeof destination === "string") {
      destinationParam = encodeURIComponent(destination);
    } else if (
      typeof destination === "object" &&
      "coordinates" in destination
    ) {
      destinationParam = `${destination.coordinates.lat},${destination.coordinates.lng}`;
    } else if (typeof destination === "object" && "lat" in destination) {
      destinationParam = `${destination.lat},${destination.lng}`;
    } else if (typeof destination === "object" && "address" in destination) {
      destinationParam = encodeURIComponent(destination.address.formatted);
    } else {
      return "#";
    } // Invalid destination object
  } else {
    // mapbox
    // Use search link for simplicity, focuses map on the location
    baseUrl = "https://search.mapbox.com/search/";
    if (typeof destination === "string") {
      destinationParam = encodeURIComponent(destination);
    } else if (
      typeof destination === "object" &&
      "coordinates" in destination
    ) {
      // Mapbox search prefers name or address for context, but coords work too
      // destinationParam = encodeURIComponent(`${destination.coordinates.lng},${destination.coordinates.lat}`)
      destinationParam = encodeURIComponent(
        destination.address?.formatted ||
          `${destination.coordinates.lng},${destination.coordinates.lat}`
      );
    } else if (typeof destination === "object" && "lat" in destination) {
      destinationParam = encodeURIComponent(
        `${destination.lng},${destination.lat}`
      );
    } else if (typeof destination === "object" && "address" in destination) {
      destinationParam = encodeURIComponent(destination.address.formatted);
    } else {
      return "#";
    } // Invalid destination object
    return `${baseUrl}${destinationParam}?source=framer`; // Added source param
  }
  return `${baseUrl}${destinationParam}`;
};

// Simple Icon Component (Keep as is, ensure SVG content is correct)
export const Icon = ({
  name,
  color = "currentColor",
  size = 20, // Default size updated
  style = {},
}) => {
  const svgContent = ICONS[name] || "";
  // Basic color replacement, might need refinement for complex SVGs
  const coloredSvg = svgContent.replace(/currentColor/g, color);

  const iconStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: `${size}px`,
    height: `${size}px`,
    color: color, // Set color for potential parent inheritance or specific SVG parts
    flexShrink: 0, // Prevent icon shrinking in flex layouts
    verticalAlign: "middle", // Align better with text
    ...style,
  };
  return (
    <div
      style={iconStyle}
      dangerouslySetInnerHTML={{ __html: coloredSvg }}
      aria-hidden="true" // Hide decorative icons from screen readers
    />
  );
};

// getInitialCenter (Keep as is)
export const getInitialCenter = (
  provider: MapProvider
): Coordinates | [number, number] => {
  return provider === "google" ? DEFAULT_CENTER_GOOGLE : DEFAULT_CENTER_MAPBOX;
};

export const MAP_MARKER_SVG = `
<svg width="34" height="48" viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17 0C7.611 0 0 7.597 0 16.966C0 27.447 14.976 46.642 15.618 47.308C16.302 48 17.698 48 18.382 47.308C19.024 46.642 34 27.447 34 16.966C34 7.597 26.389 0 17 0Z" fill="currentColor"/>
</svg>
`;

// Helper function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (typeof document === "undefined") {
    // Basic decoding for non-browser environments (like SSR or tests)
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

// Enhanced createMapboxPopupContent function for better-looking popups
export const createEnhancedPopupContent = (
  dealer: Dealer,
  theme: any,
  distanceUnit: string
): string => `
  <div style="font-family: ${
    theme.typography.fontFamily || "Geist, sans-serif"
  }; color: ${
  theme.colors.onSurface
}; max-width: 220px; padding: 8px 12px; border-radius: 6px;">
    <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 600; line-height: 1.3;">${decodeHtmlEntities(
      dealer.name
    )}</h3>
    <p style="margin: 0 0 6px; font-size: 12px; color: ${
      theme.colors.neutral[600]
    }; line-height: 1.4;">${decodeHtmlEntities(dealer.address.formatted)}</p>
    ${
      dealer.distance !== undefined && dealer.distance >= 0
        ? `<div style="display: flex; align-items: center; margin-top: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${theme.colors.success}; margin-right: 6px;"></span>
        <span style="font-size: 12px; color: ${theme.colors.neutral[600]}; font-weight: 500;">${dealer.distance} ${distanceUnit} away</span>
      </div>`
        : ""
    }
    ${
      dealer.services && dealer.services.includes("charging")
        ? `<div style="margin-top: 6px; display: inline-block; padding: 2px 8px; background-color: ${hexToRgba(
            theme.colors.success,
            0.1
          )}; color: ${
            theme.colors.success
          }; border-radius: 4px; font-size: 11px; font-weight: 500;">Charging Available</div>`
        : ""
    }
  </div>`;
