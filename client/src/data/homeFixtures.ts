import type { HomeMetric, HomeProject, HomeService } from "../types/home";
import celebrationToastImage from "../assets/images/home/celebration-toast.jpg";
import couplePortraitImage from "../assets/images/home/couple-portrait.jpg";
import editorialPortraitImage from "../assets/images/home/editorial-portrait.jpg";
import familyCelebrationImage from "../assets/images/home/family-celebration.jpg";
import fieldArrivalImage from "../assets/images/home/field-arrival.jpg";
import groupPortraitImage from "../assets/images/home/group-portrait.jpg";
import roadsideStyleImage from "../assets/images/home/roadside-style.jpg";

export const homeMetrics: HomeMetric[] = [
  { value: "500+", label: "Events Captured" },
  { value: "10 YRS", label: "Experience" },
  { value: "24+", label: "Global Awards" },
  { value: "100%", label: "Satisfaction" },
];

export const homeProjects: HomeProject[] = [
  {
    title: "Family Celebration",
    location: "Nairobi, Kenya",
    image: familyCelebrationImage,
  },
  {
    title: "Editorial Arrival",
    location: "Limuru, Kenya",
    image: fieldArrivalImage,
  },
];

export const homeMarqueeImages: HomeProject[] = [
  {
    title: "Editorial Portrait",
    location: "Limuru, Kenya",
    image: editorialPortraitImage,
  },
  {
    title: "Couple Portrait",
    location: "Limuru, Kenya",
    image: couplePortraitImage,
  },
  {
    title: "Celebration Toast",
    location: "Nairobi, Kenya",
    image: celebrationToastImage,
  },
  {
    title: "Roadside Style",
    location: "Limuru, Kenya",
    image: roadsideStyleImage,
  },
  {
    title: "Group Portrait",
    location: "Nairobi, Kenya",
    image: groupPortraitImage,
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
