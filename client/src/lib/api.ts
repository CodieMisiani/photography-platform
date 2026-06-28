const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export type ApiPortfolioEvent = {
  id: string;
  title: string;
  category: string;
  cover_url: string;
  event_date: string;
  is_featured: boolean;
  created_at: string;
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
};

export type ApiPublicEvent = {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  ticket_url: string | null;
  price: string;
  is_published: boolean;
};

export type QuoteRequestPayload = {
  client_name: string;
  whatsapp: string;
  email: string;
  description: string;
};

export type AdminUser = {
  email: string;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(
    message: string,
    status: number,
    code = "API_ERROR",
  ) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const body = prepareBody(options.body, headers);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string; code?: string } }
      | null;
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
  },
  portfolio: {
    list: () => request<{ events: ApiPortfolioEvent[] }>("/portfolio"),
  },
  quotes: {
    create: (payload: QuoteRequestPayload) =>
      request<{ quote: unknown }>("/quotes", {
        method: "POST",
        body: payload,
      }),
  },
  invoices: {
    list: () => request<{ invoices: ApiInvoice[] }>("/admin/invoices"),
    lookup: (invoiceNo: string) =>
      request<{ invoice: ApiInvoice }>(`/invoices/${encodeURIComponent(invoiceNo)}`),
    pay: (id: string, phone: string) =>
      request<{ invoice_id: string; checkout_request_id: string | null; status: string }>(
        `/invoices/${id}/pay`,
        {
          method: "POST",
          body: { phone },
        },
      ),
    status: (id: string) =>
      request<Pick<ApiInvoice, "id" | "invoice_no" | "status" | "mpesa_ref" | "paid_at">>(
        `/invoices/${id}/status`,
      ),
  },
  publicEvents: {
    list: () => request<{ events: ApiPublicEvent[] }>("/events"),
  },
};
