// Adapted from booking-form/1. components/3. step-components/5. ColorPickerSection.tsx
import React from "react";
// Assuming SectionTitle and ColorSelector components are adapted and imported
import SectionTitle from "../form-sections/SectionTitle";
import ColorSelector from "../ui/ColorSelector";

/**
 * Basic ColorPickerSection component ready for Tailwind styling.
 */
export default function ColorPickerSection(props) {
  const {
    title = "FINISH",
    colors = [], // Expects array of { id, name, color_value (JSON string) }
    selectedColorId = "",
    onSelect,
    className = "", // Allow passing Tailwind classes
    ...rest
  } = props;

  // Transform colors data for ColorSelector component
  // Moved parsing logic inside ColorSelector for better encapsulation
  // const transformedColors = colors.map((color) => {
  //   let colorValue = "#f00027"; // Default fallback
  //   let endValue = "#d00020"; // Default fallback end
  //   try {
  //     if (color.color_value) {
  //       const parsed = JSON.parse(color.color_value);
  //       colorValue = parsed.colorStart || colorValue;
  //       endValue = parsed.colorEnd || endValue;
  //     }
  //   } catch (e) {
  //     console.error("Error parsing color value:", e);
  //   }
  //   return {
  //     id: color.id,
  //     name: color.name,
  //     value: colorValue,
  //     endValue: endValue,
  //   };
  // });

  // Get selected color name for display
  const selectedColor = colors.find((c) => c.id === selectedColorId);
  const selectedColorName = selectedColor ? selectedColor.name : "";

  // Placeholder classes - apply Tailwind here
  const containerClasses = `${className}`;
  const selectedColorNameClasses = "text-2xl font-bold mb-3 text-neutral-900"; // Example
  const noColorsClasses = "p-4 text-center text-neutral-500 text-sm";

  return (
    <div className={containerClasses} {...rest}>
      <SectionTitle title={title} />

      {/* Display selected color name above the selector */}
      {/* {selectedColorId && (
        <div className={selectedColorNameClasses}>
          {selectedColorName}
        </div>
      )} */}
      {/* ColorSelector now displays the name internally */}

      <ColorSelector
        // Pass colors directly, ColorSelector handles parsing/display
        colors={colors}
        selectedColorId={selectedColorId}
        onChange={onSelect}
        label="" // Hide the internal label of ColorSelector if title is shown above
      />

      {colors.length === 0 && (
        <div className={noColorsClasses}>
          No colors available. Please select a vehicle first.
        </div>
      )}
    </div>
  );
}
