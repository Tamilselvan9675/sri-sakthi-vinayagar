import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

/**
 * Retrieves the active festival year based on the current date,
 * or the most recent one if none are currently active.
 */
export async function getActiveFestivalYear() {
  try {
    const now = new Date();
    
    // Try to find a festival that is currently ongoing
    let activeYear = await db.festivalYear.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        events: { orderBy: { date: "asc" }, take: 3 },
        poojaSchedules: { orderBy: { date: "asc" }, take: 3 },
        winners: { take: 5 },
        galleryAlbums: { take: 1, include: { items: { take: 4 } } },
        videos: { take: 2 },
        invitations: { take: 1 },
        expenses: { take: 5, include: { category: true } },
      }
    });

    // If no active festival, get the most recent or upcoming one
    if (!activeYear) {
      activeYear = await db.festivalYear.findFirst({
        orderBy: { year: "desc" },
        include: {
          events: { orderBy: { date: "asc" }, take: 3 },
          poojaSchedules: { orderBy: { date: "asc" }, take: 3 },
          winners: { take: 5 },
          galleryAlbums: { take: 1, include: { items: { take: 4 } } },
          videos: { take: 2 },
          invitations: { take: 1 },
          expenses: { take: 5, include: { category: true } },
        }
      });
    }

    return activeYear;
  } catch (error) {
    console.warn("Failed to fetch active festival year:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Retrieves all festival years (for dropdowns/filters).
 */
export async function getAllFestivalYears() {
  try {
    return await db.festivalYear.findMany({
      orderBy: { year: "desc" },
      select: { id: true, year: true, titleEn: true, titleTa: true },
    });
  } catch (error) {
    console.warn("Failed to fetch all festival years:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Retrieves a specific festival year by its year number.
 */
export async function getFestivalByYear(year: number) {
  try {
    return await db.festivalYear.findUnique({
      where: { year },
      include: {
        events: { orderBy: { date: "asc" } },
        poojaSchedules: { orderBy: { date: "asc" } },
        winners: { include: { event: true } },
        galleryAlbums: { include: { items: true } },
        videos: true,
        invitations: true,
        expenses: { include: { category: true } },
      },
    });
  } catch (error) {
    console.warn(`Failed to fetch festival for year ${year}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Retrieves all organizers for the committee section.
 */
export async function getOrganizers() {
  try {
    return await db.organizer.findMany({
      orderBy: { createdAt: "asc" }
    });
  } catch (error) {
    console.warn("Failed to fetch organizers:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Retrieves pooja schedules with optional year filter.
 */
export async function getPoojaSchedules(year?: number) {
  try {
    const whereClause = year ? { festivalYear: { year } } : {};
    return await db.poojaSchedule.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
      include: { festivalYear: { select: { year: true } } },
    });
  } catch (error) {
    console.warn("Failed to fetch pooja schedules:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Retrieves events with optional year filter.
 */
export async function getEvents(year?: number) {
  try {
    const whereClause = year ? { festivalYear: { year } } : {};
    return await db.event.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
      include: { festivalYear: { select: { year: true } } },
    });
  } catch (error) {
    console.warn("Failed to fetch events:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Retrieves winners with optional filters.
 */
export async function getWinners(filters?: { year?: number; eventId?: string; category?: string }) {
  try {
    const whereClause: Prisma.WinnerWhereInput = {};
    
    if (filters?.year) {
      whereClause.festivalYear = { year: filters.year };
    }
    if (filters?.eventId) {
      whereClause.eventId = filters.eventId;
    }
    if (filters?.category) {
      // Assuming exact match for English category, might need a generic ILIKE search if dynamic
      whereClause.categoryEn = { equals: filters.category, mode: "insensitive" };
    }

    return await db.winner.findMany({
      where: whereClause,
      orderBy: [{ festivalYear: { year: "desc" } }, { createdAt: "asc" }],
      include: { 
        festivalYear: { select: { year: true } },
        event: true
      },
    });
  } catch (error) {
    console.warn("Failed to fetch winners:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Retrieves gallery albums with optional year filter.
 */
export async function getGalleryAlbums(year?: number) {
  try {
    const whereClause = year ? { festivalYear: { year } } : {};
    return await db.galleryAlbum.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { 
        festivalYear: { select: { year: true } },
        items: { take: 1 } // Only fetch the first item for cover thumbnail
      },
    });
  } catch (error) {
    console.warn("Failed to fetch gallery albums:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Retrieves a specific gallery album by ID with all its items.
 */
export async function getGalleryAlbumById(id: string) {
  try {
    return await db.galleryAlbum.findUnique({
      where: { id },
      include: { 
        festivalYear: { select: { year: true, titleEn: true, titleTa: true } },
        items: { orderBy: { createdAt: "asc" } }
      },
    });
  } catch (error) {
    console.warn(`Failed to fetch gallery album ${id}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Retrieves videos with optional year filter.
 */
export async function getVideos(year?: number) {
  try {
    const whereClause = year ? { festivalYear: { year } } : {};
    return await db.video.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { festivalYear: { select: { year: true } } },
    });
  } catch (error) {
    console.warn("Failed to fetch videos:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Retrieves invitations with optional year filter.
 */
export async function getInvitations(year?: number) {
  try {
    const whereClause = year ? { festivalYear: { year } } : {};
    return await db.invitation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { festivalYear: { select: { year: true, titleEn: true, titleTa: true } } },
    });
  } catch (error) {
    console.warn("Failed to fetch invitations:", error instanceof Error ? error.message : String(error));
    return [];
  }
}
