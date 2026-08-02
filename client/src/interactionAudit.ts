// 2026 INTERACTION AUDIT
//
// HOVER STATES MISSING OR WEAK:
// - Footer social icons: color changes exist, but there is no micro-lift or scale.
// - Footer nav/legal links: color changes exist, but fine underline feedback is missing.
// - Portfolio cards: warm overlay exists, but image zoom, title lift, accent line, and cursor treatment are missing.
// - Homepage services/projects: cards and service rows still feel mostly static.
// - Admin table/list rows: most rows do not respond with immediate hover background.
//
// INTERACTIONS MISSING:
// - Public layout: no scroll progress indicator.
// - Portfolio page: no image lightbox, outside-click close, or keyboard navigation.
// - Booking flow: successful booking is still a static text message.
// - Public layout: no floating WhatsApp chat shortcut.
// - Navbar: no scroll-aware state past the top threshold.
//
// FOOTER GAPS:
// - Newsletter success swaps text statically instead of animating the form out and success message in.
// - Legal links need underline-offset hover treatment.
// - Newsletter focus ring needs the stronger accent ring and offset.
//
// ELEMENTS THAT FEEL FLAT OR DATED:
// - Admin empty/loading states are plain text.
// - Admin sidebar inactive links have no brass left-edge hover affordance.
// - Public event rows and admin resource rows do not feel tactile.
// - Homepage arrow links do not nudge.
//
// 2026 OPPORTUNITIES:
// - Header: add scroll-aware dark glass state after 80px with reduced-motion-safe transitions.
// - PortfolioPage: add a portal lightbox over the filtered set.
// - Public shell: add scroll progress and WhatsApp CTA only outside admin routes.
// - Footer: add icon lift, link underline, and animated newsletter success.
// - Admin pages: introduce shared warm editorial empty state component.
// - BookPage: replace static success copy with a drawn checkmark confirmation.
export {};
