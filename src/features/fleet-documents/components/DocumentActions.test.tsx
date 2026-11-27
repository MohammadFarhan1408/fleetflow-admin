import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildDocument } from "@/test/documents";
import { server } from "@/test/msw";
import { renderInConsole } from "@/test/render";
import { DocumentActions } from "./DocumentActions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const DOWNLOAD = "*/bff/api/v1/vehicles/:id/documents/:docId/download/";
const SIGNED = "http://storage.test/bucket/key.pdf?X-Amz-Signature=very-secret";
const MANAGER = { permissions: ["fleet.view", "fleet.manage", "uploads.create"] };

const renderActions = () =>
  renderInConsole(<DocumentActions owner="vehicles" ownerId="v-1" document={buildDocument()} canArchive />, MANAGER);
// The browser follows the link by clicking an anchor; jsdom has no navigation, so the click is observed instead.
const clicked = () => vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

describe("DocumentActions", () => {
  afterEach(() => vi.restoreAllMocks());

  it("asks the API for a fresh link at every download and keeps it nowhere", async () => {
    let asked = 0;
    server.use(
      http.post(DOWNLOAD, () => {
        asked += 1;
        return HttpResponse.json({ url: SIGNED, expires_at: "2026-11-27T12:05:00Z" });
      }),
    );
    const click = clicked();
    const { client } = renderActions();

    await userEvent.click(screen.getByRole("button", { name: "Download Registration REG-123" }));
    await vi.waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole("button", { name: "Download Registration REG-123" }));
    await vi.waitFor(() => expect(click).toHaveBeenCalledTimes(2));

    expect(asked).toBe(2);
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.href).toBe(SIGNED);
    const held = JSON.stringify([
      client
        .getQueryCache()
        .getAll()
        .map((query) => query.state.data),
      client
        .getMutationCache()
        .getAll()
        .map((mutation) => mutation.state),
    ]);
    expect(held).not.toContain("very-secret");
    expect(document.body.innerHTML).not.toContain("very-secret");
  });

  it("says so in a toast, and follows nothing, when the API refuses the download", async () => {
    server.use(
      http.post(DOWNLOAD, () =>
        HttpResponse.json({ code: "permission.denied", detail: "x", request_id: "req-9" }, { status: 403 }),
      ),
    );
    const click = clicked();
    renderActions();

    await userEvent.click(screen.getByRole("button", { name: "Download Registration REG-123" }));

    expect(await screen.findByText("Couldn't download Registration REG-123")).toBeInTheDocument();
    expect(click).not.toHaveBeenCalled();
  });

  it("refuses a download link that is not http or https", async () => {
    server.use(
      http.post(DOWNLOAD, () => HttpResponse.json({ url: "javascript:alert(1)", expires_at: "2026-11-27T12:05:00Z" })),
    );
    const click = clicked();
    renderActions();

    await userEvent.click(screen.getByRole("button", { name: "Download Registration REG-123" }));

    expect(await screen.findByText("Couldn't download Registration REG-123")).toBeInTheDocument();
    expect(click).not.toHaveBeenCalled();
  });
});
