import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, unwrap } from "@/lib/api/client";
import type { Vehicle } from "./api";
import type { StatusChangeValues, VehicleValues } from "./schemas";

const idempotencyHeader = (key: string) => ({ "Idempotency-Key": key });

/**
 * Lists and details are refetched, never patched in place, and also after a failure: a 403, 404 or 409 means what
 * the screen shows may be stale.
 */
const useRefetchVehicles = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["vehicles"] });
};

/** Create when no vehicle is given, otherwise update that vehicle: the one form serves both. */
export const useSaveVehicle = (vehicle?: Vehicle) => {
  const refetch = useRefetchVehicles();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: VehicleValues; idempotencyKey: string }) => {
      const body = {
        ...values,
        required_license_category: values.required_license_category as Vehicle["required_license_category"],
      };
      const headers = idempotencyHeader(idempotencyKey);
      return unwrap(
        vehicle
          ? apiClient.PATCH("/api/v1/vehicles/{public_id}/", {
              params: { path: { public_id: vehicle.public_id } },
              body,
              headers,
            })
          : apiClient.POST("/api/v1/vehicles/", { body, headers }),
      );
    },
    onSettled: refetch,
  });
};

export const useChangeVehicleStatus = (publicId: string) => {
  const refetch = useRefetchVehicles();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: StatusChangeValues; idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/vehicles/{public_id}/status/", {
          params: { path: { public_id: publicId } },
          body: values,
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: refetch,
  });
};

export const useArchiveVehicle = (publicId: string) => {
  const refetch = useRefetchVehicles();
  return useMutation({
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/vehicles/{public_id}/archive/", {
          params: { path: { public_id: publicId } },
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: refetch,
  });
};
