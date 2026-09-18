/**
 * Social & Contact Constants
 *
 * Centralized configuration for social media links and contact details.
 * These serve as fallback values when database settings are not available.
 */

export const TEMPLE_CONTACT = {
  phone: "9600145775",
  whatsapp: "919600145775",
  address: {
    en: "Sri Sakthi Vinayagar Temple\nKulakarai Street\nKadambadi Post\nKadambadi\nMamallapuram\nChengalpattu - 603104",
    ta: "ஸ்ரீ சக்தி விநாயகர் கோயில்\nகுலகரை தெரு\nகடம்பாடி அஞ்சல்\nகடம்பாடி\nமாமல்லபுரம்\nசெங்கல்பட்டு - 603104",
  },
} as const;

export const SOCIAL_LINKS = {
  /**
   * Instagram URL for the temple.
   * Set this to your actual Instagram profile URL.
   * Leave empty string if not available.
   */
  instagram: "https://instagram.com",

  /**
   * Google Maps URL for the temple.
   * Falls back to coordinates-based URL if Place ID not set.
   */
  googleMapsPlaceUrl:
    "https://www.google.com/maps/search/?api=1&query=Sri+Sakthi+Vinayagar+Temple+Kadambadi+Mamallapuram",
} as const;

/**
 * Fallback coordinates for the temple location.
 * Used when database settings don't have lat/lng.
 * Approximate location: Kadambadi, Mamallapuram area.
 */
export const TEMPLE_COORDINATES = {
  latitude: 12.6269,
  longitude: 80.1927,
} as const;
