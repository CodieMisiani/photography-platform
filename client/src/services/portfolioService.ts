import { api } from "../lib/api";

export async function fetchPortfolioCmsProjects() {
  const { events } = await api.portfolio.list();

  return {
    metrics: [
      { label: "Total Items", value: String(events.length).padStart(2, "0") },
      {
        label: "Featured",
        value: String(events.filter((event) => event.is_featured).length).padStart(2, "0"),
      },
      { label: "Views (30D)", value: "1.2K" },
      { label: "Storage", value: "82%" },
    ],
    projects: events.map((event) => ({
      id: event.id,
      title: event.title,
      series: "Portfolio Event",
      category: event.category,
      date: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date(event.event_date)),
      eventDate: event.event_date.slice(0, 10),
      status: event.is_featured ? ("Featured" as const) : ("Published" as const),
      image: event.cover_url,
      coverUrl: event.cover_url,
      isFeatured: event.is_featured,
    })),
  };
}
