import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../../src/components/Header";
import Footer from "../../../../src/components/Footer";
import BrandCatalog from "../../../../src/components/BrandCatalog";
import {
  getTrailerFilterCategory,
  getTrailerFilterCategoryIds,
  TRAILER_FILTER_CATEGORIES,
} from "../../../../src/lib/trailer-filter-categories";
import { getCatalogTrailers } from "../../../../src/lib/trailers";
import { absoluteUrl, serializeJsonLd } from "../../../../src/lib/seo";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return TRAILER_FILTER_CATEGORIES.map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categoryId } = await params;
  const category = getTrailerFilterCategory(categoryId);

  if (!category) {
    return {
      title: "Kategorija nije pronađena",
      robots: { index: false, follow: false },
    };
  }

  const canonical = absoluteUrl(`/prikolice/kategorija/${category.id}`);

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: {
      canonical,
      languages: {
        "sr-Latn-RS": canonical,
      },
    },
    openGraph: {
      type: "website",
      locale: "sr_RS",
      siteName: "Povuci.rs",
      title: `${category.seoTitle} | Povuci.rs`,
      description: category.seoDescription,
      url: canonical,
      images: [
        {
          url: "/povuci/vesta-light-23.webp",
          width: 622,
          height: 359,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.seoTitle} | Povuci.rs`,
      description: category.seoDescription,
      images: ["/povuci/vesta-light-23.webp"],
    },
  };
}

export default async function TrailerCategoryPage({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;
  const category = getTrailerFilterCategory(categoryId);

  if (!category) notFound();

  const trailers = await getCatalogTrailers();
  const categoryTrailers = trailers.filter((trailer) =>
    getTrailerFilterCategoryIds(trailer).includes(category.id)
  );

  if (categoryTrailers.length === 0) notFound();

  const canonical = absoluteUrl(`/prikolice/kategorija/${category.id}`);
  const breadcrumbId = `${canonical}#breadcrumb`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Početna",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Prikolice",
        item: absoluteUrl("/prikolice"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: canonical,
      },
    ],
  };
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical}#collection`,
    url: canonical,
    name: category.seoTitle,
    description: category.seoDescription,
    inLanguage: "sr-Latn",
    breadcrumb: { "@id": breadcrumbId },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categoryTrailers.length,
      itemListElement: categoryTrailers.map((trailer, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: trailer.title,
          url: absoluteUrl(`/prikolice/${trailer.slug}`),
          ...(trailer.mainImageUrl && { image: trailer.mainImageUrl }),
          brand: {
            "@type": "Brand",
            name: trailer.brand,
          },
          ...(trailer.priceRsd > 0 && {
            offers: {
              "@type": "Offer",
              priceCurrency: "RSD",
              price: trailer.priceRsd,
              availability: "https://schema.org/InStock",
              url: absoluteUrl(`/prikolice/${trailer.slug}`),
            },
          }),
        },
      })),
    },
  };

  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Header />
      <main style={{ paddingTop: "20px" }}>
        <BrandCatalog
          trailers={trailers}
          initialCategory={category.id}
          badgeText={`${category.name.toLocaleUpperCase("sr-Latn")} • ${categoryTrailers.length} MODELA`}
          pageTitle={category.seoTitle.toLocaleUpperCase("sr-Latn")}
          pageSubtitle={category.seoDescription}
        />
      </main>
      <Footer />
    </div>
  );
}
