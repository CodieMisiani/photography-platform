import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import {
  homeMarqueeImages,
  homeMetrics,
  homeProjects,
  homeServices,
} from "../data/homeFixtures";

export default function HomePage() {
  return (
    <div className="bg-paper text-ink">
      <Header />

      <main>
        <section className="overflow-hidden bg-paper text-ink">
          <div className="mx-auto grid min-h-[56vh] max-w-7xl grid-cols-1 items-end gap-12 px-6 pb-16 pt-24 md:grid-cols-[1.25fr_0.75fr] md:pb-20 md:pt-32">
            <h1 className="max-w-4xl text-6xl font-display font-normal leading-[0.98] tracking-[-0.055em] text-ink sm:text-7xl md:text-[7.2rem]">
              Photography for
              <br />
              Modern Stories
            </h1>
            <p className="max-w-xl pb-3 text-xl leading-7 tracking-[-0.02em] text-ink md:justify-self-end">
              We deliver clean, high-quality studio photography with
              professional lighting, sharp detail, and a refined look for
              brands, portraits, and commercial projects.
            </p>
          </div>

          <div
            className="homepage-marquee border-y border-grey-light"
            aria-label="Featured photography reel"
          >
            <div className="homepage-marquee__track">
              {[...homeMarqueeImages, ...homeMarqueeImages].map(
                (image, index) => (
                  <figure
                    className="homepage-marquee__item"
                    key={`${image.title}-${index}`}
                  >
                    <img
                      src={image.image}
                      alt={image.title}
                      loading={index > 2 ? "lazy" : "eager"}
                    />
                  </figure>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="border-y border-grey-light bg-paper py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
            {homeMetrics.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col gap-3 text-center md:text-left"
              >
                <span className="text-[2rem] font-semibold tracking-[-0.05em] text-ink">
                  {metric.value}
                </span>
                <span className="text-sm uppercase tracking-[0.25em] text-grey">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-paper py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[0.75rem] uppercase tracking-[0.3em] text-grey">
                  Curated works
                </p>
                <h2 className="mt-4 text-4xl font-display uppercase tracking-[-0.04em] text-ink sm:text-5xl">
                  Capturing the pulse of life across genres.
                </h2>
              </div>
              <a
                className="inline-flex items-center gap-2 uppercase tracking-[0.3em] text-sm text-ink underline decoration-ink decoration-1 underline-offset-4"
                href="/portfolio"
              >
                Explore all projects
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="grid gap-px border border-grey-light bg-grey-faint md:grid-cols-2">
              {homeProjects.map((project) => (
                <div key={project.title} className="studio-plane bg-paper p-8">
                  <div className="mb-8 overflow-hidden bg-grey-faint">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-[420px] w-full object-cover"
                    />
                  </div>
                  <div className="flex items-baseline justify-between border-t border-grey-light pt-4">
                    <h3 className="text-sm uppercase tracking-[0.3em] text-ink">
                      {project.title}
                    </h3>
                    <span className="text-[0.75rem] uppercase tracking-[0.3em] text-grey">
                      {project.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink py-20 text-paper">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[5fr_7fr]">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-grey-light">
                Our expertise
              </p>
              <h2 className="mt-6 text-5xl font-display uppercase tracking-[-0.04em] sm:text-6xl">
                Specialized in the art of moments.
              </h2>
            </div>
            <div className="flex flex-col gap-8">
              {homeServices.map((service, index) => (
                <div
                  key={service.title}
                  className="border-t border-grey pt-8"
                >
                  <div className="mb-6 flex items-baseline justify-between gap-4">
                    <h3 className="text-4xl uppercase tracking-[-0.04em]">
                      {service.title}
                    </h3>
                    <span className="text-sm uppercase tracking-[0.3em] text-grey-light">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="max-w-xl text-[0.95rem] leading-7 text-paper/70">
                    {service.description}
                  </p>
                </div>
              ))}
              <div className="border-t border-grey" />
            </div>
          </div>
        </section>

        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden border-t border-grey-light bg-paper text-center">
          <div className="absolute inset-x-0 top-0 h-px bg-ink" />
          <div className="relative mx-auto max-w-4xl px-6">
            <h2 className="text-4xl font-display uppercase tracking-[-0.04em] text-ink sm:text-5xl">
              Let us capture your next story
            </h2>
            <Button className="mt-12 border-ink text-ink hover:bg-ink hover:text-paper">
              Start a project
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
