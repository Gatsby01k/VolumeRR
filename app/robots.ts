import type { MetadataRoute } from "next";
import { isPublicRelease, siteUrl } from "@/lib/content";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: isPublicRelease ? "/" : undefined,
      disallow: isPublicRelease
        ? ["/api/", "/contact", "/markets/compare"]
        : "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
