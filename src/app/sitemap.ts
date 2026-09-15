import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sakthivinayagar.example.com";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/story",
    "/pooja",
    "/events",
    "/winners",
    "/gallery",
    "/videos",
    "/invitations",
    "/donations",
    "/expenses",
    "/contact",
  ];

  const routes = staticRoutes.flatMap((route) => [
    {
      url: `${baseUrl}/en${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    },
    {
      url: `${baseUrl}/ta${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }
  ]);

  try {
    const festivalYears = await db.festivalYear.findMany({
      select: { year: true, updatedAt: true }
    });

    const dynamicRoutes = festivalYears.flatMap((fy) => [
      {
        url: `${baseUrl}/en/festival/${fy.year}`,
        lastModified: fy.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/ta/festival/${fy.year}`,
        lastModified: fy.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      }
    ]);

    return [...routes, ...dynamicRoutes];
  } catch (error) {
    // Fallback if DB is not reachable during build
    return routes;
  }
}
