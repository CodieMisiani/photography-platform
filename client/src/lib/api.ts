const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export type ApiPortfolioEvent = {
  id: string;
  title: string;
  category: string;
  cover_url: string;
  cover_public_id: string | null;
  event_date: string;
  is_featured: boolean;
  created_at: string;
};

export type ApiProjectPhoto = {
  id: string;
  cloudinary_url: string;
  caption: string | null;
  sort_order: number;
};

export type ApiInvoice = {
  id: string;
  invoice_no: string;
  client_name: string;
  phone: string;
  amount: string;
  status: "unpaid" | "paid" | "failed";
  mpesa_ref: string | null;
  paid_at: string | null;
  line_items: ApiInvoiceLineItem[];
};

export type ApiInvoiceLineItem = {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: string;
  created_at?: string;
};

export type ApiPublicEvent = {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  ticket_url: string | null;
  image_url: string | null;
  image_public_id: string | null;
  price: string;
  is_published: boolean;
};

export type QuoteRequestPayload = {
  client_name: string;
  whatsapp: string;
  email: string;
  description: string;
};

export type BookingPayload = {
  client_name: string;
  whatsapp: string;
  email: string;
  event_date: string;
  event_type: string;
  notes?: string | null;
};

export type ApiBooking = BookingPayload & {
  id: string;
  status: "pending" | "confirmed" | "declined";
};

export type ApiQuoteRequest = QuoteRequestPayload & {
  id: string;
  status: "new" | "responded" | "closed";
  notes: string | null;
  created_at: string;
};

export type AdminUser = {
  email: string;
};

