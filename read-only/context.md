│ ├── components/
│ ├── ui/
│ │ ├── 1. Button.tsx
│ │ ├── 2. InputField.tsx
│ │ ├── 3. ColorSelector.tsx
│ │ ├── 4. PhoneInput.tsx
│ │ ├── 5. VariantCard.tsx
│ │ ├── 6. VehicleCard.tsx
│ │ ├── 7. LocationSearch.tsx
│ │ ├── 8. Dropdown.tsx // For dropdown selections
│ │ └── 9. Checkbox.tsx // For terms/conditions acceptance
│ │
│ ├── form-sections/
│ │ ├── 1. SectionTitle.tsx
│ │ ├── 2. PriceDisplay.tsx
│ │ ├── 3. FormButtons.tsx
│ │ ├── 4. ErrorDisplay.tsx
│ │ ├── 5. LoadingIndicator.tsx
│ │ └── 6. VehicleSummary.tsx // Vehicle summary component that appears at bottom
│ │
│ └── step-components/
│ ├── 1. VehicleSelector.tsx
│ ├── 2. VariantSelector.tsx
│ ├── 3. ProviderSelector.tsx
│ ├── 4. PaymentMethodSelector.tsx
│ ├── 5. ColorPickerSection.tsx // Color selection section
│ ├── 6. ComponentsSection.tsx // For optional components/accessories
│ └── 7. OTPInputGroup.tsx // Group of OTP input fields
│
├── steps/
│ ├── 1. VehicleConfiguration.tsx
│ ├── 2. InsuranceSelection.tsx
│ ├── 3. FinancingOptions.tsx
│ ├── 4. UserInformation.tsx
│ ├── 5. OTPVerification.tsx
│ ├── 6. PaymentOverlay.tsx // Payment overlay component
│ ├── 7. SuccessState.tsx
│ └── 8. FailureState.tsx
│
├── containers/
│ └── 1. BookingContainer.tsx
│
├── context/
│ └── 1. BookingContext.tsx
│
├── hooks/
│ ├── 1. useApiData.js
│ ├── 2. useFormValidation.js
│ ├── 3. useStepNavigation.js // Logic for step navigation
│ └── 4. useLocationSearch.js // Logic for location search functionality
│
└── utils/
├── 1. formatting.js // Price formatting, etc.
├── 2. validation.js // Form validation helpers
└── 3. api.js // API calling functions
