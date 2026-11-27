import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw";
import { confirmedUpload, pdfFile, STORAGE_CORS, STORAGE_URL, uploadHandlers, uploadTicket } from "@/test/storage";
import { FileDropzone } from "./FileDropzone";

const setup = () => {
  const onChange = vi.fn();
  const onBusyChange = vi.fn();
  render(<FileDropzone onChange={onChange} onBusyChange={onBusyChange} />);
  return {
    onChange,
    onBusyChange,
    choose: (file: File) => userEvent.upload(screen.getByLabelText("Choose a file"), file),
  };
};
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });

describe("FileDropzone", () => {
  it("states what it accepts before anything is chosen", () => {
    setup();

    expect(screen.getByRole("button", { name: "Choose file" })).toBeInTheDocument();
    expect(screen.getByText("PDF up to 20 MB, JPEG or PNG up to 10 MB.")).toBeInTheDocument();
  });

  it("uploads as soon as a file is chosen and hands over the confirmed upload's id", async () => {
    server.use(...uploadHandlers());
    const { choose, onChange, onBusyChange } = setup();

    await choose(pdfFile("licence.pdf"));

    expect(await screen.findByText(/Uploaded/)).toBeInTheDocument();
    expect(screen.getByText("licence.pdf")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith("u-1");
    expect(onBusyChange.mock.calls).toEqual([[true], [false]]);
    expect(screen.getByRole("button", { name: "Remove licence.pdf" })).toBeInTheDocument();
  });

  it("refuses a file of the wrong type before any request, and offers no retry for it", async () => {
    let requests = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => {
        requests += 1;
        return uploadTicket();
      }),
    );
    const { onChange } = setup();

    await userEvent.upload(
      screen.getByLabelText("Choose a file"),
      new File(["x"], "notes.txt", { type: "text/plain" }),
      {
        applyAccept: false,
      },
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Use a PDF, JPEG or PNG file.");
    expect(screen.queryByRole("button", { name: /Retry/ })).not.toBeInTheDocument();
    expect(requests).toBe(0);
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("shows progress while the transfer runs and cancels it without confirming", async () => {
    let confirms = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => uploadTicket()),
      http.options(STORAGE_URL, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
      http.put(STORAGE_URL, async () => {
        await delay("infinite");
      }),
      http.post("*/bff/api/v1/uploads/:id/confirm/", () => {
        confirms += 1;
        return confirmedUpload();
      }),
    );
    const { choose, onChange, onBusyChange } = setup();

    await choose(pdfFile("licence.pdf"));

    expect(await screen.findByRole("progressbar", { name: "Uploading licence.pdf" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel uploading licence.pdf" }));

    expect(screen.getByRole("button", { name: "Choose file" })).toBeInTheDocument();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(confirms).toBe(0);
  });

  it("shows a failure with Retry, retries from a new ticket and then succeeds", async () => {
    let tickets = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => {
        tickets += 1;
        return uploadTicket();
      }),
      http.options(STORAGE_URL, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
      http.put(
        STORAGE_URL,
        () => new HttpResponse("<Error/>", { status: tickets === 1 ? 403 : 200, headers: STORAGE_CORS }),
      ),
      http.post("*/bff/api/v1/uploads/:id/confirm/", () => confirmedUpload()),
    );
    const { choose, onChange } = setup();

    await choose(pdfFile("licence.pdf"));
    expect(await screen.findByRole("alert")).toHaveTextContent("The upload failed. Try again.");
    expect(onChange).toHaveBeenLastCalledWith("");
    await userEvent.click(screen.getByRole("button", { name: "Retry uploading licence.pdf" }));

    expect(await screen.findByText(/Uploaded/)).toBeInTheDocument();
    expect(tickets).toBe(2);
    expect(onChange).toHaveBeenLastCalledWith("u-1");
  });

  it("says a file the API rejected can't be retried, and Remove brings the dropzone back", async () => {
    server.use(
      http.post("*/bff/api/v1/uploads/", () => uploadTicket()),
      http.options(STORAGE_URL, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
      http.put(STORAGE_URL, () => new HttpResponse(null, { status: 200, headers: STORAGE_CORS })),
      http.post("*/bff/api/v1/uploads/:id/confirm/", () => apiError(400, "upload.type_mismatch")),
    );
    const { choose } = setup();

    await choose(pdfFile("licence.pdf"));

    expect(await screen.findByRole("alert")).toHaveTextContent("isn't a valid PDF, JPEG or PNG");
    expect(screen.queryByRole("button", { name: /Retry/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove licence.pdf" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Choose file" })).toBeInTheDocument());
  });
});
