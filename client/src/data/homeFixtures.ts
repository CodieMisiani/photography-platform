import type { HomeMetric, HomeProject, HomeService } from "../types/home";
import architectureImage from "../assets/images/marquee-architecture.svg";
import concertImage from "../assets/images/marquee-concert.svg";
import portraitImage from "../assets/images/marquee-portrait.svg";
import studioImage from "../assets/images/marquee-studio.svg";
import weddingImage from "../assets/images/marquee-wedding.svg";

export const homeMetrics: HomeMetric[] = [
  { value: "500+", label: "Events Captured" },
  { value: "10 YRS", label: "Experience" },
  { value: "24+", label: "Global Awards" },
  { value: "100%", label: "Satisfaction" },
];

export const homeProjects: HomeProject[] = [
  {
    title: "The Eternal Union",
    location: "Nairobi Arboretum, Kenya",
    image: weddingImage,
  },
  {
    title: "Sonic Resonance",
    location: "Nairobi Festival Grounds",
    image: concertImage,
  },
];

export const homeMarqueeImages: HomeProject[] = [
  {
    title: "Modern Portrait",
    location: "Nairobi Studio",
    image: portraitImage,
  },
  {
    title: "Editorial Wedding",
    location: "Diani Coast, Kenya",
    image: weddingImage,
  },
  {
    title: "Commercial Detail",
    location: "Studio Tabletop",
    image: studioImage,
  },
  {
    title: "Architectural Lines",
    location: "Nairobi Art Gallery",
    image: architectureImage,
  },
  {
    title: "Live Performance",
    location: "Nairobi Festival Grounds",
    image: concertImage,
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
