import type { MetadataRoute } from "next";
import { routes, siteUrl, isPublicRelease } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return isPublicRelease
    ? routes
        .filter(
          (r) =>
            r.readiness !== "reserved" &&
            r.indexing === "index" &&
            r.publicationState === "published",
        )
        .map((r) => ({ url: siteUrl + r.path }))
    : [];
}
