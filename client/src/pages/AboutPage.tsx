import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import { SITE_CONFIG } from "../config/site";

const values = [
  {
    title: "Presence before performance",
    body: "The best frames often arrive just before someone notices the camera. We make room for that.",
  },
  {
    title: "Light with restraint",
    body: "We shape scenes with clean light, honest contrast, and enough quiet for the subject to lead.",
  },
  {
    title: "A finished story",
    body: "Every gallery is edited to feel coherent, not crowded. Fewer stronger images, delivered with care.",
  },
];

const process = [
  "Listen to the story, the people, and the practical details.",
  "Plan the visual rhythm: light, timing, location, and must-have moments.",
  "Photograph with calm direction and space for real emotion.",
  "Edit the final gallery into a clean sequence that feels intentional.",
];

const captureTypes = [
  "Weddings",
  "Portraits",
  "Corporate stories",
  "Public events",
  "Editorial commissions",
  "Brand campaigns",
];

export default function AboutPage() {
  return (
    <div className="bg-paper text-text-primary">
      <Header />

      <main id="main">
        <section className="bg-ink-rich text-text-inverse">
          <div className="mx-auto grid min-h-[64vh] max-w-7xl items-end gap-12 px-6 pb-16 pt-24 md:grid-cols-[1.15fr_0.85fr] md:pb-20 md:pt-32">
            <div>
              <p className="mb-6 text-xs uppercase tracking-widest text-text-muted">
                About Malume Photography
              </p>
              <h1 className="max-w-4xl text-5xl font-display font-normal leading-[0.98] tracking-[-0.055em] text-text-inverse sm:text-7xl md:text-[7rem]">
                Images with quiet confidence.
              </h1>
            </div>
            <p className="max-w-xl pb-3 text-xl leading-8 tracking-[-0.02em] text-text-inverse/78 md:justify-self-end">
              Malume Photography is built for people who want their work,
              celebrations, and milestones photographed with intention, warmth,
              and a clear editorial eye.
            </p>
          </div>
        </section>

        <div className="section-divider" />

        <section className="bg-paper py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-muted">
                Our Story
              </p>
              <h2 className="mt-4 text-4xl font-display uppercase tracking-[-0.04em] sm:text-5xl">
                A studio shaped by patience, people, and Nairobi light.
              </h2>
            </div>
            <div className="space-y-6 text-[1rem] leading-8 text-text-secondary">
              <p>
                Malume began with a simple belief: photographs should feel
                composed without feeling forced. The studio works slowly enough
                to notice the small things: hands settling, laughter after the
                formal pose, a room changing when the light turns soft.
              </p>
              <p>
                That approach now carries across weddings, portraits, corporate
                stories, and public events. Each commission is treated as a
                record of atmosphere as much as appearance.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-paper-warm py-20">
          <div className="mx-auto grid max-w-7xl gap-px border border-paper-deep bg-paper-deep px-0 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="bg-paper-white p-8 transition-colors duration-150 hover:bg-paper"
              >
                <h3 className="text-2xl font-display font-semibold uppercase tracking-[-0.03em]">
                  {value.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-text-secondary">
                  {value.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-ink-studio py-20 text-text-inverse">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[5fr_7fr]">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-inverse/60">
                Philosophy
              </p>
              <h2 className="mt-6 text-5xl font-display uppercase tracking-[-0.04em] sm:text-6xl">
                Direction when it helps. Silence when it matters.
              </h2>
            </div>
            <div className="space-y-8">
              <p className="text-[1rem] leading-8 text-text-inverse/72">
                We guide posture, light, and timing, then step back far enough
                for real life to happen. The result is photography that feels
                polished but still belongs to the people in it.
              </p>
              <div className="grid gap-px border border-ink-warm bg-ink-warm sm:grid-cols-2">
                {captureTypes.map((item) => (
                  <div
                    key={item}
                    className="bg-ink-studio p-5 text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-text-inverse/82 transition-colors duration-150 hover:bg-ink-rich hover:text-text-inverse"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-paper py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                Creative Process
              </p>
              <h2 className="mt-4 text-4xl font-display uppercase tracking-[-0.04em] sm:text-5xl">
                Simple, calm, and clear from first note to final gallery.
              </h2>
            </div>
            <ol className="grid gap-px border border-paper-deep bg-paper-deep md:grid-cols-4">
              {process.map((step, index) => (
                <li key={step} className="bg-paper-white p-8">
                  <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                    0{index + 1}
                  </span>
                  <p className="mt-6 text-sm leading-7 text-text-secondary">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-ink-rich py-20 text-center text-text-inverse">
          <div className="mx-auto max-w-3xl px-6">
            <p className="text-xs uppercase tracking-widest text-text-inverse/60">
              Work with {SITE_CONFIG.business.name}
            </p>
            <h2 className="mt-5 text-4xl font-display uppercase tracking-[-0.04em] sm:text-5xl">
              Bring the story. We will bring the eye.
            </h2>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asLink to="/book">
                Book Me
              </Button>
              <Button asLink to="/request-quote" variant="secondary">
                Request a Quote
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
