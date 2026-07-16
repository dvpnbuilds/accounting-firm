import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Onboarding & document tracker",
    description:
      "Auto-generated document checklists by client type, with a portal for clients to upload and staff to track status.",
  },
  {
    title: "PH compliance calendar",
    description:
      "BIR 2551Q/2550Q, 1701Q, SSS, PhilHealth, and Pag-IBIG deadlines tracked per client with automatic email reminders.",
  },
  {
    title: "AI document classification",
    description:
      "Uploads are matched against the checklist automatically — staff always confirm before anything is marked received.",
  },
  {
    title: "AI email drafting",
    description:
      "Chaser emails with escalating tone based on days overdue, plus a free-text assistant for one-off client emails.",
  },
  {
    title: "Tax & bookkeeping FAQ",
    description:
      "A chatbot that answers only from a curated PH tax knowledge base, and declines anything outside it.",
  },
  {
    title: "Lead qualification",
    description:
      "Inbound inquiries are scored automatically with visible reasoning, so staff know who to follow up with first.",
  },
];

export default async function Home() {
  const session = await auth();

  if (session) {
    if (session.user.role === "STAFF") redirect("/dashboard");
    redirect("/portal/dashboard");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-16 p-6 py-16">
      <header className="space-y-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">BiziBooks</p>
        <h1 className="text-balance text-4xl font-semibold sm:text-5xl">
          Bookkeeping software built for Philippine firms
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
          Onboard clients, chase documents, track BIR deadlines, and answer tax
          questions — all from one dashboard, with AI doing the busywork and
          staff always making the final call.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Staff login
          </Link>
          <Link
            href="/faq"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Ask a tax question
          </Link>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Get in touch
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </section>

      <footer className="space-y-2 border-t pt-8 text-center text-sm text-muted-foreground">
        <p>
          This is a portfolio demo — email sends run in demo mode (logged, not
          delivered) unless explicitly configured otherwise.
        </p>
        <p>
          Client?{" "}
          <Link href="/login" className="underline">
            Log in to your portal
          </Link>
        </p>
      </footer>
    </div>
  );
}
