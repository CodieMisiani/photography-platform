import { emailLayout } from "./base.js";
export function bookingConfirmationEmail(booking: { client_name: string; event_type: string; event_date: string }) {
  const text = `Hi ${booking.client_name}, we received your ${booking.event_type} booking request for ${booking.event_date}. We will confirm availability within 24 hours.`;
  return { subject: "Booking Request Received — Malume Photography", text, html: emailLayout(`<h1>Booking request received</h1><p>${text}</p>`) };
}
