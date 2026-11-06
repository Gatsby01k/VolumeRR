import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageForPath, pages, isPublicRelease } from "@/lib/content";
import { RoutePage } from "@/components/pages";
import { EnquiryWizard, Receipt } from "@/components/enquiry";
import { enquiryConfig } from "@/lib/server/config";
import { cookies } from "next/headers";
import { openStore, receiptForToken } from "@/lib/server/store";

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = pageForPath("/" + (slug || []).join("/"));
  if (!route)
    return { title: "Page not found", robots: { index: false, follow: true } };
  return {
    title: {
      absolute:
        route.id === "home"
          ? "VolumeRail — Move value. Open markets."
          : route.meta.title,
    },
    description: route.meta.description,
    alternates: { canonical: route.meta.canonicalPath },
    robots: {
      index:
        isPublicRelease &&
        route.indexing === "index" &&
        route.publicationState === "published",
      follow: true,
    },
    openGraph: {
      title: route.meta.title,
      description: route.meta.description,
      url: route.path,
    },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const route = pageForPath("/" + (slug || []).join("/"));
  if (!route) notFound();
  if (route.id === "not_found") notFound();
  const query = await searchParams;
  if (route.id === "contact")
    return (
      <EnquiryWizard
        config={enquiryConfig()}
        initialPurpose={
          typeof query.purpose === "string" ? query.purpose : undefined
        }
      />
    );
  if (route.id === "confirmation") {
    const token = (await cookies()).get("vr_receipt")?.value;
    if (!token) return <Receipt initialReceipt={null} />;
    const db = openStore();
    try {
      return <Receipt initialReceipt={receiptForToken(db, token)} />;
    } finally {
      db.close();
    }
  }
  return (
    <RoutePage
      id={route.id}
      codes={typeof query.codes === "string" ? query.codes : ""}
    />
  );
}
