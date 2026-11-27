import { queryOptions } from "@tanstack/react-query";

import type { components } from "@/generated/api";
import { apiClient, unwrap } from "@/lib/api/client";

type Schemas = components["schemas"];

export type DocumentOwner = "drivers" | "vehicles";
export type DriverDocumentType = Schemas["DriverDocumentTypeEnum"];
export type VehicleDocumentType = Schemas["VehicleDocumentTypeEnum"];
export type DocumentType = DriverDocumentType | VehicleDocumentType;
export type LicenseCategory = Schemas["LicenseCategoryEnum"];

/** A driver's or a vehicle's document: the same fields, plus the licence categories on a driver's. */
export type FleetDocument = Omit<Schemas["DriverDocument"], "type" | "categories"> & {
  type: DocumentType;
  categories?: LicenseCategory[];
};

/** ponytail: one page of 100 documents, no pager. A fleet record has a handful; `hasMore` shows a note if not. */
const PAGE_SIZE = 100;

// architecture §6: the key starts with the owner module, so refetching `[owner]` after a write also refreshes the
// owner's availability, which documents decide.
export const documentsQueries = {
  list: (owner: DocumentOwner, ownerId: string) =>
    queryOptions({
      queryKey: [owner, "documents", ownerId],
      queryFn: async (): Promise<{ documents: FleetDocument[]; hasMore: boolean }> => {
        const page =
          owner === "drivers"
            ? await unwrap(
                apiClient.GET("/api/v1/drivers/{driver_id}/documents/", {
                  params: { path: { driver_id: ownerId }, query: { page_size: PAGE_SIZE } },
                }),
              )
            : await unwrap(
                apiClient.GET("/api/v1/vehicles/{vehicle_id}/documents/", {
                  params: { path: { vehicle_id: ownerId }, query: { page_size: PAGE_SIZE } },
                }),
              );
        return { documents: page.results, hasMore: Boolean(page.next) };
      },
    }),
};
