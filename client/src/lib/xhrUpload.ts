import { applyCsrfHeaderToRequest } from "./csrf.ts";

type UploadXhr = XMLHttpRequest;
type XhrFactory = () => UploadXhr;

export function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (progress: number) => void,
  createRequest: XhrFactory = () => new XMLHttpRequest(),
) {
  return new Promise<void>((resolve, reject) => {
    const request = createRequest();
    request.open("POST", url);
    request.withCredentials = true;
    applyCsrfHeaderToRequest("POST", request);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error("Upload failed"));
    request.onerror = () => reject(new Error("Upload failed"));
    request.send(formData);
  });
}
