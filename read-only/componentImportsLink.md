# Booking Form

import BookingForm from "https://framer.com/m/BookingForm-wFH6.js@e3fX2iUFgUYXmiLBY9bK"

## Component

### UI

import Button from "https://framer.com/m/Button-FXtj.js@3NV9QCK3V6EvnmZYlE58"
import Checkbox from "https://framer.com/m/Checkbox-eHcJ.js@sha04XjytQzB9OFlcMRB"
import ColorSelector from "https://framer.com/m/ColorSelector-P1Up.js@AcePjnQ5kQUuEE573LqM"
import Dropdown from "https://framer.com/m/Dropdown-llus.js@MXfnaw2DO1otDABgR9hx"
import InputField from "https://framer.com/m/InputField-oLfO.js@8XaNaNEmDYZI8EHytu6I"
import { LocationField, getLocationIcon } from "https://framer.com/m/LocationSearch-VHyR.js@jAygBb4t3OchcHomLnxW"
import PhoneInput from "https://framer.com/m/PhoneInput-HEez.js@RvS4P4Io77lbjxwmdCt9"
import VariantCard from "https://framer.com/m/VariantCard-jgTj.js@PT98BY0yrNZHxsG8qB19"
import VehicleCards from "https://framer.com/m/VehicleCards-mBCf.js@nH7fhrGDUJxnIWRhO1I6"

### Form-Sections

import SectionTitle from "https://framer.com/m/SectionTitle-OVrp.js@0THwWF2kfk6VP0cgPj2C"
import PriceDisplay from "https://framer.com/m/PriceDisplay-Q1nh.js@QeG9tPmPrUSAe8Yc4gC6"
import FormButtons from "https://framer.com/m/FormButtons-yqfJ.js@YVIXcVUg9c5BlyMhzrJ9"
import ErrorDisplay from "https://framer.com/m/ErrorDisplay-PmC2.js@0yoaA4Iope73mt1acJWq"
import LoadingIndicator from "https://framer.com/m/LoadingIndicator-7vLo.js@SzXBq2HXevQ1LpPPWAIH"
import VehicleSummary from "https://framer.com/m/VehicleSummary-GFVo.js@z4HbDavN4cHcVfqAP7rD"

### step-components

import VehicleSelector from "https://framer.com/m/VehicleSelector-5dho.js@p0Z6GrD7lk8MamwVH4n9"
import VariantSelector from "https://framer.com/m/VariantSelector-qEP7.js@fWeFOqn7eqSb2dLMSBJB"
import ProviderSelector from "https://framer.com/m/ProviderSelector-bmRT.js@fmfvXOhIajB6DZMyumJ2"
import PaymentMethodSelector from "https://framer.com/m/PaymentMethodSelector-oi31.js@PhmZ0pisawQLVkTUsnZO"
import ColorPickerSection from "https://framer.com/m/ColorPickerSection-tXdu.js@9qriu2fkaOJy4gJBpm0U"
import ComponentsSection from "https://framer.com/m/ComponentsSection-t3pD.js@0Qv14rcyjW7QyrqoM7pw"
import OTPInputGroup from "https://framer.com/m/OTPInputGroup-MaEj.js@cET243rNzhInCb2XuUF1"

## Steps

import VehicleConfiguration from "https://framer.com/m/VehicleConfiguration-rPPa.js@7rzi2S6u2XmE6d8aQZPg"
import InsuranceSelection from "https://framer.com/m/InsuranceSelection-SIY2.js@AUfHwjKHXgeu636L9Kf7"
import FinancingOptions from "https://framer.com/m/FinancingOptions-wNCm.js@4EVb439Ohn4Pv3hvnYdw"
import UserInformation from "https://framer.com/m/UserInformation-2F6M.js@zkPinUKv5tJ8RC0JaKoG"
import OTPVerification from "https://framer.com/m/OTPVerification-vY2g.js@fXiaVKkCARpJd9DE0JKn"
import PaymentOverlay from "https://framer.com/m/PaymentOverlay-A9xm.js@vRmudClo0pZR901QFXeY"
import SuccessState from "https://framer.com/m/SuccessState-f2Qo.js@V8W0saRvsu4RTM3ZWXKE"
import FailureState from "https://framer.com/m/FailureState-ZmfY.js@n6r1tMVs2eC7bzoa3TIF"

## Containers

import BookingContainer from "https://framer.com/m/BookingContainer-841k.js@nOAfzjCyWkwJEKHbVl5Y"

## Context

import BookingContext, { BookingProvider, useBooking } from "https://framer.com/m/BookingContext-EFWo.js@wEcbSgfWfu1yFi0UaCnq"

## Hooks

import UseApiData from "https://framer.com/m/useApiData-PXdp.js@W5UopNWDi8OeuzGEnvkS"
import UseFormValidation from "https://framer.com/m/useFormValidation-reYP.js@oBkyyG0jqnVgrB7ORAma"
import UseStepNavigation from "https://framer.com/m/useStepNavigation-xwZU.js@3ObXxPhEa0C7vtlrLLuE"
import UseLocationSearch, { formatLocationString } from "https://framer.com/m/useLocationSearch-qDDI.js@fOuJO2rt9fWwhIm2cuRn"

## Utils

import { formatDate, formatPhoneNumber, formatPrice } from "https://framer.com/m/formatting-OAsz.js@2EQI8UZryIAgDClUfGct"
import { hasValue, isValidEmail, isValidName, isValidOTP, isValidPhone, isValidPincode, validateUserInfo, validateVehicleConfig } from "https://framer.com/m/validation-cYtD.js@VTUAXloI0Z8Btp1oG2V6"
import { fetchVehicleData, processPayment, searchLocationFromPricing, sendOTP, submitBooking, verifyOTP } from "https://framer.com/m/api-A6AK.js@vDuSbRF4Pc6sKUpSAwut"
