import { http, HttpResponse } from "msw";

export const STORAGE_URL = "http://storage.test/bucket/file.pdf";

// jsdom enforces CORS like a browser, so the storage mock answers the preflight and allows the origin.
export const STORAGE_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "PUT",
};

/** The storage host: the preflight, then a PUT answered with `status`. */
export const storageHandlers = (status = 200, body: string | null = null) => [
  http.options(STORAGE_URL, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
  http.put(STORAGE_URL, () => new HttpResponse(body, { status, headers: STORAGE_CORS })),
];

/** `POST /uploads/`: a ticket for `STORAGE_URL`. The signature in the URL is a stand-in credential. */
export const uploadTicket = (extra: object = {}) =>
  HttpResponse.json(
    {
      id: "u-1",
      upload_url: `${STORAGE_URL}?X-Amz-Signature=secret`,
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      expires_at: "2026-11-27T12:00:00Z",
      ...extra,
    },
    { status: 201 },
  );

/** `POST /uploads/{id}/confirm/` for a PDF. */
export const confirmedUpload = (id = "u-1") =>
  HttpResponse.json({ id, purpose: "fleet_document", content_type: "application/pdf", size: 8, status: "confirmed" });

/** The three calls of a successful upload. */
export const uploadHandlers = () => [
  http.post("*/bff/api/v1/uploads/", () => uploadTicket()),
  ...storageHandlers(),
  http.post("*/bff/api/v1/uploads/:id/confirm/", () => confirmedUpload()),
];

export const pdfFile = (name = "licence.pdf") => new File(["%PDF-1.4"], name, { type: "application/pdf" });
