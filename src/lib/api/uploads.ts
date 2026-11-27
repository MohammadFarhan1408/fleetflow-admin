import type { components } from "@/generated/api";
import { apiClient, unwrap } from "./client";
import { API_ERROR_CODES, ApiError, NetworkError } from "./errors";
import { describeMutationError } from "./mutation-errors";

type UploadContentType = components["schemas"]["UploadContentTypeEnum"];

const MB = 1024 * 1024;

/** Types and size limits from fleetflow-api (architecture §19). UX only: the API and the storage signature enforce them. */
export const UPLOAD_LIMITS: Record<UploadContentType, { maxBytes: number; label: string }> = {
  "application/pdf": { maxBytes: 20 * MB, label: "PDF" },
  "image/jpeg": { maxBytes: 10 * MB, label: "JPEG" },
  "image/png": { maxBytes: 10 * MB, label: "PNG" },
};

export const UPLOAD_ACCEPT = Object.keys(UPLOAD_LIMITS).join(",");

const isUploadType = (type: string): type is UploadContentType => type in UPLOAD_LIMITS;

/** A message when the browser can already tell the file will be refused, otherwise null. */
export const checkUploadFile = (file: File): string | null => {
  if (file.type === "image/heic" || file.type === "image/heif") {
    return "HEIC photos aren't supported. Convert it to JPEG first.";
  }
  if (!isUploadType(file.type)) return "Use a PDF, JPEG or PNG file.";
  if (file.size === 0) return "This file is empty.";
  const { maxBytes, label } = UPLOAD_LIMITS[file.type];
  if (file.size > maxBytes) return `${label} files can be up to ${maxBytes / MB} MB.`;
  return null;
};

/** The storage service refused the file (a bad signature, an expired ticket). The body is never read or shown. */
export class StorageError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Storage answered ${status}`);
    this.name = "StorageError";
    this.status = status;
  }
}

const abortError = () => new DOMException("Upload cancelled", "AbortError");
export const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

type UploadOptions = { signal?: AbortSignal; onProgress?: (fraction: number) => void };

type Ticket = components["schemas"]["UploadTicket"];

/**
 * One PUT straight to the storage service with exactly the headers the ticket names. `fetch` has no upload progress,
 * so this uses XMLHttpRequest. The URL is a credential: it stays in this function and is never stored or logged.
 */
const putToStorage = (ticket: Ticket, file: File, { signal, onProgress }: UploadOptions) =>
  new Promise<void>((resolve, reject) => {
    const protocol = new URL(ticket.upload_url).protocol;
    if (protocol !== "https:" && protocol !== "http:") return reject(new StorageError(0));
    if (signal?.aborted) return reject(abortError());

    const request = new XMLHttpRequest();
    request.open(ticket.method, ticket.upload_url);
    for (const [name, value] of Object.entries(ticket.headers)) request.setRequestHeader(name, value);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300 ? resolve() : reject(new StorageError(request.status));
    request.onerror = () => reject(new NetworkError(null));
    request.onabort = () => reject(abortError());
    signal?.addEventListener("abort", () => request.abort(), { once: true });
    request.send(file);
  });

const confirmUpload = (id: string, signal?: AbortSignal) =>
  unwrap(apiClient.POST("/api/v1/uploads/{public_id}/confirm/", { params: { path: { public_id: id } }, signal }));

/**
 * Ticket, PUT, confirm. Resolves with the confirmed upload's id, which a document then attaches. A retry starts over
 * with a new ticket: the old one is single-use and expires after five minutes.
 */
export const uploadFile = async (file: File, options: UploadOptions = {}): Promise<string> => {
  try {
    return await startUpload(file, options);
  } catch (error) {
    // `unwrap` reports a cancelled request as a network failure; a cancel is the user's choice, not an error.
    if (options.signal?.aborted) throw abortError();
    throw error;
  }
};

const startUpload = async (file: File, options: UploadOptions): Promise<string> => {
  const { signal } = options;
  const ticket = await unwrap(
    apiClient.POST("/api/v1/uploads/", {
      body: { purpose: "fleet_document", content_type: file.type as UploadContentType, size: file.size },
      signal,
    }),
  );
  await putToStorage(ticket, file, options);
  try {
    return (await confirmUpload(ticket.id, signal)).id;
  } catch (error) {
    // `upload.not_found` means the stored object was not visible yet: the API says to confirm again.
    if (!(error instanceof ApiError) || error.code !== API_ERROR_CODES.uploadNotFound) throw error;
    return (await confirmUpload(ticket.id, signal)).id;
  }
};

/** User-safe copy for a failed upload, and whether choosing the same file again can work. */
export const describeUploadError = (error: unknown): { message: string; retryable: boolean } => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case API_ERROR_CODES.uploadTooLarge:
        return { message: "This file is larger than the limit for its type.", retryable: false };
      case API_ERROR_CODES.uploadTypeMismatch:
      case API_ERROR_CODES.uploadSizeMismatch:
        return { message: "This file isn't a valid PDF, JPEG or PNG. Choose another file.", retryable: false };
      case API_ERROR_CODES.storageUnavailable:
        return { message: "File storage is unavailable right now. Try again in a moment.", retryable: true };
      case API_ERROR_CODES.validationInvalid:
        return { message: "This file type isn't accepted. Use a PDF, JPEG or PNG.", retryable: false };
    }
  }
  if (error instanceof StorageError) return { message: "The upload failed. Try again.", retryable: true };
  if (error instanceof NetworkError) {
    return { message: "Can't reach FleetFlow. Check your connection, then try again.", retryable: true };
  }
  const { title, detail } = describeMutationError(error);
  return { message: `${title}. ${detail}`, retryable: true };
};
