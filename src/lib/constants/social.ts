/**
 * Social & Contact Constants
 *
 * Centralized configuration for social media links and contact details.
 * These serve as fallback values when database settings are not available.
 */

export const TEMPLE_CONTACT = {
  phone: "9600145775",
  whatsapp: "919600145775",
  /** Public address used for mailto: links (override with NEXT_PUBLIC_CONTACT_EMAIL). */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "srisakthivinayagarofficial@gmail.com",
  address: {
    en: "Sri Sakthi Vinayagar Temple\nKulakarai Street\nKadambadi (Post)\nKadambadi\nMamallapuram\nChengalpattu - 603104",
    ta: "ஸ்ரீ சக்தி விநாயகர் கோயில்\nகுலகரை தெரு\nகடம்பாடி அஞ்சல்\nகடம்பாடி\nமாமல்லபுரம்\nசெங்கல்பட்டு - 603104",
  },
} as const;

export const SOCIAL_LINKS = {
  /**
   * Instagram URL for the temple.
   */
  instagram: "https://www.instagram.com/kadambadi_village?vrfl=MXdpbjJ4Y3RkcXF0Mg==",

  /**
   * Google Maps URL for the temple.
   * Falls back to coordinates-based URL if Place ID not set.
   */
  googleMapsPlaceUrl: "https://maps.app.goo.gl/T6p9tVEcig7WMKTx5",
} as const;

/**
 * Single source of truth for the temple location.
 * All maps, links, directions and embeds derive from these values.
 */
export const TEMPLE_COORDINATES = {
  latitude: 12.597478,
  longitude: 80.147670,
} as const;

/** Google Maps link / directions to the temple coordinates. */
export const TEMPLE_MAPS_URL = "https://maps.app.goo.gl/T6p9tVEcig7WMKTx5";

/** Google Maps embed (iframe) URL for the temple coordinates. */
export const TEMPLE_MAPS_EMBED_URL = `https://www.google.com/maps?q=${TEMPLE_COORDINATES.latitude},${TEMPLE_COORDINATES.longitude}&z=16&output=embed`;
