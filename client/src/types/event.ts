export type EventCategory = "Workshop" | "Exhibition" | "Studio Talk";

export type PublicEvent = {
  id: string;
  day: string;
  month: string;
  category: EventCategory;
  title: string;
  description: string;
  location: string;
  price: string;
  image: string;
  imageAlt: string;
};
