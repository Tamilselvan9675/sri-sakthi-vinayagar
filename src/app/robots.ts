import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/en/admin/", "/ta/admin/", "/api/"],
    },
    sitemap: "https://sakthivinayagar.example.com/sitemap.xml",
  };
}
