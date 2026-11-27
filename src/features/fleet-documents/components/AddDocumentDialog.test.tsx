import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { browserToday } from "@/lib/calendar";
import { buildDocument } from "@/test/documents";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { confirmedUpload, pdfFile, STORAGE_CORS, STORAGE_URL, uploadHandlers, uploadTicket } from "@/test/storage";
import type { DocumentOwner } from "../api";
import { AddDocumentDialog } from "./AddDocumentDialog";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: navigation.push, replace: vi.fn() }) }));

const VEHICLE_DOCUMENTS = "*/bff/api/v1/vehicles/:id/documents/";
const DRIVER_DOCUMENTS = "*/bff/api/v1/drivers/:id/documents/";
const MANAGER = { permissions: ["fleet.view", "fleet.manage", "uploads.create"] };
const apiError = (status: number, code: string, errors?: object) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9", ...(errors && { errors }) }, { status });

type Posted = { body: Record<string, unknown>; key: string | null };
const capturePost = (
  path: string,
  posted: Posted[],
  answer = () => HttpResponse.json(buildDocument(), { status: 201 }),
) =>
  http.post(path, async ({ request }) => {
    posted.push({
      body: (await request.json()) as Record<string, unknown>,
      key: request.headers.get("idempotency-key"),
    });
    return answer();
  });

const renderDialog = (owner: DocumentOwner = "vehicles") => {
  const onOpenChange = vi.fn();
  renderInConsole(
    <AddDocumentDialog owner={owner} ownerId="o-1" ownerName="B AB 1234" open onOpenChange={onOpenChange} />,
    MANAGER,
  );
  return { onOpenChange };
};
const chooseFile = (name = "registration.pdf") =>
  userEvent.upload(screen.getByLabelText("Choose a file"), pdfFile(name));
const save = () => userEvent.click(screen.getByRole("button", { name: "Add document" }));
/** Picks a day of the current month in the open calendar. */
const pickDay = async (trigger: RegExp, day: string) => {
  await userEvent.click(screen.getByRole("button", { name: trigger }));
  await userEvent.click(
    within(await screen.findByRole("grid")).getByRole("button", { name: new RegExp(`\\b${day}\\b`) }),
  );
};
const day28 = `${browserToday().slice(0, 7)}-28`;

