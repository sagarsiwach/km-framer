// Adapted from booking-form/1. components/1. ui/LocationSearch.tsx
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
// Removed Framer Motion imports

// Assuming searchLocationFromPricing is adapted and imported if needed
// import { searchLocationFromPricing } from '../../utils/api'; // Example path

// Helper Function to Format Location (copied from original)
const formatLocationString = (feature) => {
  if (!feature) return "";

  let pincode = "";
  let city = "";
  let state = "";
  const country = "India";

  if (feature.context) {
    feature.context.forEach((item) => {
      const type = item.id.split(".")[0];
      switch (type) {
        case "postcode":
          pincode = item.text;
          break;
        case "locality": // Often used for neighborhoods
          if (!city) city = item.text;
          break;
        case "place": // Often used for cities/towns
          city = item.text;
          break;
        case "region": // Often used for states/provinces
          state = item.text;
          break;
      }
    });
  }

  // If city wasn't found in context, check the main feature type/text
  if (!city && feature.place_type?.includes("place")) {
    city = feature.text;
  }

  // Check if the main feature text itself is the pincode if not found in context
  if (!pincode && /^\d{6}$/.test(feature.text)) {
    pincode = feature.text;
  }

  // Construct the string, prioritizing pincode if available
  const parts = [city, state].filter(Boolean); // Pincode added separately
  let formatted = pincode ? `${pincode}` : '';
  if (parts.length > 0) {
      formatted += (formatted ? ", " : "") + parts.join(", ");
  }

  // Add country and clean up
  if (formatted) {
    formatted += ", " + country;
  } else if (feature.place_name?.toLowerCase().includes("india")) {
    formatted = feature.place_name; // Fallback
  } else {
    formatted = feature.place_name ? `${feature.place_name}, ${country}` : country;
  }

  formatted = formatted.replace(/, ,/g, ",").replace(/^, |, $/g, "").trim();
  return formatted;
};


// Location Icon Function (basic SVG, status styling via Tailwind)
export function LocationIcon({ locationStatus = "idle" }) {
  const iconSize = 20;
  const colorClasses =
    locationStatus === "success" ? "text-green-600" :
    locationStatus === "error" ? "text-red-500" :
    "text-neutral-700";
  const animationClass = locationStatus === "searching" ? "animate-pulse" : ""; // Example animation

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={`${iconSize}px`}
      viewBox="0 -960 960 960"
      width={`${iconSize}px`}
      className={`${colorClasses} ${animationClass} block`} // Apply Tailwind classes
      fill="currentColor"
    >
      <path d="M440-42v-80q-125-14-214.5-103.5T122-440H42v-80h80q14-125 103.5-214.5T440-838v-80h80v80q125 14 214.5 103.5T838-520h80v80h-80q-14 125-103.5 214.5T520-122v80h-80Zm40-158q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-120q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z" />
    </svg>
  );
}

