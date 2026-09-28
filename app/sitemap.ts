import type { MetadataRoute } from "next";
import { TRAILER_FILTER_CATEGORIES } from "../src/lib/trailer-filter-categories";
import { getSitemapTrailers } from "../src/lib/trailers";
import { absoluteUrl } from "../src/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/prikolice"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/vesta"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/trigano"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/kontakt"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = TRAILER_FILTER_CATEGORIES.map(
    (category) => ({
      url: absoluteUrl(`/prikolice/kategorija/${category.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })
  );

  const trailers = await getSitemapTrailers();

  const trailerRoutes: MetadataRoute.Sitemap = trailers.map((trailer) => ({
      url: absoluteUrl(`/prikolice/${trailer.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      ...(trailer.updatedAt && { lastModified: new Date(trailer.updatedAt) }),
      ...(trailer.imageUrls.length > 0 && {
        images: trailer.imageUrls.map(absoluteUrl),
      }),
    }));

  return [...staticRoutes, ...categoryRoutes, ...trailerRoutes];
}
