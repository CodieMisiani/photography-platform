import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SITE_CONFIG } from "../config/site";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import useScrollProgress from "../hooks/useScrollProgress";

export default function PublicExperienceLayer() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const progress = useScrollProgress();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (isAdmin) {
    return null;
  }

  return (
    <>
      {!prefersReducedMotion ? (
        <div
          className="fixed left-0 top-0 z-[100] h-0.5 bg-accent"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      ) : null}
      <FloatingWhatsApp />
    </>
  );
}

function FloatingWhatsApp() {
  const [isPastIntro, setIsPastIntro] = useState(false);
  const whatsappHref = SITE_CONFIG.social.whatsapp || toWhatsAppHref(SITE_CONFIG.business.whatsapp);

  useEffect(() => {
    const update = () => setIsPastIntro(window.scrollY > 400);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={`whatsapp-fab group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center bg-[#25D366] text-white transition-all duration-200 hover:scale-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] ${
        isPastIntro ? "md:flex" : "md:hidden"
      }`}
    >
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap border border-ink-rich bg-ink-rich px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-text-inverse opacity-0 transition-opacity duration-150 group-hover:opacity-100 md:block">
        Chat with us
      </span>
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.92 11.92 0 0 0 12 0C5.37 0 .12 5.25.12 11.88c0 2.08.54 4.03 1.48 5.75L0 24l6.6-1.73A11.88 11.88 0 0 0 12 24c6.63 0 11.88-5.25 11.88-12 0-3.2-1.25-6.2-3.36-8.52zM12 21.5c-1.7 0-3.37-.45-4.82-1.3l-.34-.2-3.93 1 1.04-3.82-.21-.38A9.5 9.5 0 1 1 21.5 12 9.46 9.46 0 0 1 12 21.5zm5.22-7.1c-.29-.14-1.72-.85-1.99-.95-.27-.1-.47-.14-.67.14-.19.28-.76.95-.93 1.15-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.03 2.81 1.17 3c.14.19 2.03 3.1 4.92 4.35.69.3 1.22.48 1.64.61.69.22 1.31.19 1.81.12.55-.08 1.72-.7 1.96-1.38.24-.67.24-1.25.17-1.38-.07-.12-.26-.19-.55-.33z" />
      </svg>
    </a>
  );
}

function toWhatsAppHref(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}
