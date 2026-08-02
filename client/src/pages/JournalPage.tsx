import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";

const articles = [
  {
    category: "Weddings",
    title: "How a wedding gallery finds its rhythm",
    excerpt:
      "A look at the quiet sequence behind a wedding story: arrivals, vows, family, movement, and the small unscripted frames that hold it together.",
    readTime: "4 min read",
  },
  {
    category: "Behind the Scenes",
    title: "What we watch before pressing the shutter",
    excerpt:
      "Light direction, body language, room energy, and timing often decide whether an image feels natural or merely correct.",
    readTime: "3 min read",
  },
  {
    category: "Corporate",
    title: "Portraits that make teams feel human",
    excerpt:
      "Corporate photography does not have to feel cold. A clear setup and warmer direction can make a team look capable and approachable.",
    readTime: "5 min read",
  },
  {
    category: "Field Notes",
    title: "Why fewer final images can feel stronger",
    excerpt:
      "A tighter gallery respects the client, the story, and the images that deserve more room to breathe.",
    readTime: "3 min read",
  },
];

const topics = [
  "Client stories",
  "Featured galleries",
  "Photography tips",
  "Event notes",
  "Travel stories",
  "Studio process",
];

export default function JournalPage() {
  return (
    <div className="bg-paper text-text-primary">
      <Header />

      <main id="main">
        <section className="bg-ink-rich text-text-inverse">
          <div className="mx-auto grid min-h-[56vh] max-w-7xl items-end gap-12 px-6 pb-16 pt-24 md:grid-cols-[1.1fr_0.9fr] md:pb-20 md:pt-32">
            <div>
              <p className="mb-6 text-[0.75rem] uppercase tracking-[0.3em] text-brass">
                Journal
              </p>
              <h1 className="max-w-4xl text-5xl font-display font-normal leading-[0.98] tracking-[-0.055em] text-text-inverse sm:text-7xl md:text-[7rem]">
                Notes from the work behind the frame.
              </h1>
            </div>
            <p className="max-w-xl pb-3 text-xl leading-8 tracking-[-0.02em] text-text-inverse/78 md:justify-self-end">
              Stories, field notes, and practical guidance from weddings,
              events, portraits, and commissioned brand work.
            </p>
          </div>
        </section>

        <div className="section-divider" />

        <section className="bg-paper py-16">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6">
            {topics.map((topic) => (
              <span
                key={topic}
                className="border border-paper-deep bg-paper-white px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-muted"
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-paper-warm pb-20">
          <div className="mx-auto grid max-w-7xl gap-px border border-paper-deep bg-paper-deep md:grid-cols-2">
            {articles.map((article, index) => (
              <article
                key={article.title}
                className={`group bg-paper-white p-8 transition-colors duration-150 hover:bg-paper ${
                  index === 0 ? "md:col-span-2 md:grid md:grid-cols-[0.85fr_1.15fr] md:gap-10" : ""
                }`}
              >
                <div>
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-brass">
                    {article.category}
                  </p>
                  <h2 className="mt-4 text-3xl font-display font-semibold uppercase leading-tight tracking-[-0.04em] text-text-primary sm:text-4xl">
                    {article.title}
                  </h2>
                </div>
                <div className="mt-8 flex flex-col justify-between gap-8 md:mt-0">
                  <p className="max-w-xl text-[0.95rem] leading-7 text-text-secondary">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-paper-deep pt-5">
                    <span className="text-[0.75rem] uppercase tracking-[0.25em] text-text-muted">
                      {article.readTime}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-text-primary transition-colors duration-150 group-hover:text-accent">
                      Read soon
                      <svg
                        className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-ink-studio py-20 text-text-inverse">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-brass">
                Have a story coming up?
              </p>
              <h2 className="mt-5 max-w-3xl text-4xl font-display uppercase tracking-[-0.04em] sm:text-5xl">
                Tell us what you are planning and we will help shape the visual approach.
              </h2>
            </div>
            <Button asLink to="/request-quote" variant="secondary">
              Start a Project
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
