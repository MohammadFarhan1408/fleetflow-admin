import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { addDays, browserToday } from "@/lib/calendar";
import { buildDocument, documentsPage } from "@/test/documents";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { DocumentsSection } from "./DocumentsSection";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/fleet/vehicles/v-1",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const LIST = "*/bff/api/v1/vehicles/:id/documents/";
const ARCHIVE = "*/bff/api/v1/vehicles/:id/documents/:docId/archive/";
const DRIVER_LIST = "*/bff/api/v1/drivers/:id/documents/";
const apiError = (status: number, code: string) =>
  HttpResponse.json({ code, detail: "x", request_id: "req-9" }, { status });
const MANAGER = { permissions: ["fleet.view", "fleet.manage", "uploads.create"] };
const VIEWER = { permissions: ["fleet.view"] };
const today = browserToday();

const renderVehicle = (session = MANAGER, archived = false) =>
  renderInConsole(
    <DocumentsSection owner="vehicles" ownerId="v-1" ownerName="B AB 1234" archived={archived} />,
    session,
  );

describe("DocumentsSection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows each document with its dates and where it stands: valid, expires soon, expired, no expiry", async () => {
    server.use(
      http.get(LIST, () =>
        HttpResponse.json(
          documentsPage([
            buildDocument({ public_id: "d1", type: "registration", number: "REG-1", expires_on: addDays(today, 90) }),
            buildDocument({ public_id: "d2", type: "insurance", number: "", expires_on: addDays(today, 10) }),
            buildDocument({
              public_id: "d3",
              type: "inspection",
              number: "",
              expires_on: addDays(today, -5),
              is_expired: true,
            }),
            buildDocument({ public_id: "d4", type: "other", number: "", expires_on: null, issued_on: null }),
          ]),
        ),
      ),
    );
    renderVehicle();

    await screen.findByText("REG-1");
    const rows = within(screen.getByRole("table", { name: "Documents" }))
      .getAllByRole("row")
      .slice(1);
    expect(within(rows[0]!).getByText("Registration")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("REG-1")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("Valid")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Expires in 10 days")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("Expired")).toBeInTheDocument();
    expect(within(rows[3]!).getByText("No expiry date")).toBeInTheDocument();
  });

  it("shows a driver's licence categories", async () => {
    server.use(
      http.get(DRIVER_LIST, () =>
        HttpResponse.json(documentsPage([buildDocument({ type: "license", categories: ["B", "C1"] })])),
      ),
    );
    renderInConsole(<DocumentsSection owner="drivers" ownerId="d-1" ownerName="Dana" archived={false} />, MANAGER);

    const categories = await screen.findByRole("list", { name: "Categories" });
    expect(
      within(categories)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["B", "C1"]);
  });

  it("says what a vehicle needs when it has no documents, and offers Add to a manager", async () => {
    server.use(http.get(LIST, () => HttpResponse.json(documentsPage([]))));
    renderVehicle();

    expect(await screen.findByText("No documents yet")).toBeInTheDocument();
    expect(screen.getByText("A vehicle needs a valid registration and insurance to be assigned.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add document" })).toBeInTheDocument();
  });

  it("says what a driver needs when they have no documents", async () => {
    server.use(http.get(DRIVER_LIST, () => HttpResponse.json(documentsPage([]))));
    renderInConsole(<DocumentsSection owner="drivers" ownerId="d-1" ownerName="Dana" archived={false} />, MANAGER);

    expect(await screen.findByText("A driver needs a valid driving licence to be assigned.")).toBeInTheDocument();
  });

  it("shows a loading table, then a retryable error with the request ID", async () => {
    let calls = 0;
    server.use(
      http.get(LIST, () => {
        calls += 1;
        return calls === 1 ? apiError(500, "server_error") : HttpResponse.json(documentsPage([buildDocument()]));
      }),
    );
    renderVehicle();

    expect(screen.getByRole("table", { name: "Documents" })).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText("Reference: req-9")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("REG-123")).toBeInTheDocument();
  });

  it("offers a viewer no Add, Download or Archive, and shows no number (the API sends none)", async () => {
    server.use(http.get(LIST, () => HttpResponse.json(documentsPage([buildDocument({ number: null })]))));
    renderVehicle(VIEWER);

    expect(await screen.findByText("Registration")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add document" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Download|Archive/ })).not.toBeInTheDocument();
    expect(screen.queryByText("REG-123")).not.toBeInTheDocument();
  });

  it("offers no Add without the permission to upload, though the manager can still download and archive", async () => {
    server.use(http.get(LIST, () => HttpResponse.json(documentsPage([buildDocument()]))));
    renderVehicle({ permissions: ["fleet.view", "fleet.manage"] });

    expect(await screen.findByText("Registration")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add document" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive Registration REG-123" })).toBeInTheDocument();
  });

  it("is read-only for an archived owner, except that a document can still be downloaded", async () => {
    server.use(http.get(LIST, () => HttpResponse.json(documentsPage([buildDocument()]))));
    renderVehicle(MANAGER, true);

    expect(await screen.findByRole("button", { name: "Download Registration REG-123" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add document" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Archive/ })).not.toBeInTheDocument();
  });

  it("says when only the newest documents are shown", async () => {
    server.use(http.get(LIST, () => HttpResponse.json(documentsPage([buildDocument()], "http://api.test/next"))));
    renderVehicle();

    expect(await screen.findByText("Showing the 100 most recently added documents.")).toBeInTheDocument();
  });

  it("archives only after a confirmation that names the document, then refetches", async () => {
    let archived = false;
    let lists = 0;
    let archiveKey: string | null = null;
    server.use(
      http.get(LIST, () => {
        lists += 1;
        return HttpResponse.json(documentsPage(archived ? [] : [buildDocument()]));
      }),
      http.post(ARCHIVE, ({ request }) => {
        archived = true;
        archiveKey = request.headers.get("idempotency-key");
        return HttpResponse.json(buildDocument({ archived_at: "2026-11-27T10:00:00Z" }));
      }),
    );
    renderVehicle();

    await userEvent.click(await screen.findByRole("button", { name: "Archive Registration REG-123" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Archive Registration REG-123?" })).toBeInTheDocument();
    expect(archived).toBe(false);
    await userEvent.click(within(dialog).getByRole("button", { name: "Archive document" }));

    expect(await screen.findByText("No documents yet")).toBeInTheDocument();
    expect(await screen.findByText("Registration REG-123 archived")).toBeInTheDocument();
    expect(archiveKey).toBeTruthy();
    expect(lists).toBe(2);
  });

  it("refetches after a failed archive too, and closes with a toast when the vehicle was archived meanwhile", async () => {
    let lists = 0;
    server.use(
      http.get(LIST, () => {
        lists += 1;
        return HttpResponse.json(documentsPage([buildDocument()]));
      }),
      http.post(ARCHIVE, () => apiError(409, "vehicle.archived")),
    );
    renderVehicle();

    await userEvent.click(await screen.findByRole("button", { name: "Archive Registration REG-123" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Archive document" }));

    expect(await screen.findByText("This vehicle was archived")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(lists).toBe(2);
  });
});
