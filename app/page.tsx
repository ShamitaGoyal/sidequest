import Link from "next/link";
import { AiTag, Avatar, Card, Logo } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-feed flex-1 flex-col justify-center gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <Logo size={44} />

      <section className="flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl">A small daily reason to talk to your far-away friends.</h1>
        <p className="max-w-prose text-lg text-soft">
          Every morning Pip asks your group one question. Everyone answers privately. At 8:00 pm the answers
          unlock together and a thread opens so you can talk about them.
        </p>
      </section>

      <Card className="flex flex-col gap-3 bg-yellow text-on-accent">
        <div className="flex items-center gap-2">
          <Avatar name="Pip" pip size={32} />
          <span className="font-bold">Pip</span>
          <AiTag />
        </div>
        <p className="text-lg font-medium">What&apos;s a small thing that made your week better?</p>
        <p className="text-sm">Locked in. Reveal at 8:00 pm.</p>
      </Card>

      <p className="text-sm text-soft">
        Sidequest is being built. Sign up opens soon.
        {process.env.NODE_ENV !== "production" && (
          <>
            {" "}
            <Link href="/ui-kit" className="font-bold text-ink underline underline-offset-4">
              Open the UI kit
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