// Main LocationField Component (Adapted)
export function LocationField({
  value,
  onChange, // Expects the new value string directly
  onFocus,
  onBlur,
  error,
  showError = false,
  isFocused = false, // Renamed from focusedField for clarity
  inputRef, // Pass ref from parent if needed
  locationStatus = "idle",
  setLocationStatus = () => {},
  searchLocation = async () => [], // Expects a function returning features
  getCurrentLocation = () => {}, // Expects a function
  enableLocationServices = true,
  debugMode = false,
  className = "",
  label = "Location",
  required = false,
  placeholder = "Area / Pincode / City",
}) {
  const internalInputRef = useRef(null); // Use internal ref if none provided
  const componentInputRef = inputRef || internalInputRef; // Decide which ref to use
  const locationResultsRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const isSelectingResult = useRef(false);
  const dropdownContainerRef = useRef(null); // Ref for the input's container div
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [internalShowResults, setInternalShowResults] = useState(false);
  const [internalResults, setInternalResults] = useState([]);
  const [portalContainer, setPortalContainer] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1); // For keyboard nav

  // Setup portal container
  useEffect(() => {
    if (typeof document !== "undefined") {
      let container = document.getElementById("location-dropdown-portal");
      if (!container) {
        container = document.createElement("div");
        container.id = "location-dropdown-portal";
        // Basic portal styling, can be adjusted
        container.style.position = "absolute";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "0"; // Only takes space needed by children
        container.style.zIndex = "50"; // Ensure it's above other content
        container.style.pointerEvents = "none"; // Allow clicks to pass through container itself
        document.body.appendChild(container);
      }
      setPortalContainer(container);
    }
  }, []);

  // Update dropdown position
  useEffect(() => {
    const updatePos = () => {
      if (componentInputRef.current && internalShowResults) {
        const rect = componentInputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8, // Position below input + margin
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    if (internalShowResults) {
        updatePos(); // Initial position
        window.addEventListener("scroll", updatePos, true); // Use capture phase for scroll
        window.addEventListener("resize", updatePos);
    }

    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [internalShowResults, componentInputRef]);


  // Reset activeIndex when dropdown opens/results change
  useEffect(() => {
    setActiveIndex(internalResults?.length > 0 ? 0 : -1);
  }, [internalShowResults, internalResults]);

  const handleFocus = () => {
    if (onFocus) onFocus();
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    // Show results if input has value and results exist
    if (value && value.length >= 3 && internalResults.length > 0) {
      setInternalShowResults(true);
    }
  };

  const handleBlur = async () => {
    if (isSelectingResult.current) {
      isSelectingResult.current = false;
      return;
    }
    if (onBlur) onBlur();

    const pincodeRegex = /^\d{6}$/;
    if (pincodeRegex.test(value) && !internalShowResults) { // Only search pincode if dropdown isn't open
      setLocationStatus("searching");
      try {
        const results = await searchLocation(value);
        if (results && results.length > 0) {
          handleResultSelection(results[0]); // Auto-select first result for pincode
          setLocationStatus("success");
        } else {
          if (debugMode) console.log(`No results for pincode: ${value}`);
          setLocationStatus("error"); // Keep value, let parent validation handle
        }
      } catch (error) {
        if (debugMode) console.error("Pincode search error:", error);
        setLocationStatus("error");
      } finally {
        setInternalShowResults(false); // Ensure dropdown is hidden after search attempt
      }
    } else {
      // Hide dropdown after a delay if not a pincode search
      blurTimeoutRef.current = setTimeout(() => {
        setInternalShowResults(false);
      }, 200); // Delay to allow clicks on dropdown items
    }
  };

  // Helper to handle selection
  const handleResultSelection = (feature) => {
    const formattedValue = formatLocationString(feature);
    onChange(formattedValue); // Update parent state
    setInternalResults([]);
    setInternalShowResults(false);
    setLocationStatus("success"); // Set status on successful selection
    // Refocus the input after selection
    componentInputRef.current?.focus();
  };

  // Handles clicking on a result
  const handleResultClick = (feature) => {
    handleResultSelection(feature);
  };

  // Handle input change
  const handleInputChange = async (e) => {
    const currentValue = e.target.value;
    onChange(currentValue); // Update parent state immediately

    if (currentValue.length >= 3) {
      setLocationStatus("searching");
      try {
        const results = await searchLocation(currentValue);
        setInternalResults(results || []);
        setInternalShowResults(results && results.length > 0);
        setLocationStatus(results && results.length > 0 ? "idle" : "error");
      } catch (err) {
        if (debugMode) console.error("Search error:", err);
        setInternalResults([]);
        setInternalShowResults(false);
        setLocationStatus("error");
      }
    } else {
      setInternalResults([]);
      setInternalShowResults(false);
      setLocationStatus("idle");
    }
  };

  // Handle keyboard navigation within dropdown
  const handleInputKeyDown = (e) => {
    if (!internalShowResults || !internalResults?.length) return;

    let newIndex = activeIndex;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        newIndex = (activeIndex + 1) % internalResults.length;
        break;
      case "ArrowUp":
        e.preventDefault();
        newIndex = activeIndex <= 0 ? internalResults.length - 1 : activeIndex - 1;
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = internalResults.length - 1;
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < internalResults.length) {
          handleResultClick(internalResults[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setInternalShowResults(false);
        break;
      default: return; // Don't change index for other keys
    }
     if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
     }
  };

  // Prevent blur when clicking on dropdown
  const handleDropdownMouseDown = (e) => {
    e.preventDefault(); // Prevent input from losing focus
    isSelectingResult.current = true; // Flag that selection is in progress
  };

  // Placeholder classes - apply Tailwind here
  const containerClasses = `relative ${className}`;
  const labelClasses = "block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2";
  const inputWrapperClasses = "relative flex items-center w-full h-16 rounded-lg border bg-neutral-50 transition-all duration-200 ease-in-out";
  const inputWrapperStateClasses = error && showError ? 'border-red-500' : isFocused ? 'border-blue-500 ring-3 ring-blue-200' : 'border-neutral-700'; // Adjusted border color
  const inputClasses = "w-full h-full border-none outline-none px-5 pr-16 text-base bg-transparent text-neutral-700 placeholder-neutral-400"; // Adjusted padding
  const iconButtonClasses = `absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 ${enableLocationServices && locationStatus !== 'searching' ? 'cursor-pointer opacity-100' : 'cursor-default opacity-50'}`;
  const errorClasses = "text-xs text-red-500 mt-1";
  const dropdownListClasses = "absolute max-h-60 overflow-y-auto bg-white border border-neutral-200 rounded-lg shadow-lg z-50 font-geist pointer-events-auto"; // Added pointer-events-auto
  const dropdownItemClasses = "px-4 py-3 cursor-pointer border-b border-neutral-100 last:border-b-0 text-sm text-neutral-700 whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-100 ease-in-out";
  const dropdownItemActiveClasses = "bg-neutral-100";


  return (
    <div className={containerClasses} ref={dropdownContainerRef}>
      <label htmlFor="location-input" className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className={`${inputWrapperClasses} ${inputWrapperStateClasses}`}>
        <input
          ref={componentInputRef}
          type="text"
          name="location"
          id="location-input"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          className={inputClasses}
          aria-controls="location-dropdown-listbox"
          aria-activedescendant={activeIndex >= 0 ? `location-option-${internalResults[activeIndex]?.id || activeIndex}` : undefined}
          aria-expanded={internalShowResults}
          aria-autocomplete="list"
          role="combobox"
          onKeyDown={handleInputKeyDown}
        />
        <button // Use button for the icon for better accessibility
          type="button"
          className={iconButtonClasses}
          onClick={enableLocationServices && locationStatus !== "searching" ? getCurrentLocation : undefined}
          disabled={!enableLocationServices || locationStatus === "searching"}
          title={enableLocationServices ? "Use current location" : "Location services disabled or busy"}
          aria-label="Use current location"
        >
          <LocationIcon locationStatus={locationStatus} />
        </button>
      </div>

      {error && showError && (
        <p className={errorClasses} role="alert">
          {error}
        </p>
      )}

      {/* Location Results Dropdown (Portal) */}
      {portalContainer && internalShowResults && internalResults.length > 0 &&
        createPortal(
          // Using basic div instead of motion
          <div
            ref={locationResultsRef}
            style={{ // Position using state
              position: "absolute",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
            className={dropdownListClasses}
            onMouseDown={handleDropdownMouseDown} // Prevent blur on click inside
            role="listbox"
            id="location-dropdown-listbox"
            tabIndex={-1} // Not focusable itself
          >
            {internalResults.map((feature, index) => (
              <div
                key={feature.id || index}
                id={`location-option-${feature.id || index}`}
                role="option"
                aria-selected={activeIndex === index}
                className={`${dropdownItemClasses} ${activeIndex === index ? dropdownItemActiveClasses : 'hover:bg-neutral-50'}`} // Add hover effect
                onMouseEnter={() => setActiveIndex(index)} // Highlight on hover
                // Use onClick for selection
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isSelectingResult.current = false; // Reset flag handled in click
                    handleResultClick(feature);
                }}
                ref={activeIndex === index ? (el) => el?.scrollIntoView({ block: "nearest" }) : undefined}
                title={feature.place_name}
              >
                {feature.place_name}
              </div>
            ))}
          </div>,
          portalContainer
        )}
    </div>
  );
}
