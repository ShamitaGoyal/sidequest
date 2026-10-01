import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { checkSupabaseConnection } from "@/lib/queries/health";
import { ConnectionNotice } from "./ConnectionNotice";
import { KitShowcase } from "./KitShowcase";

export const metadata: Metadata = {
  title: "UI kit · sidequest",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const connection = await checkSupabaseConnection();

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl">UI kit</h1>
        <p className="text-soft">Every component in components/ui, in light and dark. Dev only.</p>
        <ConnectionNotice status={connection} />
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section data-theme="light" aria-label="Light theme" className="rounded-dialog border-2 border-ink p-4 sm:p-6">
          <KitShowcase theme="Light" />
        </section>
        <section data-theme="dark" aria-label="Dark theme" className="rounded-dialog border-2 border-ink p-4 sm:p-6">
          <KitShowcase theme="Dark" />
        </section>
      </div>
    </main>
  );
}
