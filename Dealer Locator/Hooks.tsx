// Hooks.tsx
import { useState, useEffect, useCallback } from "react"
import { RenderTarget } from "framer"

// Import types and constants from Lib.tsx
import {
  SAMPLE_DEALERS, // Used for canvas preview and fallback
  type Dealer,
  type Location,
  type MapProvider,
  type Coordinates,
} from "https://framer.com/m/Lib-8AS5.js@OT7MrLyxrSeMBPdmFx17"

// --- Hook to manage dealer data fetching and state ---
export const useDealerData = (
  apiEndpoint?: string,
  staticData: Dealer[] = SAMPLE_DEALERS // Use SAMPLE_DEALERS from Lib
) => {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    console.log("Fetching dealer data...") // Log start

    // Use static data on the Framer canvas or if no endpoint provided
    if (RenderTarget.current() === RenderTarget.canvas || !apiEndpoint) {
      console.log(
        !apiEndpoint
          ? "No API endpoint provided, using static data."
          : "Canvas detected, using static data."
      )
      // Ensure static data is properly formatted if needed
      const formattedStaticData = staticData.map((d) => ({
        ...d,
        // Add any default values if missing from static data
        services: d.services || [],
        hours: d.hours || [],
      }))
      setDealers(formattedStaticData)
      setIsLoading(false)
      return
    }

    try {
      console.log(`Fetching from: ${apiEndpoint}`)
      const response = await fetch(apiEndpoint)
      console.log(`API Response Status: ${response.status}`)

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      // Adapt based on your actual API response structure
      // Assuming the API returns { status: "success", dealers: [...] }
      if (data.status === "success" && Array.isArray(data.dealers)) {
        console.log(`Received ${data.dealers.length} dealers from API`)
        setDealers(data.dealers)
      } else {
        // Handle unexpected data format
        console.error("Invalid API response format:", data)
        throw new Error("Invalid data format received from API")
      }
    } catch (err: any) {
      console.error("Error fetching or processing dealer data:", err)
      setError(`Failed to fetch dealers: ${err.message}`)
      // Fallback to static data on error if available
      if (staticData && staticData.length > 0) {
        console.log("Falling back to static data due to API error.")
        setDealers(staticData) // Consider formatting static data here too
      } else {
        setDealers([])
      }
    } finally {
      setIsLoading(false)
      console.log("Finished fetching dealer data.")
    }
  }, [apiEndpoint, staticData]) // Dependencies for the fetch callback

  // Initial fetch on mount
  useEffect(() => {
    fetchData()
  }, [fetchData]) // fetchData is memoized by useCallback

  // Return state and refetch function
  return { dealers, isLoading, error, refetch: fetchData }
}

// --- Hook to manage geolocation ---
export const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState<Location>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const getUserLocation = useCallback(() => {
    // Geolocation doesn't work on canvas
    if (RenderTarget.current() === RenderTarget.canvas) {
      console.log("Geolocation skipped on canvas.")
      return
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.")
      console.warn("Geolocation not supported.")
      return
    }

    setIsLocating(true)
    setLocationError(null)
    console.log("Attempting to get user location...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        console.log("Geolocation successful:", coords)
        setUserLocation(coords)
        setIsLocating(false)
      },
      (error) => {
        let message = "Could not retrieve location."
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied."
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable."
            break
          case error.TIMEOUT:
            message = "Location request timed out."
            break
        }
        console.error("Geolocation error:", error.message, error.code)
        setLocationError(message)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true, // Better accuracy for mobile devices
        timeout: 10000, // 10 seconds timeout
        maximumAge: 60000, // Allow cached position up to 1 minute old
      }
    )
  }, []) // No dependencies, useCallback ensures stable function reference

  return { userLocation, isLocating, locationError, getUserLocation }
}

// --- Hook to manage API loading state (Specifically Google Maps Script) ---
// This is less critical for Mapbox-only, but keep it for potential Google Maps usage
export const useMapApiState = (provider: MapProvider, apiKey?: string) => {
  const [isLoaded, setIsLoaded] = useState(provider === "mapbox") // Mapbox assumed loaded via CDN/import
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    // Reset state on provider change
    setIsLoaded(provider === "mapbox")
    setLoadError(null)

    if (provider === "mapbox") {
      console.log("Mapbox selected, API assumed loaded.")
      return // No script loading needed for Mapbox GL JS
    }

    // --- Google Maps Loading Logic ---
    if (RenderTarget.current() === RenderTarget.canvas) {
      console.log("Google Maps API loading skipped on canvas.")
      setIsLoaded(true) // Assume loaded for canvas preview
      return
    }

    if (!apiKey) {
      console.error("Google Maps API key is required but not provided.")
      setLoadError(new Error("Google Maps API key is required."))
      setIsLoaded(false)
      return
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.marker) {
      console.log("Google Maps API already loaded.")
      setIsLoaded(true)
      setLoadError(null)
      return
    }

    const scriptId = "google-maps-script"
    let script = document.getElementById(
      scriptId
    ) as HTMLScriptElement | null
    const callbackName = `__framerMapCallback_${Date.now()}`

    // Cleanup function for the callback
    const cleanup = () => {
      delete window[callbackName] // Remove callback from global scope
    }

    // If script tag exists, but API not ready, wait (handle potential race conditions)
    if (script && !window.google?.maps?.marker) {
      console.log("Google Maps script tag exists, waiting for load...")
      const checkInterval = setInterval(() => {
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.marker
        ) {
          console.log("Google Maps API loaded after waiting.")
          setIsLoaded(true)
          setLoadError(null)
          clearInterval(checkInterval)
          cleanup()
        }
        // Add a timeout for this waiting period if needed
      }, 100)

      // Timeout check
      const waitTimeout = setTimeout(() => {
        clearInterval(checkInterval)
        if (!isLoaded) {
          console.error(
            "Timeout waiting for existing Google Maps script to load."
          )
          setLoadError(
            new Error("Timeout waiting for Google Maps script.")
          )
          setIsLoaded(false)
          cleanup()
        }
      }, 10000) // 10 second timeout

      return () => {
        clearInterval(checkInterval)
        clearTimeout(waitTimeout)
        // Don't remove script if it might be shared, just cleanup callback
        cleanup()
      }
    } else if (!script) {
      // Create and load the script
      console.log("Creating Google Maps script tag...")
      script = document.createElement("script")
      script.id = scriptId
      // Ensure 'marker' library is loaded for AdvancedMarkerElement
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = (error) => {
        console.error("Google Maps script loading error:", error)
        setLoadError(new Error("Failed to load Google Maps script."))
        setIsLoaded(false)
        cleanup()
        // Optionally remove the failed script tag
        script?.remove()
      }

      window[callbackName] = () => {
        console.log("Google Maps API loaded via callback.")
        setIsLoaded(true)
        setLoadError(null)
        cleanup()
      }

      document.body.appendChild(script)

      return () => {
        cleanup()
        // Consider removing the script on unmount ONLY if you are sure it's safe
        // and won't interfere with other components potentially using it.
        // script?.remove(); // Usually safer not to remove it.
      }
    }
    // If script exists and API is loaded, this point shouldn't be reached due to early return.
  }, [provider, apiKey, isLoaded]) // Rerun if provider or key changes

  return { isLoaded, loadError }
}
