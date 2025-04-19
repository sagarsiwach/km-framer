// Adapted from booking-form/1. components/1. ui/ColorSelector.tsx
import React, { useState } from "react";

/**
 * Basic ColorSelector component ready for Tailwind styling.
 */
export default function ColorSelector(props) {
  const {
    label = "Color",
    colors = [
      { id: "red", name: "Glossy Red", value: "#9B1C1C", endValue: "#7B1818" },
      { id: "black", name: "Matte Black", value: "#1F2937", endValue: "#111827" },
    ],
    selectedColorId = "",
    onChange,
    id,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const uniqueId =
    id || `color-selector-${Math.random().toString(36).substring(2, 9)}`;

  // Handle keyboard navigation
  const handleKeyDown = (e, index) => {
    // Basic keyboard nav, can be enhanced
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (onChange) {
          onChange(colors[index].id);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (index < colors.length - 1) {
          setFocusedIndex(index + 1);
          document.getElementById(`${uniqueId}-color-${index + 1}`)?.focus();
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (index > 0) {
          setFocusedIndex(index - 1);
          document.getElementById(`${uniqueId}-color-${index - 1}`)?.focus();
        }
        break;
      default:
        break;
    }
  };

  // Find selected color name for display
  const selectedColor = colors.find((color) => color.id === selectedColorId);
  const selectedColorName = selectedColor ? selectedColor.name : "";

  // Function to parse color_value JSON string
  const parseColorValue = (colorValueString) => {
    try {
      if (colorValueString) {
        const parsed = JSON.parse(colorValueString);
        return {
          start: parsed.colorStart || "#737373", // Default gray
          end: parsed.colorEnd || "#0A0A0A",     // Default dark gray
        };
      }
    } catch (e) {
      console.error("Error parsing color value JSON:", e, "Input:", colorValueString);
    }
    // Fallback colors
    return { start: "#737373", end: "#0A0A0A" };
  };


  // Placeholder classes - apply Tailwind here
  const containerClasses = `mb-6 ${className}`;
  const labelClasses = "block text-sm font-medium text-neutral-900 mb-3 uppercase tracking-wide"; // Adjusted label style
  const selectedColorNameClasses = "text-xl font-semibold text-neutral-900 mb-4"; // Adjusted title style
  const colorsContainerClasses = "flex flex-col gap-4";
  const colorRowClasses = "flex gap-3";
  const colorOptionBaseClasses = "w-24 h-24 rounded-lg cursor-pointer transition-all relative p-5 flex flex-col items-start gap-5 focus:outline-none"; // Adjusted size and padding

  return (
    <div
      className={containerClasses}
      role="region"
      aria-labelledby={`${uniqueId}-label`}
      {...rest}
    >
      {label && (
        <div id={`${uniqueId}-label`} className={labelClasses}>
          {label}
        </div>
      )}

      {selectedColorId && (
        <div className={selectedColorNameClasses}>{selectedColorName}</div>
      )}

      <div className={colorsContainerClasses}>
        <div
          className={colorRowClasses}
          role="radiogroup"
          aria-labelledby={`${uniqueId}-label`}
        >
          {colors.map((color, index) => {
            // Use the value and endValue if directly provided, otherwise parse color_value
            let colorStart = color.value;
            let colorEnd = color.endValue;

            if (!colorStart && color.color_value) {
                const parsed = parseColorValue(color.color_value);
                colorStart = parsed.start;
                colorEnd = parsed.end;
            } else if (!colorStart) {
                // Fallback if neither value nor color_value is present
                colorStart = '#737373';
                colorEnd = '#0A0A0A';
            }

            const isSelected = color.id === selectedColorId;
            const isFocused = index === focusedIndex;
            const colorGradient = `conic-gradient(from 174.33deg at 46.25% 0%, ${colorEnd} -179.01deg, ${colorStart} 180deg, ${colorEnd} 180.99deg, ${colorStart} 540deg)`;
            const focusRingClasses = isFocused ? 'ring-3 ring-blue-400 ring-offset-1' : isSelected ? 'ring-3 ring-blue-600 ring-offset-1' : '';

            return (
              <div
                key={color.id}
                id={`${uniqueId}-color-${index}`}
                style={{ background: colorGradient }} // Apply gradient via inline style
                className={`${colorOptionBaseClasses} ${focusRingClasses}`}
                onClick={() => onChange && onChange(color.id)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="radio"
                aria-checked={isSelected}
                aria-label={color.name}
                tabIndex={0}
                title={color.name}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
