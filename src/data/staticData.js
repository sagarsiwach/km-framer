// Static data extracted from booking-form/0. reference/api.md
export const staticData = {
  models: [
    {
      id: 1,
      model_code: "B10",
      name: "KM3000 Mark 2",
      description: "Your favourite fully faired sports bike",
      image_url: "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM3000_apj2tj.png",
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 2,
      model_code: "B20",
      name: "KM4000 Mark 2",
      description: "Your favourite silent warrior",
      image_url: "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM4000_fk2pkn.png",
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 3,
      model_code: "B50",
      name: "KM5000",
      description: "Longest Range Cruiser Bike",
      image_url: "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/KM5000_zvh35o.png",
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 4,
      model_code: "H10",
      name: "HERMES 75 Mark 2",
      description: "Your favourite business companion",
      image_url: "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812228/Booking%20Engine/HERMES_75_s59kcr.png",
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 5,
      model_code: "N10",
      name: "INTERCITY 350",
      description: "Your only favourite scooter",
      image_url: "https://res.cloudinary.com/kabira-mobility/image/upload/v1744812227/Booking%20Engine/INTERCITY_350_sgbybx.png",
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    }
  ],
  variants: [
    {
      id: 1,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      code: "B10-LONG-RANGE",
      title: "Long Range",
      subtitle: "5.14 kWh Battery Pack",
      description: "202 kms Range (IDC)",
      price_addition: 999,
      battery_capacity: 5.14,
      range_km: 202,
      is_default: false,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 2,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      code: "B10-STANDARD-RANGE",
      title: "Standard Range",
      subtitle: "4.14 kWh Battery Pack",
      description: "148 kms Range (IDC)",
      price_addition: 0,
      battery_capacity: 4.14,
      range_km: 148,
      is_default: true, // Made one default for testing
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 3,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      code: "B20-LONG-RANGE",
      title: "Long Range",
      subtitle: "5.14 kWh Battery Pack",
      description: "202 kms Range (IDC)",
      price_addition: 999,
      battery_capacity: 5.14,
      range_km: 202,
      is_default: false,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 4,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      code: "B20-STANDARD-RANGE",
      title: "Standard Range",
      subtitle: "4.14 kWh Battery Pack",
      description: "148 kms Range (IDC)",
      price_addition: 0,
      battery_capacity: 4.14,
      range_km: 148,
      is_default: true, // Made one default for testing
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 5,
      model_id: 3,
      model_name: "KM5000",
      code: "B50-LONG-RANGE",
      title: "Long Range",
      subtitle: "18.12 kWh Battery Pack",
      description: "High endurance for long trips",
      price_addition: 999,
      battery_capacity: 18.12,
      range_km: 350,
      is_default: false,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 6,
      model_id: 3,
      model_name: "KM5000",
      code: "B50-STANDARD-RANGE",
      title: "Standard Range",
      subtitle: "8.45 kWh Battery Pack",
      description: "Optimal balance of range and weight",
      price_addition: 0,
      battery_capacity: 8.45,
      range_km: 180,
      is_default: true, // Made one default for testing
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 7,
      model_id: 4,
      model_name: "HERMES 75 Mark 2",
      code: "H10-LONG-RANGE",
      title: "Long Range",
      subtitle: "4.28 kWh Battery Pack",
      description: "210 kms Range (IDC)",
      price_addition: 999,
      battery_capacity: 4.28,
      range_km: 210,
      is_default: false,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 8,
      model_id: 4,
      model_name: "HERMES 75 Mark 2",
      code: "H10-STANDARD-RANGE",
      title: "Standard Range",
      subtitle: "3.35 kWh Battery Pack",
      description: "151 kms Range (IDC)",
      price_addition: 0,
      battery_capacity: 3.35,
      range_km: 151,
      is_default: true, // Made one default for testing
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 9,
      model_id: 5,
      model_name: "INTERCITY 350",
      code: "N10-LONG-RANGE",
      title: "Long Range",
      subtitle: "4.28 kWh Battery Pack",
      description: "210 kms Range (IDC)",
      price_addition: 999,
      battery_capacity: 4.28,
      range_km: 210,
      is_default: false,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 10,
      model_id: 5,
      model_name: "INTERCITY 350",
      code: "N10-STANDARD-RANGE",
      title: "Standard Range",
      subtitle: "3.35 kWh Battery Pack",
      description: "151 kms Range (IDC)",
      price_addition: 0,
      battery_capacity: 3.35,
      range_km: 151,
      is_default: true, // Made one default for testing
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    }
  ],
  colors: [
    {
      id: 1,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      name: "GLOSSY RED",
      color_value: "{\n\"colorStart\" : \"#B91C1C\",\n\"colorEnd\" : \"#450A0A\"\n}", // Swapped for better visual
      is_default: true,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 2,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      name: "MATTE BLACK",
      color_value: "{\n\"colorStart\" : \"#1F2937\",\n\"colorEnd\" : \"#111827\"\n}", // Updated color
      is_default: false,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 3,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      name: "GLOSSY RED",
      color_value: "{\n\"colorStart\" : \"#B91C1C\",\n\"colorEnd\" : \"#450A0A\"\n}", // Swapped
      is_default: true,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 4,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      name: "MATTE BLACK",
      color_value: "{\n\"colorStart\" : \"#1F2937\",\n\"colorEnd\" : \"#111827\"\n}", // Updated color
      is_default: false,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 5,
      model_id: 3,
      model_name: "KM5000",
      name: "ALUMINIUM",
      color_value: "{\n\"colorStart\" : \"#D1D5DB\",\n\"colorEnd\" : \"#9CA3AF\"\n}", // Updated color
      is_default: true,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 6,
      model_id: 4,
      model_name: "HERMES 75 Mark 2",
      name: "JUST WHITE",
      color_value: "{\n\"colorStart\" : \"#FFFFFF\",\n\"colorEnd\" : \"#E5E7EB\"\n}", // Updated color
      is_default: true,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    },
    {
      id: 7,
      model_id: 5,
      model_name: "INTERCITY 350",
      name: "JUST WHITE",
      color_value: "{\n\"colorStart\" : \"#FFFFFF\",\n\"colorEnd\" : \"#E5E7EB\"\n}", // Updated color
      is_default: true,
      created_at: "16/04/2025 15:43:27",
      updated_at: "16/04/2025 15:43:29"
    }
  ],
  components: [
    {
      id: 1,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      component_type: "ACCESSORY",
      code: "B10-HELMET",
      title: "Helmet",
      subtitle: "Mandatory Accessory",
      description: "Protective headgear for rider safety",
      price: 999,
      is_required: true, // Made mandatory for testing
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 2,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      component_type: "ACCESSORY",
      code: "B10-SAREE-GUARD",
      title: "Saree Guard",
      subtitle: "Mandatory Accessory",
      description: "Safety attachment for traditional clothing",
      price: 999,
      is_required: true, // Made mandatory for testing
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 3,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      component_type: "PACKAGE",
      code: "B10-SMART-CONNECTIVITY-PACKAGE",
      title: "Smart Connectivity Package",
      subtitle: "Smart AI Connectivity for 3 Yrs",
      description: "Advanced connectivity features for smartphone integration",
      price: 999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 4,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      component_type: "PACKAGE",
      code: "B10-OFF-ROAD-PACKAGE",
      title: "Off-Road Package",
      subtitle: "Off Road Accessories",
      description: "Rugged accessories for off-road adventures",
      price: 999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 5,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      component_type: "ACCESSORY",
      code: "B20-HELMET",
      title: "Helmet",
      subtitle: "Mandatory Accessory",
      description: "Protective headgear for rider safety",
      price: 999,
      is_required: true, // Made mandatory for testing
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 6,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      component_type: "ACCESSORY",
      code: "B20-SAREE-GUARD",
      title: "Saree Guard",
      subtitle: "Mandatory Accessory",
      description: "Safety attachment for traditional clothing",
      price: 999,
      is_required: true, // Made mandatory for testing
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 7,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      component_type: "PACKAGE",
      code: "B20-SMART-CONNECTIVITY-PACKAGE",
      title: "Smart Connectivity Package",
      subtitle: "Smart AI Connectivity for 3 Yrs",
      description: "Advanced connectivity features for smartphone integration",
      price: 999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 8,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      component_type: "PACKAGE",
      code: "B20-OFF-ROAD-PACKAGE",
      title: "Off-Road Package",
      subtitle: "Off Road Accessories",
      description: "Rugged accessories for off-road adventures",
      price: 999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 9,
      model_id: 3,
      model_name: "KM5000",
      component_type: "ACCESSORY",
      code: "B50-SAREE-GUARD",
      title: "Saree Guard",
      subtitle: "Mandatory Accessory",
      description: "Safety attachment for traditional clothing",
      price: 999,
      is_required: true, // Made mandatory for testing
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 10,
      model_id: 3,
      model_name: "KM5000",
      component_type: "ACCESSORY",
      code: "B50-CRASH-GUARD",
      title: "Crash Guard",
      subtitle: "Protect your scooter from accidental fall",
      description: "Durable guards to minimize damage in case of falls",
      price: 999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 11,
      model_id: 3,
      model_name: "KM5000",
      component_type: "PACKAGE",
      code: "B50-SMART-CONNECTIVITY-PACKAGE",
      title: "Smart Connectivity Package",
      subtitle: "Smart AI Connectivity for 3 Yrs",
      description: "Advanced connectivity features for smartphone integration",
      price: 999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 12,
      model_id: 3,
      model_name: "KM5000",
      component_type: "PACKAGE",
      code: "B50-PERFORMANCE-PACKAGE",
      title: "Performance Package",
      subtitle: "Upgrade your scooter performance",
      description: "Enhanced speed and acceleration components",
      price: 999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 13,
      model_id: 1, // Common component, apply to model 1 for example
      model_name: "KM3000 Mark 2",
      component_type: "WARRANTY",
      code: "COMMON-STANDARD",
      title: "Standard",
      subtitle: "Standard warranty included",
      description: "Basic warranty coverage for your vehicle",
      price: 0,
      is_required: true, // Standard warranty is usually required/default
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 14,
      model_id: 1, // Common component, apply to model 1 for example
      model_name: "KM3000 Mark 2",
      component_type: "WARRANTY",
      code: "COMMON-EXTENDED-2Y",
      title: "02 Years",
      subtitle: "05 Years / 60,000kms",
      description: "Extended warranty for additional peace of mind",
      price: 15500,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 15,
      model_id: 1, // Common component, apply to model 1 for example
      model_name: "KM3000 Mark 2",
      component_type: "WARRANTY",
      code: "COMMON-EXTENDED-5Y",
      title: "05 Years",
      subtitle: "08 Years / 1,00,000kms",
      description: "Maximum warranty protection for long-term ownership",
      price: 21900,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 16,
      model_id: 1, // Common component, apply to model 1 for example
      model_name: "KM3000 Mark 2",
      component_type: "SERVICE",
      code: "COMMON-FIRST-YEAR",
      title: "First Year",
      subtitle: "03 Free Service with 0 Labour Charge",
      description: "Complimentary first-year maintenance package",
      price: 0,
      is_required: true, // First year service often included
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 17,
      model_id: 1, // Common component, apply to model 1 for example
      model_name: "KM3000 Mark 2",
      component_type: "SERVICE",
      code: "COMMON-CARE-PLUS",
      title: "KM Care+",
      subtitle: "02 Service + 01 Inspection Camp",
      description: "Premium care package with additional service benefits",
      price: 1999,
      is_required: false,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    // Add common components for other models if needed, e.g., model_id: 2, 3, 4, 5
    // Example for KM4000 (model_id: 2)
    { id: 18, model_id: 2, component_type: "WARRANTY", code: "COMMON-STANDARD", title: "Standard", subtitle: "Standard warranty", price: 0, is_required: true },
    { id: 19, model_id: 2, component_type: "WARRANTY", code: "COMMON-EXTENDED-2Y", title: "02 Years", subtitle: "05 Years / 60,000kms", price: 15500, is_required: false },
    { id: 20, model_id: 2, component_type: "SERVICE", code: "COMMON-FIRST-YEAR", title: "First Year", subtitle: "03 Free Service", price: 0, is_required: true },
    // Example for KM5000 (model_id: 3)
    { id: 21, model_id: 3, component_type: "WARRANTY", code: "COMMON-STANDARD", title: "Standard", subtitle: "Standard warranty", price: 0, is_required: true },
    { id: 22, model_id: 3, component_type: "SERVICE", code: "COMMON-FIRST-YEAR", title: "First Year", subtitle: "03 Free Service", price: 0, is_required: true },
    // Example for HERMES (model_id: 4)
    { id: 23, model_id: 4, component_type: "ACCESSORY", code: "H10-HELMET", title: "Helmet", subtitle: "Mandatory", price: 999, is_required: true },
    { id: 24, model_id: 4, component_type: "WARRANTY", code: "COMMON-STANDARD", title: "Standard", subtitle: "Standard warranty", price: 0, is_required: true },
    { id: 25, model_id: 4, component_type: "SERVICE", code: "COMMON-FIRST-YEAR", title: "First Year", subtitle: "03 Free Service", price: 0, is_required: true },
    // Example for INTERCITY (model_id: 5)
    { id: 26, model_id: 5, component_type: "ACCESSORY", code: "N10-HELMET", title: "Helmet", subtitle: "Mandatory", price: 999, is_required: true },
    { id: 27, model_id: 5, component_type: "WARRANTY", code: "COMMON-STANDARD", title: "Standard", subtitle: "Standard warranty", price: 0, is_required: true },
    { id: 28, model_id: 5, component_type: "SERVICE", code: "COMMON-FIRST-YEAR", title: "First Year", subtitle: "03 Free Service", price: 0, is_required: true },
  ],
  pricing: [
    {
      id: 1,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Andhra Pradesh",
      city: "",
      pincode_start: 500000,
      pincode_end: 539999,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 2,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Arunachal Pradesh",
      city: "",
      pincode_start: 790000,
      pincode_end: 792999,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 3,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Assam",
      city: "",
      pincode_start: 780000,
      pincode_end: 788999,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 4,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Bihar",
      city: "",
      pincode_start: 800000,
      pincode_end: 855999,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 5,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Chhattisgarh",
      city: "",
      pincode_start: 490000,
      pincode_end: 499999,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 6,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Goa",
      city: "",
      pincode_start: 403000,
      pincode_end: 403999,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 7,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Gujarat",
      city: "",
      pincode_start: 360000,
      pincode_end: 396999,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 8,
      model_id: 1,
      model_name: "KM3000 Mark 2",
      state: "Delhi",
      city: "Delhi", // Added city for testing
      pincode_start: 110000,
      pincode_end: 110099,
      base_price: 172500,
      fulfillment_fee: 1250,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 9,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      state: "Andhra Pradesh",
      city: "",
      pincode_start: 500000,
      pincode_end: 539999,
      base_price: 166500,
      fulfillment_fee: 2500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 10,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      state: "Arunachal Pradesh",
      city: "",
      pincode_start: 790000,
      pincode_end: 792999,
      base_price: 166500,
      fulfillment_fee: 2500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 11,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      state: "Assam",
      city: "",
      pincode_start: 780000,
      pincode_end: 788999,
      base_price: 166500,
      fulfillment_fee: 2500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 12,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      state: "Bihar",
      city: "",
      pincode_start: 800000,
      pincode_end: 855999,
      base_price: 166500,
      fulfillment_fee: 2500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 13,
      model_id: 2,
      model_name: "KM4000 Mark 2",
      state: "Delhi",
      city: "Delhi", // Added city for testing
      pincode_start: 110000,
      pincode_end: 110099,
      base_price: 166500,
      fulfillment_fee: 2500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 14,
      model_id: 3,
      model_name: "KM5000",
      state: "Delhi",
      city: "Delhi", // Added city for testing
      pincode_start: 110000,
      pincode_end: 110099,
      base_price: 195000,
      fulfillment_fee: 2500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 15,
      model_id: 4,
      model_name: "HERMES 75 Mark 2",
      state: "Delhi",
      city: "Delhi", // Added city for testing
      pincode_start: 110000,
      pincode_end: 110099,
      base_price: 155500,
      fulfillment_fee: 1500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 16,
      model_id: 5,
      model_name: "INTERCITY 350",
      state: "Delhi",
      city: "Delhi", // Added city for testing
      pincode_start: 110000,
      pincode_end: 110099,
      base_price: 145000,
      fulfillment_fee: 1500,
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    }
  ],
  insurance_providers: [
    {
      id: 1,
      name: "DIGIT",
      logo_url: "https://via.placeholder.com/100x40.png?text=DIGIT", // Placeholder
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 2,
      name: "ICICI LOMBARD",
      logo_url: "https://via.placeholder.com/100x40.png?text=ICICI", // Placeholder
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 3,
      name: "TURTLEMINT",
      logo_url: "https://via.placeholder.com/100x40.png?text=TURTLEMINT", // Placeholder
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    },
    {
      id: 4,
      name: "BAJAJ ALLIANZ",
      logo_url: "https://via.placeholder.com/100x40.png?text=BAJAJ", // Placeholder
      created_at: "16/04/2025 15:46:12",
      updated_at: "16/04/2025 15:46:15"
    }
  ],
  insurance_plans: [
    {
      id: 1,
      provider_id: 3,
      provider_name: "TURTLEMINT",
      plan_type: "CORE",
      title: "BASE INSURANCE",
      subtitle: "STANDARD LINE FOR BASE INSURANCE",
      description: "Basic required insurance coverage",
      price: 9942,
      is_required: true,
      tenure_months: 12,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 2,
      provider_id: 3,
      provider_name: "TURTLEMINT",
      plan_type: "CORE",
      title: "PERSONAL ACCIDENT COVER",
      subtitle: "STANDARD LINE FOR PERSONAL ACCIDENT COVER",
      description: "Coverage for personal injuries",
      price: 350, // Adjusted price for realism
      is_required: true,
      tenure_months: 12,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 3,
      provider_id: 3,
      provider_name: "TURTLEMINT",
      plan_type: "CORE",
      title: "ZERO DEPRECIATION",
      subtitle: "STANDARD LINE FOR ZERO DEPRECIATION",
      description: "Full value coverage without depreciation",
      price: 1200, // Adjusted price
      is_required: false, // Often optional
      tenure_months: 12,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 4,
      provider_id: 3,
      provider_name: "TURTLEMINT",
      plan_type: "CORE",
      title: "ROAD SIDE ASSISTANCE",
      subtitle: "STANDARD LINE FOR ROAD SIDE ASSISTANCE",
      description: "24/7 help for roadside emergencies",
      price: 500, // Adjusted price
      is_required: false, // Often optional
      tenure_months: 12,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 5,
      provider_id: 3,
      provider_name: "TURTLEMINT",
      plan_type: "ADDITIONAL",
      title: "RIM PROTECTION",
      subtitle: "STANDARD LINE FOR RIM PROTECTION",
      description: "Coverage for wheel rim damage",
      price: 300, // Adjusted price
      is_required: false,
      tenure_months: 12,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 6,
      provider_id: 3,
      provider_name: "TURTLEMINT",
      plan_type: "ADDITIONAL",
      title: "RODENT PROTECTION",
      subtitle: "STANDARD LINE FOR RODENT PROTECTION",
      description: "Coverage for rodent damage to wiring",
      price: 250, // Adjusted price
      is_required: false,
      tenure_months: 12,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    }
  ],
  finance_providers: [
    {
      id: 1,
      name: "ICICI BANK",
      logo_url: "https://via.placeholder.com/100x40.png?text=ICICI", // Placeholder
      created_at: "2025-04-16T12:00:00.000Z",
      updated_at: "2025-04-16T12:00:00.000Z"
    },
    {
      id: 2,
      name: "PUNJAB NATIONAL BANK",
      logo_url: "https://via.placeholder.com/100x40.png?text=PNB", // Placeholder
      created_at: "2025-04-16T12:00:00.000Z",
      updated_at: "2025-04-16T12:00:00.000Z"
    },
    {
      id: 3,
      name: "IDFC FIRST BANK",
      logo_url: "https://via.placeholder.com/100x40.png?text=IDFC", // Placeholder
      created_at: "2025-04-16T12:00:00.000Z",
      updated_at: "2025-04-16T12:00:00.000Z"
    }
  ],
  finance_options: [
    {
      id: 1,
      provider_id: 1,
      provider_name: "ICICI BANK",
      name: "Easy EMI Plan",
      tenure_months: 12,
      interest_rate: 9.99,
      min_downpayment: 10000,
      processing_fee: 999,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 2,
      provider_id: 1,
      provider_name: "ICICI BANK",
      name: "Standard Loan",
      tenure_months: 24,
      interest_rate: 10.5,
      min_downpayment: 15000,
      processing_fee: 1499,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 4, // ID 3 is missing in original data
      provider_id: 2,
      provider_name: "PUNJAB NATIONAL BANK",
      name: "Affordable EMI",
      tenure_months: 12,
      interest_rate: 11.5,
      min_downpayment: 10000,
      processing_fee: 999,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 5,
      provider_id: 2,
      provider_name: "PUNJAB NATIONAL BANK",
      name: "Long Term Loan",
      tenure_months: 36,
      interest_rate: 12.25,
      min_downpayment: 20000,
      processing_fee: 1999,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 6,
      provider_id: 3,
      provider_name: "IDFC FIRST BANK",
      name: "Quick Approval",
      tenure_months: 12,
      interest_rate: 10.75,
      min_downpayment: 10000,
      processing_fee: 1499,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    },
    {
      id: 7,
      provider_id: 3,
      provider_name: "IDFC FIRST BANK",
      name: "Low Interest",
      tenure_months: 24,
      interest_rate: 9.5,
      min_downpayment: 25000,
      processing_fee: 2499,
      created_at: "16/04/2025 15:49:19",
      updated_at: "16/04/2025 15:49:19"
    }
  ]
};