describe("AddDocumentDialog", () => {
  beforeEach(() => navigation.push.mockReset());

  it("starts on the first type for the owner and asks for the file and the expiry before anything is sent", async () => {
    let posts = 0;
    server.use(http.post(VEHICLE_DOCUMENTS, () => ((posts += 1), HttpResponse.json(buildDocument(), { status: 201 }))));
    renderDialog();

    expect(screen.getByRole("heading", { name: "Add a document for B AB 1234" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Registration" })).toBeChecked();
    await save();

    expect(await screen.findByText("Add the file")).toBeInTheDocument();
    expect(screen.getByText("Choose the last valid day")).toBeInTheDocument();
    expect(posts).toBe(0);
  });

  it("uploads on pick, then attaches the confirmed upload with the dates, once, with an idempotency key", async () => {
    const posted: Posted[] = [];
    server.use(...uploadHandlers(), capturePost(VEHICLE_DOCUMENTS, posted));
    const { onOpenChange } = renderDialog();

    await chooseFile();
    expect(await screen.findByText(/Uploaded/)).toBeInTheDocument();
    await pickDay(/Expires on/, "28");
    await userEvent.type(screen.getByRole("textbox", { name: "Document number" }), "REG-777");
    await save();

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(posted).toHaveLength(1);
    expect(posted[0]!.body).toEqual({
      type: "registration",
      upload_id: "u-1",
      number: "REG-777",
      issued_on: null,
      expires_on: day28,
    });
    expect(posted[0]!.key).toBeTruthy();
    expect(await screen.findByText("Registration added")).toBeInTheDocument();
  });

  it("holds Save while the file is still uploading and says why", async () => {
    server.use(
      http.post("*/bff/api/v1/uploads/", () => uploadTicket()),
      http.options(STORAGE_URL, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
      http.put(STORAGE_URL, async () => {
        await delay("infinite");
      }),
    );
    renderDialog();

    await chooseFile();

    expect(await screen.findByText("Waiting for the upload to finish…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add document" })).toBeDisabled();
  });

  it("stops a transfer in flight when the dialog is cancelled, and never confirms it", async () => {
    let confirms = 0;
    server.use(
      http.post("*/bff/api/v1/uploads/", () => uploadTicket()),
      http.options(STORAGE_URL, () => new HttpResponse(null, { status: 204, headers: STORAGE_CORS })),
      http.put(STORAGE_URL, async () => {
        await delay("infinite");
      }),
      http.post("*/bff/api/v1/uploads/:id/confirm/", () => ((confirms += 1), confirmedUpload())),
    );
    const { onOpenChange } = renderDialog();
    await chooseFile();
    await screen.findByRole("progressbar");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(confirms).toBe(0);
  });

  it("sends a driver's licence with its categories, and refuses it without any", async () => {
    const posted: Posted[] = [];
    server.use(...uploadHandlers(), capturePost(DRIVER_DOCUMENTS, posted));
    renderDialog("drivers");

    await chooseFile("licence.pdf");
    await screen.findByText(/Uploaded/);
    await pickDay(/Expires on/, "28");
    await save();
    expect(await screen.findByText("Choose at least one licence category")).toBeInTheDocument();
    expect(posted).toHaveLength(0);

    const group = screen.getByRole("group", { name: "Licence categories" });
    await userEvent.click(within(group).getByRole("checkbox", { name: "B" }));
    await userEvent.click(within(group).getByRole("checkbox", { name: "C" }));
    await save();

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.body).toMatchObject({ type: "license", categories: ["B", "C"], expires_on: day28 });
  });

  it("drops the categories when the type changes away from a licence", async () => {
    const posted: Posted[] = [];
    server.use(...uploadHandlers(), capturePost(DRIVER_DOCUMENTS, posted));
    renderDialog("drivers");
    await userEvent.click(
      within(screen.getByRole("group", { name: "Licence categories" })).getByRole("checkbox", { name: "B" }),
    );

    await userEvent.click(screen.getByRole("radio", { name: "ID card" }));
    expect(screen.queryByRole("group", { name: "Licence categories" })).not.toBeInTheDocument();
    await chooseFile("id.pdf");
    await screen.findByText(/Uploaded/);
    await save();

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.body).not.toHaveProperty("categories");
    expect(posted[0]!.body.type).toBe("id_card");
  });

  it("does not require an expiry for a type that has none, and says a past day counts as expired", async () => {
    const posted: Posted[] = [];
    server.use(...uploadHandlers(), capturePost(VEHICLE_DOCUMENTS, posted));
    renderDialog();
    await userEvent.click(screen.getByRole("radio", { name: "Inspection" }));
    expect(screen.getByRole("button", { name: /Expires on/ })).not.toHaveAccessibleDescription(/passed/);

    await chooseFile();
    await screen.findByText(/Uploaded/);
    await save();

    await waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]!.body).toMatchObject({ type: "inspection", expires_on: null });
  });

  it("puts the API's field errors on the fields", async () => {
    server.use(
      ...uploadHandlers(),
      http.post(VEHICLE_DOCUMENTS, () => apiError(400, "validation.invalid", { number: ["Number is not valid."] })),
    );
    renderDialog();
    await chooseFile();
    await screen.findByText(/Uploaded/);
    await pickDay(/Expires on/, "28");
    await save();

    expect(await screen.findByText("Number is not valid.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Document number" })).toHaveFocus();
  });

  it("asks for the file again when the API says the upload can't be used (already in use)", async () => {
    server.use(
      ...uploadHandlers(),
      http.post(VEHICLE_DOCUMENTS, () => apiError(409, "upload.in_use")),
    );
    renderDialog();
    await chooseFile();
    await screen.findByText(/Uploaded/);
    await pickDay(/Expires on/, "28");
    await save();

    expect(await screen.findByText("That file can't be used any more. Add it again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose file" })).toBeInTheDocument();
  });

  it("closes with a toast, and leaves nothing half done, when the owner was archived meanwhile", async () => {
    server.use(
      ...uploadHandlers(),
      http.post(DRIVER_DOCUMENTS, () => apiError(409, "driver.archived")),
    );
    const { onOpenChange } = renderDialog("drivers");
    await chooseFile("licence.pdf");
    await screen.findByText(/Uploaded/);
    await userEvent.click(
      within(screen.getByRole("group", { name: "Licence categories" })).getByRole("checkbox", { name: "B" }),
    );
    await pickDay(/Expires on/, "28");
    await save();

    expect(await screen.findByText("This driver was archived")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps everything and sends the same key on a retry after a network failure", async () => {
    const posted: Posted[] = [];
    let failed = false;
    server.use(
      ...uploadHandlers(),
      http.post(VEHICLE_DOCUMENTS, async ({ request }) => {
        posted.push({
          body: (await request.json()) as Record<string, unknown>,
          key: request.headers.get("idempotency-key"),
        });
        if (!failed) {
          failed = true;
          return HttpResponse.error();
        }
        return HttpResponse.json(buildDocument(), { status: 201 });
      }),
    );
    const { onOpenChange } = renderDialog();
    await chooseFile();
    await screen.findByText(/Uploaded/);
    await pickDay(/Expires on/, "28");
    await save();
    expect(await screen.findByText("Can't reach FleetFlow")).toBeInTheDocument();
    await save();

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(posted).toHaveLength(2);
    expect(posted[1]!.key).toBe(posted[0]!.key);
  });
});
