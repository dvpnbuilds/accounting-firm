import { FaqChat } from "./faq-chat";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Tax & bookkeeping FAQ</h1>
      <p className="text-muted-foreground text-sm">
        Ask a question about Philippine tax or bookkeeping basics. We only answer from our
        knowledge base — for anything else, please contact us directly.
      </p>
      <FaqChat />
    </div>
  );
}
