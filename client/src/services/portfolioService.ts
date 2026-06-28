import { portfolioCmsProjects } from "../data/portfolioFixtures";

export async function fetchPortfolioCmsProjects() {
  return {
    metrics: [
      { label: "Total Items", value: "24" },
      { label: "Featured", value: "06" },
      { label: "Views (30D)", value: "1.2K" },
      { label: "Storage", value: "82%" },
    ],
    projects: portfolioCmsProjects,
  };
}
