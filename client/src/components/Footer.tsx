import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../config/site";
import { api } from "../lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const result = await api.newsletter.subscribe(trimmedEmail);
      if (!result.alreadySubscribed) {
        setEmail("");
      }
      setStatus("success");
      setMessage("You're in.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Subscription failed. Please try again.",
      );
    }
  }

  return (
    <footer className="border-t border-ink-warm bg-ink-warm py-14 text-text-inverse">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-[1rem] uppercase tracking-[0.35em]">
              {SITE_CONFIG.name}
            </p>
            <p className="mt-4 max-w-xl text-[0.95rem] text-text-inverse/70">
              Elevating visual storytelling through a lens of sophistication and
              modern luxury.
            </p>
          </div>
          <div className="md:col-span-2 md:col-start-7">
            <p className="font-semibold uppercase tracking-[0.25em] text-[0.75rem] text-brass">
              Quick Links
            </p>
            <nav className="mt-5 flex flex-col gap-3 text-text-inverse/70 text-[0.9rem]">
              <FooterLink to="/portfolio">Portfolio</FooterLink>
              <FooterLink to="/request-quote">About</FooterLink>
              <FooterLink to="/public-events">Journal</FooterLink>
              <FooterLink to="/request-quote">Contact</FooterLink>
            </nav>
          </div>
          <div className="md:col-span-4">
            <p className="font-semibold uppercase tracking-[0.25em] text-[0.75rem] text-brass">
              Newsletter
            </p>
            <form
              onSubmit={handleSubscribe}
              className={`mt-5 flex flex-col gap-3 border-b border-ink-studio pb-3 transition-all duration-300 sm:flex-row sm:items-center ${
                status === "success" ? "scale-95 opacity-0" : "scale-100 opacity-100"
              }`}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status !== "loading") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                placeholder="Your email address"
                className="w-full bg-transparent text-[0.9rem] text-text-inverse placeholder:text-text-inverse/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-ink-warm"
                autoComplete="email"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="min-h-11 border border-accent px-4 py-2 text-left text-accent uppercase tracking-[0.25em] text-[0.75rem] transition-all duration-200 hover:bg-accent-hover hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:text-text-inverse/40 sm:text-right"
              >
                {status === "loading" ? "Subscribing" : "Subscribe"}
              </button>
            </form>
            {message ? (
              <p
                className={`mt-3 text-[0.75rem] transition-opacity duration-300 ${
                  status === "success" ? "opacity-100 delay-200" : "opacity-100"
                } ${
                  status === "error" ? "text-text-inverse" : "text-text-inverse/70"
                }`}
                role={status === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            ) : null}
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.35em] text-text-inverse/60">
              Join for studio updates and recent works.
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-ink-studio pt-6 text-[0.75rem] text-text-inverse/60 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <span>
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
              reserved.
            </span>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="text-text-inverse/60 underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
            >
              {SITE_CONFIG.email}
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="text-text-inverse/60 underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
            >
              {SITE_CONFIG.phone}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex gap-3">
              <SocialLink
                href={SITE_CONFIG.social.tiktok}
                label="Follow us on TikTok"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M17.24 2c.37 3.14 2.13 5.01 5.26 5.2v3.53a8.74 8.74 0 0 1-5.18-1.58v6.67c0 4.31-2.74 7.18-6.82 7.18A6.63 6.63 0 0 1 3.5 16.4c0-4.08 3.28-6.95 7.46-6.17v3.7c-1.92-.56-3.83.7-3.83 2.56 0 1.63 1.22 2.85 2.96 2.85 1.98 0 3.25-1.18 3.25-3.68V2h3.9z" />
                </svg>
              </SocialLink>
              <SocialLink
                href={SITE_CONFIG.social.whatsapp}
                label="Follow us on WhatsApp"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M20.52 3.48A11.92 11.92 0 0 0 12 0C5.37 0 .12 5.25.12 11.88c0 2.08.54 4.03 1.48 5.75L0 24l6.6-1.73A11.88 11.88 0 0 0 12 24c6.63 0 11.88-5.25 11.88-12 0-3.2-1.25-6.2-3.36-8.52zM12 21.5c-1.7 0-3.37-.45-4.82-1.3l-.34-.2-3.93 1 1.04-3.82-.21-.38A9.5 9.5 0 1 1 21.5 12 9.46 9.46 0 0 1 12 21.5z" />
                </svg>
              </SocialLink>
              <SocialLink
                href={SITE_CONFIG.social.twitter}
                label="Follow us on X (Twitter)"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M17.53 3h3.31l-7.23 8.26L22.1 21h-6.65l-5.2-6.8L4.29 21H.98l7.73-8.84L.57 3h6.81l4.7 6.22L17.53 3Zm-1.16 16.29h1.83L6.38 4.62H4.41l11.96 14.67Z" />
                </svg>
              </SocialLink>
              <SocialLink
                href={SITE_CONFIG.social.facebook}
                label="Follow us on Facebook"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H8.08v-2.9h2.36V9.41c0-2.33 1.38-3.62 3.5-3.62.998 0 1.98.072 2.25.104v2.47h-1.45c-1.14 0-1.36.54-1.36 1.33v1.75h2.72l-.44 2.9h-2.28v7.03C18.34 21.19 22 17.06 22 12.07z" />
                </svg>
              </SocialLink>
              <SocialLink
                href={SITE_CONFIG.social.linkedin}
                label="Follow us on LinkedIn"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.1 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7 0h4.8v2.2h.1c.7-1.3 2.4-2.2 4-2.2 4.3 0 5 2.8 5 6.5V24H16V14.6c0-2.2 0-5-3-5s-3.5 2.4-3.5 4.8V24H7V8z" />
                </svg>
              </SocialLink>
            </nav>
            <div className="flex flex-wrap gap-5">
              <FooterLink to="/privacy">Privacy</FooterLink>
              <FooterLink to="/terms">Terms</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  if (!href)
    return (
      <span
        aria-hidden
        className="inline-flex h-11 w-11 items-center justify-center"
      />
    );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center text-text-inverse/60 transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ minWidth: 44, minHeight: 44 }}
    >
      {children}
    </a>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
    >
      {children}
    </Link>
  );
}
