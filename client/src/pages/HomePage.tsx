import Button from "../components/ui/Button";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { homeMetrics, homeProjects, homeServices } from "../data/homeFixtures";

export default function HomePage() {
  return (
    <div className="bg-paper text-ink">
      <Header />

      <main>
        <section className="relative min-h-[calc(100vh-88px)] overflow-hidden bg-ink text-paper">
          <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuDMdULg85Zw5V9QPtGOVei-QYyA1MmHsx2yc9ZBIGrUoRqh3pJP-dIhk1qDiv0NXMvCGogX4Dbmmk-QG5YzoFpIQb5nikCQkp-w_nJovpE9XwhYVmE7hJr37wmL_Rja9kXBI_jN-usYqCHqgoG7YqNlRF4uMvKHGByD0L43GiNS8uEDDwP0jjN6tLfsX33fr6PvHu2EY83uWwliWHb_1744mCbDmlM8kjsZ5f17MSvMdyY2qSE1WaFXCYM3V3_AUJy9hcCcGXbDSfQ')] bg-cover bg-center opacity-80" />
          <div className="absolute inset-0 bg-ink/40" />
          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24">
            <div className="max-w-4xl">
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-grey-light">
                Secure payment portal
              </p>
              <h1 className="mt-6 text-5xl font-display uppercase leading-tight tracking-[-0.04em] sm:text-6xl md:text-[5rem]">
                Stories Worth
                <br />
                Remembering
              </h1>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button className="border-paper text-paper hover:bg-paper hover:text-ink">
                  Book Me
                </Button>
                <Button className="border-paper text-paper hover:bg-paper hover:text-ink">
                  View Portfolio
                </Button>
              </div>
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
                <div key={project.title} className="bg-paper p-8">
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

        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-paper text-center">
          <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxO_b91v9O14XkXdG5fqt9ObZJC9dl06fS6WhSx6vNw60D8X0dSJDnjvhTYVJziV9d22HppVaeduVVkg6fang4UNm5v5NjJ1CaOExo9i8auJUWoxcfPjclJYC9Xb3AskXNjNftWONBaWIevjFOK2j5OEFiKyoWDOtJRaWgWnlOehgNonDnA63e1YGxByzxILHVPRgtNMwG-2N7jZafd9oCvMiVOsK494Zr4MUX9myh13XUlvJ8vdMkI_5ieYZQ4B_1QF3_FbpWly4')] bg-cover bg-center opacity-70" />
          <div className="absolute inset-0 bg-paper/90" />
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
