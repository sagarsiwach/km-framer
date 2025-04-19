import { useState, useCallback } from "react";

/**
 * Custom hook for step navigation (React version).
 * @param {number} initialStep - Initial step index (1-based)
 * @param {number} totalSteps - Total number of steps in the main flow (excluding success/failure)
 * @param {function} [onStepChange] - Optional callback when step changes
 * @returns {object} Step navigation methods and state
 */
export default function useStepNavigation(
  initialStep = 1,
  totalSteps = 5, // Main steps: Config, Insurance, Finance, UserInfo, OTP
  onStepChange
) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  // History tracks the main flow steps visited
  const [stepHistory, setStepHistory] = useState([initialStep]);

  // Go to the next step in the main flow
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const nextStepValue = currentStep + 1;
      setCurrentStep(nextStepValue);
      // Add to history only if it's a new step forward within the main flow
      setStepHistory((prev) =>
        prev.includes(nextStepValue) ? prev : [...prev, nextStepValue]
      );
      if (onStepChange) {
        onStepChange(nextStepValue);
      }
      return true; // Indicate success
    }
    return false; // Indicate failure (already at last main step)
  }, [currentStep, totalSteps, onStepChange]);

  // Go to the previous step using history
  const prevStep = useCallback(() => {
    const currentIndex = stepHistory.lastIndexOf(currentStep);
    if (currentIndex > 0) {
      const prevStepValue = stepHistory[currentIndex - 1];
      setCurrentStep(prevStepValue);
      // Keep history as is when going back, allowing forward again
      if (onStepChange) {
        onStepChange(prevStepValue);
      }
      return true; // Indicate success
    }
    return false; // Indicate failure (already at first step or history issue)
  }, [currentStep, stepHistory, onStepChange]);

  // Go to a specific step number (can be main flow or result steps)
  const goToStep = useCallback(
    (step) => {
      // Allow navigation to any step index (including 7 and 8 for results)
      if (step >= 1 && step !== currentStep) {
        setCurrentStep(step);

        // Update history only if navigating within the main flow (1 to totalSteps)
        if (step <= totalSteps) {
            setStepHistory((prev) => {
            const existingIndex = prev.indexOf(step);
            if (existingIndex !== -1) {
                // Going back to a visited step, truncate history
                return prev.slice(0, existingIndex + 1);
            } else {
                // Jumping forward to a new step within main flow
                return [...prev, step];
            }
            });
        }
        // Don't modify history for result steps (7, 8)

        if (onStepChange) {
          onStepChange(step);
        }
        return true; // Indicate success
      }
      return false; // Indicate failure (invalid step or same step)
    },
    [currentStep, totalSteps, onStepChange] // Removed stepHistory dependency
  );

  // Reset to the initial step
  const resetSteps = useCallback(() => {
    setCurrentStep(initialStep);
    setStepHistory([initialStep]); // Reset history
    if (onStepChange) {
      onStepChange(initialStep);
    }
  }, [initialStep, onStepChange]);

  // Check if it's the first step
  const isFirstStep = currentStep === 1;

  // Check if it's the last step of the main configuration flow
  const isLastConfigStep = currentStep === totalSteps;

  // Calculate progress percentage based on the main flow
  const progressPercentage = Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100);


  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    resetSteps,
    isFirstStep,
    isLastConfigStep,
    progressPercentage,
    stepHistory, // Expose history if needed
  };
}
