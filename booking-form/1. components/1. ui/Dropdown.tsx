// Dropdown component with ShadCN styling and improved accessibility
import { useState, useRef, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
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
        borderColor = tokens.colors.neutral[300],
        focusBorderColor = tokens.colors.blue[600],
        errorBorderColor = tokens.colors.red[600],
        labelColor = tokens.colors.neutral[700],
        id,
        name,
        style,
        ...rest
    } = props

    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const dropdownRef = useRef(null)
    const listboxRef = useRef(null)
    const uniqueId =
        id || `dropdown-${Math.random().toString(36).substring(2, 9)}`
    const listboxId = `${uniqueId}-listbox`

    // Find the selected option for display
    const selectedOption = options.find((option) => option.value === value)
    const displayText = selectedOption ? selectedOption.label : placeholder

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Update activeIndex when value changes
    useEffect(() => {
        const index = options.findIndex((option) => option.value === value)
        setActiveIndex(index)
    }, [value, options])

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setActiveIndex((prev) =>
                        prev < options.length - 1 ? prev + 1 : 0
                    )
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : options.length - 1
                    )
                    break
                case "Home":
                    e.preventDefault()
                    setActiveIndex(0)
                    break
                case "End":
                    e.preventDefault()
                    setActiveIndex(options.length - 1)
                    break
                case "Enter":
                case " ":
                    e.preventDefault()
                    if (activeIndex >= 0) {
                        handleOptionClick(options[activeIndex].value)
                    }
                    break
                case "Escape":
                    e.preventDefault()
                    setIsOpen(false)
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen, activeIndex, options])

    // Scroll active option into view
    useEffect(() => {
        if (isOpen && activeIndex >= 0 && listboxRef.current) {
            const activeOption = listboxRef.current.children[activeIndex]
            if (activeOption) {
                activeOption.scrollIntoView({ block: "nearest" })
            }
        }
    }, [isOpen, activeIndex])

    const handleOptionClick = (optionValue) => {
        if (onChange) {
            onChange(optionValue)
        }
        setIsOpen(false)
    }

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
        }
    }

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        marginBottom: tokens.spacing[4],
        width: "100%",
        position: "relative",
        ...style,
    }

    const labelContainerStyle = {
        marginBottom: tokens.spacing[2],
    }

    const labelStyle = {
        fontSize: "12px",
        fontFamily: "Geist, sans-serif",
        fontWeight: tokens.fontWeight.semibold,
        letterSpacing: "0.72px",
        textTransform: "uppercase",
        color: labelColor,
        display: "block",
    }

    const descriptionStyle = {
        fontSize: tokens.fontSize.xs,
        fontFamily: "Geist, sans-serif",
        color: tokens.colors.neutral[500],
        marginTop: "2px",
    }

    const dropdownTriggerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
        padding: `0 ${tokens.spacing[5]}`,
        borderRadius: tokens.borderRadius.lg,
        border: `0.5px solid ${error ? errorBorderColor : isOpen ? focusBorderColor : borderColor}`,
        backgroundColor: "#FAFAFA",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        boxShadow: isOpen
            ? `0px 0px 0px 3px ${tokens.colors.blue[400]}`
            : "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    }

    const dropdownValueStyle = {
        fontSize: "18px",
        fontFamily: "Geist, sans-serif",
        letterSpacing: "-0.03em",
        color: selectedOption
            ? tokens.colors.neutral[900]
            : tokens.colors.neutral[400],
    }

    const dropdownMenuStyle = {
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        width: "100%",
        maxHeight: "200px",
        overflowY: "auto",
        backgroundColor: "white",
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.neutral[200]}`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        display: isOpen ? "block" : "none",
    }

    const optionStyle = (isSelected, isActive) => ({
        padding: tokens.spacing[4],
        fontSize: tokens.fontSize.base,
        fontFamily: "Geist, sans-serif",
        cursor: "pointer",
        backgroundColor: isActive
            ? tokens.colors.neutral[100]
            : isSelected
              ? tokens.colors.neutral[50]
              : "transparent",
        color: tokens.colors.neutral[900],
        borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
    })

    const errorStyle = {
        color: errorBorderColor,
        fontSize: tokens.fontSize.xs,
        fontFamily: "Geist, sans-serif",
        marginTop: tokens.spacing[1],
    }

    // Chevron icon
    const chevronIcon = (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
            }}
        >
            <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke={tokens.colors.neutral[500]}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )

    return (
        <div style={containerStyle} ref={dropdownRef} {...rest}>
            <div style={labelContainerStyle}>
                {label && (
                    <label
                        id={`${uniqueId}-label`}
                        htmlFor={uniqueId}
                        style={labelStyle}
                    >
                        {label}{" "}
                        {required && (
                            <span style={{ color: errorBorderColor }}>*</span>
                        )}
                    </label>
                )}
                {description && (
                    <div
                        id={`${uniqueId}-description`}
                        style={descriptionStyle}
                    >
                        {description}
                    </div>
                )}
            </div>

            <div
                id={uniqueId}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-labelledby={`${uniqueId}-label`}
                aria-describedby={
                    description ? `${uniqueId}-description` : undefined
                }
                aria-invalid={!!error}
                aria-required={required}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={toggleDropdown}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleDropdown()
                    }
                }}
                style={dropdownTriggerStyle}
            >
                <div style={dropdownValueStyle}>{displayText}</div>
                {chevronIcon}
            </div>

            <div
                id={listboxId}
                role="listbox"
                ref={listboxRef}
                aria-labelledby={`${uniqueId}-label`}
                tabIndex={-1}
                style={dropdownMenuStyle}
            >
                {options.map((option, index) => (
                    <div
                        key={option.value}
                        id={`${uniqueId}-option-${option.value}`}
                        role="option"
                        aria-selected={option.value === value}
                        tabIndex={-1}
                        data-value={option.value}
                        style={optionStyle(
                            option.value === value,
                            index === activeIndex
                        )}
                        onClick={() => handleOptionClick(option.value)}
                        onMouseEnter={() => setActiveIndex(index)}
                    >
                        {option.label}
                    </div>
                ))}
            </div>

            {error && (
                <div id={`${uniqueId}-error`} style={errorStyle} role="alert">
                    {error}
                </div>
            )}
        </div>
    )
}

addPropertyControls(Dropdown, {
    label: {
        type: ControlType.String,
        title: "Label",
        defaultValue: "Label",
    },
    description: {
        type: ControlType.String,
        title: "Description",
        defaultValue: "",
    },
    options: {
        type: ControlType.Array,
        title: "Options",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String },
                value: { type: ControlType.String },
            },
        },
        defaultValue: [
            { label: "Option 1", value: "option1" },
            { label: "Option 2", value: "option2" },
            { label: "Option 3", value: "option3" },
        ],
    },
    value: {
        type: ControlType.String,
        title: "Selected Value",
        defaultValue: "",
    },
    placeholder: {
        type: ControlType.String,
        title: "Placeholder",
        defaultValue: "Select an option",
    },
    error: {
        type: ControlType.String,
        title: "Error Message",
        defaultValue: "",
    },
    required: {
        type: ControlType.Boolean,
        title: "Required",
        defaultValue: false,
    },
    disabled: {
        type: ControlType.Boolean,
        title: "Disabled",
        defaultValue: false,
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border Color",
        defaultValue: tokens.colors.neutral[300],
    },
    focusBorderColor: {
        type: ControlType.Color,
        title: "Focus Border Color",
        defaultValue: tokens.colors.blue[600],
    },
    errorBorderColor: {
        type: ControlType.Color,
        title: "Error Border Color",
        defaultValue: tokens.colors.red[600],
    },
    id: {
        type: ControlType.String,
        title: "ID",
        defaultValue: "",
    },
    name: {
        type: ControlType.String,
        title: "Name",
        defaultValue: "",
    },
})
