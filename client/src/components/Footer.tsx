import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-grey-light bg-paper py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-[1rem] uppercase tracking-[0.35em]">
              Elara Studio
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
          <span>(c) 2024 Elara Photography. All rights reserved.</span>
          <div className="flex flex-wrap gap-5">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