export type ApiNewsletterSubscriber = {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code = "API_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const body = prepareBody(options.body, headers);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string; code?: string };
    } | null;
    throw new ApiError(
      payload?.error?.message ?? "Request failed",
      response.status,
      payload?.error?.code,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function prepareBody(body: RequestOptions["body"], headers: Headers) {
  if (!body) {
    return undefined;
  }
  if (body instanceof FormData || typeof body === "string") {
    return body;
  }
  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}

export const api = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      request<{ admin: AdminUser }>("/auth/login", {
        method: "POST",
        body: payload,
      }),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
    me: () => request<{ admin: AdminUser | null }>("/auth/me"),
    changePassword: (payload: {
      currentPassword: string;
      newPassword: string;
    }) =>
      request<{ ok: true }>("/admin/account/password", {
        method: "PATCH",
        body: payload,
      }),
    changeEmail: (payload: { currentPassword: string; newEmail: string }) =>
      request<{ ok: true; reLoginRequired?: boolean }>("/admin/account/email", {
        method: "PATCH",
        body: payload,
      }),
  },
  portfolio: {
    list: (options?: { featured?: boolean; limit?: number }) => {
      const params = new URLSearchParams();
      if (options?.featured) params.set("featured", "true");
      if (options?.limit) params.set("limit", String(options.limit));
      const suffix = params.toString() ? `?${params.toString()}` : "";
      return request<{ events: ApiPortfolioEvent[] }>(`/portfolio${suffix}`);
    },
    get: (id: string) =>
      request<{ event: ApiPortfolioEvent }>(`/portfolio/${id}`),
    listPhotos: (id: string) =>
      request<{ photos: ApiProjectPhoto[] }>(`/portfolio/${id}/photos`),
    create: (payload: Omit<ApiPortfolioEvent, "id" | "created_at">) =>
      request<{ event: ApiPortfolioEvent }>("/portfolio", {
        method: "POST",
        body: payload,
      }),
    update: (
      id: string,
      payload: Partial<Omit<ApiPortfolioEvent, "id" | "created_at">>,
    ) =>
      request<{ event: ApiPortfolioEvent }>(`/portfolio/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    delete: (id: string) =>
      request<void>(`/portfolio/${id}`, { method: "DELETE" }),
    upload: (file: File) => {
      const body = new FormData();
      body.append("image", file);
      return request<{ secure_url: string; url: string; public_id: string }>(
        "/portfolio/uploads",
        {
          method: "POST",
          body,
        },
      );
    },
  },
  bookings: {
    availability: (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const suffix = params.toString() ? `?${params.toString()}` : "";
      return request<{
        unavailable_dates: Array<{
          date: string;
          reason: string;
          source: string;
        }>;
      }>(`/calendar/availability${suffix}`);
    },
    create: (payload: BookingPayload) =>
      request<{ booking: ApiBooking }>("/bookings", {
        method: "POST",
        body: payload,
      }),
    listAdmin: () => request<{ bookings: ApiBooking[] }>("/admin/bookings"),
    listBlocks: () =>
      request<{
        blocks: Array<{ id: string; blocked_date: string; reason: string }>;
      }>("/admin/calendar-blocks"),
    updateStatus: (id: string, status: ApiBooking["status"]) =>
      request<{ booking: ApiBooking }>(`/admin/bookings/${id}/status`, {
        method: "PATCH",
        body: { status },
      }),
    update: (id: string, payload: Partial<ApiBooking>) =>
      request<{ booking: ApiBooking }>(`/admin/bookings/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    blockDate: (payload: {
      blocked_date: string;
      reason: string;
      booking_id?: string | null;
    }) =>
      request<{ block: { id: string; blocked_date: string; reason: string } }>(
        "/admin/calendar-blocks",
        {
          method: "POST",
          body: payload,
        },
      ),
    unblockDate: (id: string) =>
      request<void>(`/admin/calendar-blocks/${id}`, { method: "DELETE" }),
  },
  quotes: {
    create: (payload: QuoteRequestPayload) =>
      request<{ quote: unknown }>("/quotes", {
        method: "POST",
        body: payload,
      }),
    listAdmin: () => request<{ quotes: ApiQuoteRequest[] }>("/admin/quotes"),
    updateStatus: (id: string, status: ApiQuoteRequest["status"]) =>
      request<{ quote: ApiQuoteRequest }>(`/admin/quotes/${id}/status`, {
        method: "PATCH",
        body: { status },
      }),
    update: (
      id: string,
      payload: Partial<Pick<ApiQuoteRequest, "status" | "notes">>,
    ) =>
      request<{ quote: ApiQuoteRequest }>(`/admin/quotes/${id}`, {
        method: "PATCH",
        body: payload,
      }),
  },
  invoices: {
    list: () => request<{ invoices: ApiInvoice[] }>("/admin/invoices"),
    create: (payload: {
      invoice_no?: string;
      client_name: string;
      phone: string;
      amount?: number;
      line_items?: Array<{
        description: string;
        quantity: number;
        unit_price: number;
      }>;
    }) =>
      request<{ invoice: ApiInvoice }>("/admin/invoices", {
        method: "POST",
        body: payload,
      }),
    update: (
      id: string,
      payload: Partial<{
        client_name: string;
        phone: string;
        amount: number;
        status: ApiInvoice["status"];
        mpesa_ref: string | null;
        line_items: Array<{
          description: string;
          quantity: number;
          unit_price: number;
        }>;
      }>,
    ) =>
      request<{ invoice: ApiInvoice }>(`/admin/invoices/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    delete: (id: string) =>
      request<void>(`/admin/invoices/${id}`, { method: "DELETE" }),
    lookup: (invoiceNo: string) =>
      request<{ invoice: ApiInvoice }>(
        `/invoices/${encodeURIComponent(invoiceNo)}`,
      ),
    pay: (id: string, phone: string) =>
      request<{
        invoice_id: string;
        checkout_request_id: string | null;
        status: string;
      }>(`/invoices/${id}/pay`, {
        method: "POST",
        body: { phone },
      }),
    status: (id: string) =>
      request<
        Pick<
          ApiInvoice,
          "id" | "invoice_no" | "status" | "mpesa_ref" | "paid_at"
        >
      >(`/invoices/${id}/status`),
  },
  publicEvents: {
    list: () => request<{ events: ApiPublicEvent[] }>("/events"),
    listAdmin: () =>
      request<{ events: ApiPublicEvent[] }>("/admin/public-events"),
    create: (payload: Omit<ApiPublicEvent, "id">) =>
      request<{ event: ApiPublicEvent }>("/admin/public-events", {
        method: "POST",
        body: payload,
      }),
    update: (id: string, payload: Partial<Omit<ApiPublicEvent, "id">>) =>
      request<{ event: ApiPublicEvent }>(`/admin/public-events/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    delete: (id: string) =>
      request<void>(`/admin/public-events/${id}`, { method: "DELETE" }),
    upload: (file: File) => {
      const body = new FormData();
      body.append("image", file);
      return request<{ secure_url: string; url: string; public_id: string }>(
        "/admin/public-events/uploads",
        {
          method: "POST",
          body,
        },
      );
    },
  },
  stats: {
    get: () =>
      request<{
        stats: Array<{
          id: string;
          key: string;
          label: string;
          value: number;
          suffix?: string | null;
          sort_order: number;
          is_visible: boolean;
        }>;
      }>("/stats"),
    adminList: () =>
      request<{
        stats: Array<{
          id: string;
          key: string;
          label: string;
          value: number;
          suffix?: string | null;
          sort_order: number;
          is_visible: boolean;
        }>;
      }>("/admin/stats"),
    update: (
      id: string,
      payload: {
        label?: string;
        value?: number;
        suffix?: string | null;
        sort_order?: number;
        is_visible?: boolean;
      },
    ) =>
      request<{
        stat: {
          id: string;
          key: string;
          label: string;
          value: number;
          suffix?: string | null;
          sort_order: number;
          is_visible: boolean;
        };
      }>(`/admin/stats/${id}`, { method: "PATCH", body: payload }),
  },
  journal: {
    list: (page = 1, limit = 9, category?: string) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (category) params.set("category", category);
      return request<{
        posts: Array<{
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          cover_url: string | null;
          category: string | null;
          read_time_minutes: number | null;
          published_at: string | null;
        }>;
        total: number;
        page: number;
        pages: number;
      }>(`/journal?${params.toString()}`);
    },
    get: (slug: string) =>
      request<{
        post: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          cover_url: string | null;
          category: string | null;
          read_time_minutes: number | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
      }>(`/journal/${encodeURIComponent(slug)}`),
    adminList: () =>
      request<{
        posts: Array<{
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          body: string;
          cover_url: string | null;
          cloudinary_public_id: string | null;
          category: string | null;
          read_time_minutes: number | null;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
      }>("/admin/journal"),
    create: (payload: {
      title: string;
      excerpt: string;
      body: string;
      category?: string;
      is_published?: boolean;
      cover?: File | null;
    }) => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("excerpt", payload.excerpt);
      formData.append("body", payload.body);
      if (payload.category) formData.append("category", payload.category);
      formData.append("is_published", payload.is_published ? "true" : "false");
      if (payload.cover) formData.append("cover", payload.cover);
      return request<{ post: unknown }>("/admin/journal", {
        method: "POST",
        body: formData,
      });
    },
    update: (
      id: string,
      payload: {
        title?: string;
        excerpt?: string;
        body?: string;
        category?: string;
        is_published?: boolean;
        cover?: File | null;
      },
    ) => {
      const formData = new FormData();
      if (payload.title !== undefined) formData.append("title", payload.title);
      if (payload.excerpt !== undefined)
        formData.append("excerpt", payload.excerpt);
      if (payload.body !== undefined) formData.append("body", payload.body);
      if (payload.category !== undefined)
        formData.append("category", payload.category);
      if (payload.is_published !== undefined)
        formData.append(
          "is_published",
          payload.is_published ? "true" : "false",
        );
      if (payload.cover) formData.append("cover", payload.cover);
      return request<{ post: unknown }>(`/admin/journal/${id}`, {
        method: "PATCH",
        body: formData,
      });
    },
    delete: (id: string) =>
      request<void>(`/admin/journal/${id}`, { method: "DELETE" }),
  },
  newsletter: {
    subscribe: (email: string) =>
      request<{ ok: true; alreadySubscribed: boolean; message: string }>(
        "/newsletter/subscribe",
        {
          method: "POST",
          body: { email },
        },
      ),
    listSubscribers: () =>
      request<{ subscribers: ApiNewsletterSubscriber[] }>(
        "/admin/newsletter/subscribers",
      ),
    deactivateSubscriber: (id: string) =>
      request<{ subscriber: ApiNewsletterSubscriber }>(
        `/admin/newsletter/subscribers/${id}/deactivate`,
        { method: "PATCH" },
      ),
  },
};
