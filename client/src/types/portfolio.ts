export type PortfolioItem = {
  id: string;
  title: string;
  category: "Weddings" | "Corporate" | "Concerts" | "Portraits";
  year: string;
  image: string;
};

export type PortfolioCmsProject = {
  id: string;
  title: string;
  series: string;
  category: string;
  date: string;
  eventDate: string;
  status: "Featured" | "Published" | "Draft";
  image: string;
  coverUrl: string | null;
  coverPublicId?: string | null;
  isFeatured: boolean;
  isPublished?: boolean;
};
