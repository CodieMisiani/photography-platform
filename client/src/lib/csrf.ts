const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const csrfHeaderName = "X-CSRF-Token";
let csrfToken: string | null = null;

export function applyCsrfHeader(method: string, headers: Headers) {
  if (!safeMethods.has(method.toUpperCase()) && csrfToken) {
    headers.set(csrfHeaderName, csrfToken);
  }
}

export function applyCsrfHeaderToRequest(
  method: string,
  request: { setRequestHeader: (name: string, value: string) => void },
) {
  if (!safeMethods.has(method.toUpperCase()) && csrfToken) {
    request.setRequestHeader(csrfHeaderName, csrfToken);
  }
}

export function updateCsrfTokenFromAuthResponse(
  path: string,
  payload: unknown,
) {
  if (path === "/auth/logout") {
    csrfToken = null;
    return;
  }

  if (path !== "/auth/login" && path !== "/auth/me") return;

  if (!payload || typeof payload !== "object") {
    csrfToken = null;
    return;
  }

  const response = payload as {
    admin?: unknown;
    csrfToken?: unknown;
  };
  csrfToken =
    response.admin &&
    typeof response.csrfToken === "string" &&
    /^[a-f\d]{64}$/i.test(response.csrfToken)
      ? response.csrfToken
      : null;
}
