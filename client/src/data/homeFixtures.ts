import type { HomeMetric, HomeProject, HomeService } from "../types/home";

export const homeMetrics: HomeMetric[] = [
  { value: "500+", label: "Events Captured" },
  { value: "10 YRS", label: "Experience" },
  { value: "24+", label: "Global Awards" },
  { value: "100%", label: "Satisfaction" },
];

export const homeProjects: HomeProject[] = [
  {
    title: "The Eternal Union",
    location: "Lake Como, Italy",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIPkyrZ97QagJd1npory5nm4A51nw652KGTFaWbt9gnX3fCk28rz7nm57DWTd9PjmIOfc_w8YvQo2-Mc1lMuB66MH4V3EDP8G_XgCVWLUqeM4xI4CdFJyuxFEi5jriI2J7vV9vYiYzIvtof3rJh5_s05YZPob1CjV_dCzPy_uS94Yo0k0hFp7_Z4zsix4cwkKvO8FIntj-kFSMESE0b6H4PLJbSBDmBysN1THJ6bbwB4RQda_ZxlopDCWFyEVBf9BHz2Sc_X5hqkY",
  },
  {
    title: "Sonic Resonance",
    location: "London Metro",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDf3fAhwMZY2MsdPyKcw_y5L35aQ9iQwHzk0JkfOxJWba5JJzGp891x2IXkkjCVXxunOJMAE9H725U3vMwCR5-2Y1C_Y6BswMtiRWOcyQaCAE9qVuKnoIjhU2rPUg3m-fUeHLub5pRWcSB19FrMMAIduo6dA8FOnTVn0iXVew43DAaVVSvDI3nLCcRGOB4E3WMuD17cH5-4nB5e_4ANcMhx9IWU9xS1Fh3zT-hhSn-CXbqvuP5LDo74yd1Ai71pHD6XOg0ovVzVWOs",
  },
];

export const homeServices: HomeService[] = [
  {
    title: "Weddings",
    description:
      "Cinematic storytelling for the most intimate day of your life. We focus on the unscripted moments that define your legacy.",
  },
  {
    title: "Concerts",
    description:
      "Capturing the raw energy and rhythmic soul of live performance. High-octane imagery for artists and festivals.",
  },
  {
    title: "Corporate",
    description:
      "Visual narratives for brands that mean business. Professional portraits and architectural shoots.",
  },
];
