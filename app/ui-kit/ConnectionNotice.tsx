import { Card } from "@/components/ui";
import type { ConnectionStatus } from "@/lib/queries/health";

export function ConnectionNotice({ status }: { status: ConnectionStatus }) {
  if (status.ok) {
    return (
      <p role="status" className="font-bold">
        Supabase is connected.
      </p>
    );
  }

  if (status.kind === "missing-env") {
    return (
      <Card role="status" className="flex max-w-prose flex-col gap-2 bg-yellow text-on-accent">
        <p className="font-bold">Supabase isn&apos;t set up yet.</p>
        <p>
          Missing: <code>{status.missing.join(", ")}</code>.
        </p>
        <ol className="list-decimal pl-5">
          <li>
            Copy <code>.env.example</code> to <code>.env.local</code>.
          </li>
          <li>Paste your hosted project&apos;s URL and publishable key from the Supabase dashboard (Project Settings, API Keys).</li>
          <li>
            Restart <code>pnpm dev</code>.
          </li>
        </ol>
      </Card>
    );
  }

  return (
    <p role="status" className="font-bold text-danger">
      Supabase isn&apos;t connected. {status.reason}
    </p>
  );
}
