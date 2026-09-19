import type { MetadataRoute } from "next";
import { getAllTrailerSlugs, getCatalogTrailers } from "../src/lib/trailers";
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

  const [slugs, catalogTrailers] = await Promise.all([
    getAllTrailerSlugs(),
    getCatalogTrailers(),
  ]);
  const imageBySlug = new Map(
    catalogTrailers.map((trailer) => [trailer.slug, trailer.mainImageUrl])
  );

  const trailerRoutes: MetadataRoute.Sitemap = slugs.map((slug) => {
    const imageUrl = imageBySlug.get(slug);

    return {
      url: absoluteUrl(`/prikolice/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      ...(imageUrl && { images: [absoluteUrl(imageUrl)] }),
    };
  });

  return [...staticRoutes, ...trailerRoutes];
}
