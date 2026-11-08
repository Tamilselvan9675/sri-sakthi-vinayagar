import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sakthivinayagar.example.com";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/story",
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

  return routes;
}
