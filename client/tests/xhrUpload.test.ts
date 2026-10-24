import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { updateCsrfTokenFromAuthResponse } from "../src/lib/csrf.ts";
import { uploadWithProgress } from "../src/lib/xhrUpload.ts";

const csrfToken = "b".repeat(64);

describe("progress upload CSRF handling", () => {
  it("sends the current CSRF token with credentials and retains progress reporting", async () => {
    updateCsrfTokenFromAuthResponse("/auth/login", {
      admin: { email: "admin@example.test" },
      csrfToken,
    });

    const headers = new Map<string, string>();
    const progress: number[] = [];
    let requestUrl = "";
    let requestMethod = "";
    let sentBody: FormData | undefined;
    let credentials = false;
    const upload = {} as XMLHttpRequestUpload;
    const fakeRequest = {
      upload,
      status: 201,
      withCredentials: false,
      open(method: string, url: string) {
        requestMethod = method;
        requestUrl = url;
      },
      setRequestHeader(name: string, value: string) {
        headers.set(name, value);
      },
      send(body: FormData) {
        sentBody = body;
        credentials = this.withCredentials;
        this.onload?.({} as ProgressEvent);
      },
      onload: null as ((event: ProgressEvent) => void) | null,
      onerror: null as ((event: ProgressEvent) => void) | null,
    } as unknown as XMLHttpRequest;
    Object.defineProperty(fakeRequest, "upload", {
      value: {
        onprogress: null as ((event: ProgressEvent) => void) | null,
      },
    });

    const formData = new FormData();
    formData.append("image", new Blob(["image"]), "portrait.png");
    const pending = uploadWithProgress(
      "https://api.example.test/portfolio/project-1/photos",
      formData,
      (value) => progress.push(value),
      () => fakeRequest,
    );
    (
      fakeRequest.upload as unknown as {
        onprogress: (event: ProgressEvent & {
          lengthComputable: boolean;
          loaded: number;
          total: number;
        }) => void;
      }
    ).onprogress({ lengthComputable: true, loaded: 1, total: 4 } as never);

    await pending;
    assert.equal(requestMethod, "POST");
    assert.equal(requestUrl, "https://api.example.test/portfolio/project-1/photos");
    assert.equal(headers.get("X-CSRF-Token"), csrfToken);
    assert.equal(credentials, true);
    assert.equal(sentBody, formData);
    assert.deepEqual(progress, [25]);
  });
});
