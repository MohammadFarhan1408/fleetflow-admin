import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw";
import { confirmedUpload, pdfFile, STORAGE_CORS, STORAGE_URL, storageHandlers, uploadTicket } from "@/test/storage";
import { ApiError } from "./errors";
import { checkUploadFile, describeUploadError, isAbort, StorageError, uploadFile } from "./uploads";

const STORAGE = STORAGE_URL;
const sized = (type: string, size: number, name = "file") => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};
const MB = 1024 * 1024;
const pdf = () => pdfFile();
const ticket = uploadTicket;
const confirmed = () => confirmedUpload();
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-1" }, { status });

describe("checkUploadFile", () => {
  it("accepts each type up to its limit and refuses one byte more", () => {
    expect(checkUploadFile(sized("application/pdf", 20 * MB))).toBeNull();
    expect(checkUploadFile(sized("application/pdf", 20 * MB + 1))).toMatch(/up to 20 MB/);
    expect(checkUploadFile(sized("image/png", 10 * MB))).toBeNull();
    expect(checkUploadFile(sized("image/png", 10 * MB + 1))).toMatch(/up to 10 MB/);
    expect(checkUploadFile(sized("image/jpeg", 10 * MB + 1))).toMatch(/up to 10 MB/);
  });

  it("refuses an empty file, an unsupported type and HEIC with a hint", () => {
    expect(checkUploadFile(sized("application/pdf", 0))).toMatch(/empty/);
    expect(checkUploadFile(sized("text/plain", 10))).toMatch(/PDF, JPEG or PNG/);
    expect(checkUploadFile(sized("image/heic", 10))).toMatch(/Convert it to JPEG/);
  });
});

describe("uploadFile", () => {
  it("asks for a ticket, sends the file with exactly the ticket's headers, then confirms", async () => {
    const seen: { ticketBody?: unknown; putHeaders?: Headers; putBody?: string; confirms: number } = { confirms: 0 };
    server.use(
      http.post("*/bff/api/v1/uploads/", async ({ request }) => {
        seen.ticketBody = await request.json();
        return ticket();
      }),
      http.options(STORAGE, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
      http.put(STORAGE, async ({ request }) => {
        seen.putHeaders = request.headers;
        seen.putBody = await request.text();
        return new HttpResponse(null, { status: 200, headers: STORAGE_CORS });
      }),
      http.post("*/bff/api/v1/uploads/u-1/confirm/", () => {
        seen.confirms += 1;
        return confirmed();
      }),
    );

    await expect(uploadFile(pdf())).resolves.toBe("u-1");

    expect(seen.ticketBody).toEqual({ purpose: "fleet_document", content_type: "application/pdf", size: 8 });
    expect(seen.putHeaders?.get("content-type")).toBe("application/pdf");
    expect(seen.putHeaders?.get("authorization")).toBeNull(); // the session never goes to the storage host
    expect(seen.putBody).toBe("%PDF-1.4");
    expect(seen.confirms).toBe(1);
  });

  it("fails with a StorageError, and does not confirm, when the storage service refuses the file", async () => {
    let confirms = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => ticket()),
      ...storageHandlers(403, "<Error/>"),
      http.post("*/bff/api/v1/uploads/u-1/confirm/", () => {
        confirms += 1;
        return confirmed();
      }),
    );

    const failure = await uploadFile(pdf()).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(StorageError);
    expect((failure as StorageError).status).toBe(403);
    expect(confirms).toBe(0);
  });

  it("confirms a second time when the stored file was not visible yet (upload.not_found)", async () => {
    let confirms = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => ticket()),
      ...storageHandlers(200),
      http.post("*/bff/api/v1/uploads/u-1/confirm/", () => {
        confirms += 1;
        return confirms === 1 ? apiError(400, "upload.not_found") : confirmed();
      }),
    );

    await expect(uploadFile(pdf())).resolves.toBe("u-1");
    expect(confirms).toBe(2);
  });

  it("passes on a rejected file (type mismatch) without a second confirm", async () => {
    let confirms = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => ticket()),
      ...storageHandlers(200),
      http.post("*/bff/api/v1/uploads/u-1/confirm/", () => {
        confirms += 1;
        return apiError(400, "upload.type_mismatch");
      }),
    );

    const failure = await uploadFile(pdf()).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect(confirms).toBe(1);
  });

  it("stops without a request when it is cancelled before it starts", async () => {
    let requests = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => {
        requests += 1;
        return ticket();
      }),
    );
    const controller = new AbortController();
    controller.abort();

    const failure = await uploadFile(pdf(), { signal: controller.signal }).catch((error: unknown) => error);

    expect(isAbort(failure)).toBe(true);
    expect(requests).toBe(0);
  });

  it("stops the transfer, and never confirms, when it is cancelled during the PUT", async () => {
    let confirms = 0;
    const controller = new AbortController();
    server.use(
      http.post("*/bff/api/v1/uploads/", () => ticket()),
      http.options(STORAGE, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
      http.put(STORAGE, async () => {
        controller.abort();
        await delay("infinite");
      }),
      http.post("*/bff/api/v1/uploads/u-1/confirm/", () => {
        confirms += 1;
        return confirmed();
      }),
    );

    const failure = await uploadFile(pdf(), { signal: controller.signal }).catch((error: unknown) => error);

    expect(isAbort(failure)).toBe(true);
    expect(confirms).toBe(0);
  });

  it("refuses a ticket whose URL is not http or https", async () => {
    server.use(http.post("*/bff/api/v1/uploads/", () => ticket({ upload_url: "javascript:alert(1)" })));

    const failure = await uploadFile(pdf()).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(Error);
  });
});

describe("describeUploadError", () => {
  it("never repeats a signed URL or the API's raw message", () => {
    const { message } = describeUploadError(new StorageError(403));
    expect(message).toBe("The upload failed. Try again.");
  });

  it("says a rejected file can't be retried as is, and a storage outage can", () => {
    const rejected = new ApiError(400, { code: "upload.type_mismatch" }, null);
    const outage = new ApiError(503, { code: "storage.unavailable" }, null);
    expect(describeUploadError(rejected).retryable).toBe(false);
    expect(describeUploadError(outage).retryable).toBe(true);
  });
});
