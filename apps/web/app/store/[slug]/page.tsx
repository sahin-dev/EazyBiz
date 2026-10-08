import { notFound } from "next/navigation";
import { PublicStore, type PublicStoreData } from "@/components/storefront/public-store";

export default async function StorePage({ params }: { params: { slug: string } }) {
  const apiUrl = process.env.API_URL || "http://localhost:4000";
  const response = await fetch(`${apiUrl}/api/storefronts/${encodeURIComponent(params.slug)}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Storefront is temporarily unavailable.");
  const store = await response.json() as PublicStoreData;
  if (!store.sections.some((section) => section.type === "products")) {
    store.sections = [...store.sections, { id: "catalog", type: "products", title: "All products", visible: true }];
  }
  return <PublicStore store={store} />;
}
