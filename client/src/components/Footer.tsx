import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-grey-light bg-paper py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-[1rem] uppercase tracking-[0.35em]">
              {SITE_CONFIG.name}
            </p>
            <p className="mt-4 max-w-xl text-[0.95rem] text-grey">
              Elevating visual storytelling through a lens of sophistication and
              modern luxury.
            </p>
          </div>
          <div className="md:col-span-2 md:col-start-7">
            <p className="font-semibold uppercase tracking-[0.25em] text-[0.75rem]">
              Quick Links
            </p>
            <nav className="mt-5 flex flex-col gap-3 text-grey text-[0.9rem]">
              <Link to="/portfolio">Portfolio</Link>
              <Link to="/request-quote">About</Link>
              <Link to="/public-events">Journal</Link>
              <Link to="/request-quote">Contact</Link>
            </nav>
          </div>
          <div className="md:col-span-4">
            <p className="font-semibold uppercase tracking-[0.25em] text-[0.75rem] text-grey">
              Newsletter
            </p>
            <div className="mt-5 flex items-center border-b border-grey-light pb-2">
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="w-full bg-transparent text-[0.9rem] text-ink placeholder:text-grey focus:outline-none"
              />
              <button
                type="button"
                className="text-ink uppercase tracking-[0.25em] text-[0.75rem] transition-colors hover:text-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                Send
              </button>
            </div>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.35em] text-grey">
              Join for studio updates and recent works.
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-grey-light pt-6 text-[0.75rem] text-grey md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <span>
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
              reserved.
            </span>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="text-grey hover:text-ink"
            >
              {SITE_CONFIG.email}
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="text-grey hover:text-ink"
            >
              {SITE_CONFIG.phone}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex gap-3">
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
                href={SITE_CONFIG.social.instagram}
                label="Follow us on Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8" />
                </svg>
              </SocialLink>
              <SocialLink
                href={SITE_CONFIG.social.twitter}
                label="Follow us on X"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M22 4.01c-.77.35-1.6.59-2.47.7a4.26 4.26 0 0 0-7.3 3.88A12.1 12.1 0 0 1 3 3.9a4.2 4.2 0 0 0 1.32 5.7c-.66-.02-1.28-.2-1.82-.5v.05c0 1.9 1.35 3.5 3.14 3.86-.52.14-1.07.18-1.64.07.46 1.44 1.78 2.5 3.35 2.53A8.56 8.56 0 0 1 2 18.58 12.08 12.08 0 0 0 8.29 20c7.55 0 11.68-6.26 11.68-11.68v-.53A8.3 8.3 0 0 0 22 4.01z" />
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
              <SocialLink
                href={SITE_CONFIG.social.whatsapp}
                label="Chat with us on WhatsApp"
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
            </nav>
            <div className="flex flex-wrap gap-5">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
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
  children: React.ReactNode;
}) {
  if (!href)
    return (
      <span
        aria-hidden
        className="w-11 h-11 inline-flex items-center justify-center"
      />
    );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-grey hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      style={{ minWidth: 44, minHeight: 44 }}
    >
      {children}
    </a>
  );
}
