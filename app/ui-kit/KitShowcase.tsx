"use client";

import { useState, type ReactNode } from "react";
import {
  AdminTag,
  AiTag,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  Logo,
  Skeleton,
  Textarea,
  useToast,
} from "@/components/ui";
import { AVATAR_COLORS } from "@/lib/avatar";
import { LIMITS } from "@/lib/validation";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg">{title}</h3>
      {children}
    </section>
  );
}

export function KitShowcase({ theme }: { theme: string }) {
  const { toast } = useToast();
  const [dialog, setDialog] = useState<"none" | "plain" | "danger">("none");
  const [loading, setLoading] = useState(false);

  function fakeSave() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl">{theme}</h2>
        <Logo size={32} />
      </div>

      <Section title="Type scale">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-4xl">64 heading</p>
          <p className="font-heading text-3xl">44 heading</p>
          <p className="font-heading text-2xl">32 heading</p>
          <p className="font-heading text-xl">24 heading</p>
          <p className="text-lg">18 body, DM Sans</p>
          <p className="text-base">16 body, the base size</p>
          <p className="text-sm text-soft">14 secondary text</p>
          <p className="text-xs text-soft">12 small text</p>
        </div>
      </Section>

      <Section title="Colors">
        <div className="flex flex-wrap gap-2">
          {["bg-paper", "bg-card", "bg-ink", "bg-soft", "bg-yellow", "bg-pink", "bg-mint", "bg-lilac", "bg-danger"].map(
            (swatch) => (
              <div key={swatch} className="flex flex-col items-center gap-1">
                <span className={`size-10 rounded-control border-2 border-ink ${swatch}`} />
                <span className="text-xs text-soft">{swatch.replace("bg-", "")}</span>
              </div>
            ),
          )}
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap gap-3">
          <Button>Answer today&apos;s question</Button>
          <Button variant="secondary">See past days</Button>
          <Button variant="danger">Remove member</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button loading={loading} onClick={fakeSave}>
            {loading ? "Saving" : "Save (shows loading)"}
          </Button>
          <Button loading variant="secondary">
            Loading
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Input and textarea">
        <Input label="Display name" placeholder="Sam" helperText="This is what your friends see." />
        <Input
          label="Group name"
          defaultValue="College crew"
          maxLength={LIMITS.groupName}
          showCount
          helperText="You can change it later."
        />
        <Input label="Invite code" defaultValue="ABC1" error="That code didn't work. Check it and try again." />
        <Input label="Email" disabled defaultValue="sam@example.com" />
        <Textarea
          label="Your answer"
          placeholder="Only you can see this until 8:00 pm."
          maxLength={LIMITS.answer}
          showCount
        />
        <Textarea label="Message" error="Type a message first." rows={2} />
      </Section>

      <Section title="Card">
        <Card>
          <p className="font-bold">Today&apos;s question</p>
          <p className="text-soft">Cards hold day cards, panels, and forms.</p>
        </Card>
        <Card className="bg-lilac text-on-accent">
          <p className="font-bold">Question card on lilac</p>
          <p>Text on accents stays dark in both themes.</p>
        </Card>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-2">
          <AiTag />
          <AdminTag />
          <Badge>Neutral</Badge>
          <Badge variant="success">Answered</Badge>
          <Badge variant="accent">New</Badge>
          <Badge variant="danger">Removed</Badge>
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex flex-wrap items-end gap-3">
          <Avatar name="Pip" pip size={24} />
          <Avatar name="Pip" pip size={32} />
          <Avatar name="Pip" pip size={44} />
          <Avatar name="Pip" pip size={64} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Avatar name="Maya Chen" color="pink" size={24} />
          <Avatar name="Maya Chen" color="pink" size={32} />
          <Avatar name="Maya Chen" color="pink" size={44} />
          <Avatar name="Maya Chen" color="pink" size={64} />
        </div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((color) => (
            <Avatar key={color} name={color} color={color} size={44} />
          ))}
        </div>
      </Section>

      <Section title="Dialog">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialog("plain")}>
            Open dialog
          </Button>
          <Button variant="danger" onClick={() => setDialog("danger")}>
            Open destructive dialog
          </Button>
        </div>
        <Dialog
          open={dialog === "plain"}
          onClose={() => setDialog("none")}
          title="Invite your friends"
          description="Share this code. It works until you make a new one."
          actions={<Button onClick={() => setDialog("none")}>Done</Button>}
        >
          <p className="font-heading text-2xl tracking-widest">K7MP2Q</p>
        </Dialog>
        <Dialog
          open={dialog === "danger"}
          onClose={() => setDialog("none")}
          title="Remove Maya from College crew?"
          description="Maya's past answers and messages stay. She can rejoin with a new invite."
          actions={
            <>
              <Button variant="ghost" onClick={() => setDialog("none")}>
                Keep Maya
              </Button>
              <Button variant="danger" onClick={() => setDialog("none")}>
                Remove Maya
              </Button>
            </>
          }
        />
      </Section>

      <Section title="Toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast("Locked in. Reveal at 8:00 pm.")}>
            Show success toast
          </Button>
          <Button variant="secondary" onClick={() => toast("That didn't save. Try again.", "error")}>
            Show error toast
          </Button>
        </div>
      </Section>

      <Section title="Skeleton">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </Card>
      </Section>
    </div>
  );
}
