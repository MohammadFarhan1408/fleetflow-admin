import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, unwrap } from "@/lib/api/client";
import type { DocumentOwner, DriverDocumentType, LicenseCategory, VehicleDocumentType } from "./api";
import type { DocumentValues } from "./schemas";

const idempotencyHeader = (key: string) => ({ "Idempotency-Key": key });

/** Documents change availability, so the whole owner module is refetched, never patched, and also after a failure. */
const useRefetchOwner = (owner: DocumentOwner) => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [owner] });
};

export const useAddDocument = (owner: DocumentOwner, ownerId: string) => {
  const refetch = useRefetchOwner(owner);
  return useMutation({
    mutationFn: async ({ values, idempotencyKey }: { values: DocumentValues; idempotencyKey: string }) => {
      const headers = idempotencyHeader(idempotencyKey);
      const body = {
        upload_id: values.upload_id,
        number: values.number.trim(),
        issued_on: values.issued_on || null,
        expires_on: values.expires_on || null,
      };
      if (owner === "drivers") {
        return unwrap(
          apiClient.POST("/api/v1/drivers/{driver_id}/documents/", {
            params: { path: { driver_id: ownerId } },
            // Only a licence has categories; the API refuses them on any other type.
            body: {
              ...body,
              type: values.type as DriverDocumentType,
              ...(values.type === "license" && { categories: values.categories as LicenseCategory[] }),
            },
            headers,
          }),
        );
      }
      return unwrap(
        apiClient.POST("/api/v1/vehicles/{vehicle_id}/documents/", {
          params: { path: { vehicle_id: ownerId } },
          body: { ...body, type: values.type as VehicleDocumentType },
          headers,
        }),
      );
    },
    onSettled: refetch,
  });
};

export const useArchiveDocument = (owner: DocumentOwner, ownerId: string) => {
  const refetch = useRefetchOwner(owner);
  return useMutation({
    mutationFn: async ({ documentId, idempotencyKey }: { documentId: string; idempotencyKey: string }) => {
      const headers = idempotencyHeader(idempotencyKey);
      if (owner === "drivers") {
        return unwrap(
          apiClient.POST("/api/v1/drivers/{driver_id}/documents/{public_id}/archive/", {
            params: { path: { driver_id: ownerId, public_id: documentId } },
            headers,
          }),
        );
      }
      return unwrap(
        apiClient.POST("/api/v1/vehicles/{vehicle_id}/documents/{public_id}/archive/", {
          params: { path: { vehicle_id: ownerId, public_id: documentId } },
          headers,
        }),
      );
    },
    onSettled: refetch,
  });
};

/**
 * Asks for a download link (valid five minutes, audited by the API). A plain call, not a mutation or a query: the link
 * is a credential, so it is never kept in the cache or in state, and every download asks again.
 */
export const requestDownloadUrl = async (owner: DocumentOwner, ownerId: string, documentId: string) => {
  const { url } =
    owner === "drivers"
      ? await unwrap(
          apiClient.POST("/api/v1/drivers/{driver_id}/documents/{public_id}/download/", {
            params: { path: { driver_id: ownerId, public_id: documentId } },
          }),
        )
      : await unwrap(
          apiClient.POST("/api/v1/vehicles/{vehicle_id}/documents/{public_id}/download/", {
            params: { path: { vehicle_id: ownerId, public_id: documentId } },
          }),
        );
  return url;
};
