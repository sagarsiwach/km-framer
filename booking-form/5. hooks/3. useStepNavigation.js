// Custom hook for managing step navigation - Simplified
import { useState, useCallback } from "react"

/**
 * Custom hook for step navigation
 * @param {number} initialStep - Initial step index
 * @param {number} totalSteps - Total number of steps
 * @param {function} onStepChange - Callback for step changes
 * @returns {object} Step navigation methods and state
 */
export default function useStepNavigation(
    initialStep = 1,
    totalSteps = 5, // Reduced from 8 to 5 steps
    onStepChange
) {
    const [currentStep, setCurrentStep] = useState(initialStep)
    const [stepHistory, setStepHistory] = useState([initialStep])

    // Go to next step
    const nextStep = useCallback(() => {
        if (currentStep < totalSteps) {
            const nextStepValue = currentStep + 1
            setCurrentStep(nextStepValue)
            setStepHistory((prev) => [...prev, nextStepValue])

            if (onStepChange) {
                onStepChange(nextStepValue)
            }

            return true
        }
        return false
    }, [currentStep, totalSteps, onStepChange])

    // Go to previous step
    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            const prevStepValue = currentStep - 1
            setCurrentStep(prevStepValue)

            // Remove the current step from history
            setStepHistory((prev) => {
                const newHistory = [...prev]
                newHistory.pop()
                return newHistory
            })

            if (onStepChange) {
                onStepChange(prevStepValue)
            }

            return true
        }
        return false
    }, [currentStep, onStepChange])

    // Go to a specific step
    const goToStep = useCallback(
        (step) => {
            if (step >= 1 && step <= totalSteps) {
                setCurrentStep(step)

                // If going back to a previous step in history
                if (stepHistory.includes(step)) {
                    const index = stepHistory.indexOf(step)
                    setStepHistory(stepHistory.slice(0, index + 1))
                } else {
                    // Going to a new step
                    setStepHistory((prev) => [...prev, step])
                }

                if (onStepChange) {
                    onStepChange(step)
                }

                return true
            }
            return false
        },
        [totalSteps, stepHistory, onStepChange]
    )

    // Reset to first step
    const resetSteps = useCallback(() => {
        setCurrentStep(initialStep)
        setStepHistory([initialStep])

        if (onStepChange) {
            onStepChange(initialStep)
        }
    }, [initialStep, onStepChange])

    // Check if it's the first step
    const isFirstStep = currentStep === 1

    // Check if it's the last step
    const isLastStep = currentStep === totalSteps

    // Get step progress percentage
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100

    return {
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        resetSteps,
        isFirstStep,
        isLastStep,
        progressPercentage,
        stepHistory,
    }
}
