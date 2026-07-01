import Footer from "../components/Footer";
import Header from "../components/Header";

export default function PolicyPage({ type }: { type: "privacy" | "terms" }) {
  const isPrivacy = type === "privacy";

  return (
    <div className="bg-paper text-ink">
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-20">
        <p className="mb-4 text-[0.75rem] uppercase tracking-[0.3em] text-grey">
          Studio Policy
        </p>
        <h1 className="mb-8 text-5xl font-display uppercase tracking-[-0.04em]">
          {isPrivacy ? "Privacy" : "Terms"}
        </h1>
        <div className="space-y-6 text-[0.95rem] leading-8 text-grey">
          <p>
            {isPrivacy
              ? "We collect only the client details needed to respond to enquiries, manage bookings, issue invoices, and complete payments."
              : "Bookings, quotes, invoices, and event listings are managed by the studio team and confirmed only after direct studio follow-up."}
          </p>
          <p>
            Client information is handled through the platform backend and is not
            sold or shared for unrelated marketing. Payment details are processed
            through M-Pesa Daraja; the studio stores payment status and reference
            information only.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
