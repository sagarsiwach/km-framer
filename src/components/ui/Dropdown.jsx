// Adapted from booking-form/1. components/1. ui/Dropdown.tsx
import React, { useState, useRef, useEffect } from "react";

/**
 * Basic Dropdown component ready for Tailwind styling.
 */
export default function Dropdown(props) {
  const {
    label = "Label",
    options = [],
    value = "",
    onChange,
    placeholder = "Select an option",
    description = "",
    error = "",
    required = false,
    disabled = false,
    // borderColor, // Removed for Tailwind
    // focusBorderColor, // Removed for Tailwind
    // errorBorderColor, // Removed for Tailwind
    // labelColor, // Removed for Tailwind
    id,
    name,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const listboxRef = useRef(null);
  const uniqueId =
    id || `dropdown-${Math.random().toString(36).substring(2, 9)}`;
  const listboxId = `${uniqueId}-listbox`;

  // Find the selected option for display
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   // Update activeIndex when value changes or options load
   useEffect(() => {
    const index = options.findIndex((option) => option.value === value);
    setActiveIndex(index > -1 ? index : 0); // Default to first item if value not found or empty
  }, [value, options]);


  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      let newIndex = activeIndex;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          newIndex = activeIndex < options.length - 1 ? activeIndex + 1 : 0;
          break;
        case "ArrowUp":
          e.preventDefault();
          newIndex = activeIndex > 0 ? activeIndex - 1 : options.length - 1;
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = options.length - 1;
          break;
        case "Enter":
        case " ": // Space selects
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < options.length) {
            handleOptionClick(options[activeIndex].value);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        default:
            // Allow typing to select options (basic implementation)
            const char = e.key.toLowerCase();
            const foundIndex = options.findIndex(opt => opt.label.toLowerCase().startsWith(char));
            if (foundIndex > -1) {
                newIndex = foundIndex;
            }
          break;
      }
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };
    // Attach keydown listener to the trigger button when open
    const triggerElement = dropdownRef.current?.querySelector(`#${uniqueId}`);
    triggerElement?.addEventListener("keydown", handleKeyDown);
    return () => triggerElement?.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, options]);


  // Scroll active option into view
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listboxRef.current) {
      const activeOption = listboxRef.current.children[activeIndex];
      activeOption?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, activeIndex]);

  const handleOptionClick = (optionValue) => {
    if (onChange) {
      onChange(optionValue); // Pass the value directly
    }
    setIsOpen(false);
    // Refocus the button after selection
    dropdownRef.current?.querySelector(`#${uniqueId}`)?.focus();
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Chevron icon (basic SVG)
  const chevronIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`} // Example Tailwind
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor" // Use text color
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Placeholder classes - apply Tailwind here
  const containerClasses = `relative flex flex-col mb-4 w-full ${className}`;
  const labelContainerClasses = "mb-2";
  const labelClasses = "block text-xs font-semibold uppercase tracking-wider text-neutral-700"; // Adjusted label style
  const descriptionClasses = "text-xs text-neutral-500 mt-0.5";
  const triggerBaseClasses = "flex justify-between items-center h-16 px-5 rounded-lg border bg-neutral-50 transition-all duration-200 ease-in-out";
  const triggerStateClasses = error ? 'border-red-600' : isOpen ? 'border-blue-600 ring-3 ring-blue-400 ring-offset-1' : 'border-neutral-300';
  const triggerDisabledClasses = disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';
  const valueClasses = `text-lg ${selectedOption ? 'text-neutral-900' : 'text-neutral-400'}`; // Adjusted text size
  const iconClasses = "text-neutral-500"; // Color for the icon
  const menuClasses = `absolute top-full left-0 mt-1 w-full max-h-52 overflow-y-auto bg-white rounded-lg border border-neutral-200 shadow-lg z-10 ${isOpen ? 'block' : 'hidden'}`;
  const optionBaseClasses = "px-4 py-3 text-base cursor-pointer border-b border-neutral-100 last:border-b-0";
  const optionStateClasses = (isSelected, isActive) => isActive ? 'bg-neutral-100' : isSelected ? 'bg-neutral-50 font-medium' : 'bg-transparent'; // Added font-medium for selected
  const errorClasses = "text-xs text-red-600 mt-1";

  return (
    <div className={containerClasses} ref={dropdownRef} {...rest}>
      <div className={labelContainerClasses}>
        {label && (
          <label
            id={`${uniqueId}-label`}
            htmlFor={uniqueId}
            className={labelClasses}
          >
            {label}{" "}
            {required && <span className="text-red-600">*</span>}
          </label>
        )}
        {description && (
          <div id={`${uniqueId}-description`} className={descriptionClasses}>
            {description}
          </div>
        )}
      </div>

      {/* Using button for better accessibility */}
      <button
        type="button" // Important for forms
        id={uniqueId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${uniqueId}-label`}
        aria-describedby={description ? `${uniqueId}-description` : undefined}
        aria-invalid={!!error}
        aria-required={required}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={toggleDropdown}
        className={`${triggerBaseClasses} ${triggerStateClasses} ${triggerDisabledClasses}`}
      >
        <span className={valueClasses}>{displayText}</span>
        <span className={iconClasses}>{chevronIcon}</span>
      </button>

      <ul // Use ul for listbox role
        id={listboxId}
        role="listbox"
        ref={listboxRef}
        aria-labelledby={`${uniqueId}-label`}
        tabIndex={-1} // Make it non-focusable itself, focus managed by trigger/JS
        className={menuClasses}
      >
        {options.map((option, index) => (
          <li // Use li for option role
            key={option.value}
            id={`${uniqueId}-option-${option.value}`}
            role="option"
            aria-selected={option.value === value}
            data-value={option.value}
            className={`${optionBaseClasses} ${optionStateClasses(option.value === value, index === activeIndex)}`}
            onClick={() => handleOptionClick(option.value)}
            onMouseEnter={() => setActiveIndex(index)} // Highlight on hover
          >
            {option.label}
          </li>
        ))}
         {options.length === 0 && (
            <li className={`${optionBaseClasses} text-neutral-500 italic cursor-default`}>
                No options available
            </li>
        )}
      </ul>

      {error && (
        <div id={`${uniqueId}-error`} className={errorClasses} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
