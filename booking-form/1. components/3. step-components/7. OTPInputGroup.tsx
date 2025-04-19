// OTP input group component with improved accessibility
import { useState, useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "https://framer.com/m/DesignTokens-itkJ.js"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function OTPInputGroup(props) {
    const {
        value = "",
        length = 6,
        onChange,
        autoFocus = true,
        error = "",
        borderColor = tokens.colors.neutral[300],
        focusBorderColor = tokens.colors.blue[600],
        errorBorderColor = tokens.colors.red[600],
        id,
        style,
        ...rest
    } = props

    // Convert string value to array of characters
    const [otpValues, setOtpValues] = useState(
        value.split("").length > 0
            ? value.split("").slice(0, length)
            : Array(length).fill("")
    )
    const [activeInput, setActiveInput] = useState(0)

    // Refs for OTP inputs
    const inputRefs = useRef([])
    const uniqueId = id || `otp-${Math.random().toString(36).substring(2, 9)}`

    // Update OTP values when value prop changes
    useEffect(() => {
        const newOtpValues = value.split("").slice(0, length)
        if (newOtpValues.length < length) {
            newOtpValues.push(...Array(length - newOtpValues.length).fill(""))
        }
        setOtpValues(newOtpValues)
    }, [value, length])

    // Focus first input on mount if autoFocus is true
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [autoFocus])

    // Handle OTP input change
    const handleChange = (index, newValue) => {
        // Only allow digits
        if (!/^\d*$/.test(newValue)) return

        const newOtpValues = [...otpValues]
        newOtpValues[index] = newValue.slice(0, 1)
        setOtpValues(newOtpValues)

        // Auto-move to next input
        if (newValue && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus()
            setActiveInput(index + 1)
        }

        // Notify parent of change
        if (onChange) {
            onChange(newOtpValues.join(""))
        }
    }

    // Handle focus on an input
    const handleFocus = (index) => {
        setActiveInput(index)
    }

    // Handle key down events for backspace and arrow navigation
    const handleKeyDown = (index, e) => {
        switch (e.key) {
            case "Backspace":
                e.preventDefault()
                if (otpValues[index]) {
                    // If current input has value, clear it
                    const newOtpValues = [...otpValues]
                    newOtpValues[index] = ""
                    setOtpValues(newOtpValues)

                    // Notify parent of change
                    if (onChange) {
                        onChange(newOtpValues.join(""))
                    }
                } else if (index > 0) {
                    // If current input is empty and we're not at the first input,
                    // move to previous and clear it
                    inputRefs.current[index - 1].focus()
                    setActiveInput(index - 1)

                    // Clear the previous input
                    const newOtpValues = [...otpValues]
                    newOtpValues[index - 1] = ""
                    setOtpValues(newOtpValues)

                    // Notify parent of change
                    if (onChange) {
                        onChange(newOtpValues.join(""))
                    }
                }
                break

            case "ArrowLeft":
                e.preventDefault()
                if (index > 0) {
                    inputRefs.current[index - 1].focus()
                    setActiveInput(index - 1)
                }
                break

            case "ArrowRight":
                e.preventDefault()
                if (index < length - 1) {
                    inputRefs.current[index + 1].focus()
                    setActiveInput(index + 1)
                }
                break

            case "Home":
                e.preventDefault()
                inputRefs.current[0].focus()
                setActiveInput(0)
                break

            case "End":
                e.preventDefault()
                inputRefs.current[length - 1].focus()
                setActiveInput(length - 1)
                break

            default:
                break
        }
    }

    // Handle paste event
    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text/plain").trim()

        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.slice(0, length).split("")
            const newOtpValues = [...otpValues]

            digits.forEach((digit, index) => {
                if (index < length) {
                    newOtpValues[index] = digit
                }
            })

            setOtpValues(newOtpValues)

            // Focus last filled input or next empty one
            const lastIndex = Math.min(digits.length, length - 1)
            if (inputRefs.current[lastIndex]) {
                inputRefs.current[lastIndex].focus()
                setActiveInput(lastIndex)
            }

            // Notify parent of change
            if (onChange) {
                onChange(newOtpValues.join(""))
            }
        }
    }

    const containerStyle = {
        display: "flex",
        gap: tokens.spacing[2],
        justifyContent: "center",
        ...style,
    }

    const getInputStyle = (index) => ({
        width: "40px",
        height: "48px",
        fontSize: tokens.fontSize.xl,
        textAlign: "center",
        border: `1.5px solid ${
            error
                ? errorBorderColor
                : activeInput === index
                  ? focusBorderColor
                  : borderColor
        }`,
        borderRadius: tokens.borderRadius.DEFAULT,
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow:
            activeInput === index
                ? `0px 0px 0px 2px ${tokens.colors.blue[300]}`
                : "none",
        caretColor: focusBorderColor,
    })

    const errorStyle = {
        color: errorBorderColor,
        fontSize: tokens.fontSize.sm,
        marginTop: tokens.spacing[2],
        textAlign: "center",
        fontFamily: "Geist, sans-serif",
    }

    return (
        <div {...rest}>
            <div
                style={containerStyle}
                onPaste={handlePaste}
                role="group"
                aria-labelledby={`${uniqueId}-label`}
                aria-describedby={error ? `${uniqueId}-error` : undefined}
            >
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otpValues[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onFocus={() => handleFocus(index)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        style={getInputStyle(index)}
                        aria-label={`Digit ${index + 1} of ${length}`}
                        id={`${uniqueId}-input-${index}`}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                    />
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

addPropertyControls(OTPInputGroup, {
    value: {
        type: ControlType.String,
        title: "Value",
        defaultValue: "",
    },
    length: {
        type: ControlType.Number,
        title: "Length",
        defaultValue: 6,
        min: 4,
        max: 10,
        step: 1,
    },
    autoFocus: {
        type: ControlType.Boolean,
        title: "Auto Focus",
        defaultValue: true,
    },
    error: {
        type: ControlType.String,
        title: "Error",
        defaultValue: "",
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
})
