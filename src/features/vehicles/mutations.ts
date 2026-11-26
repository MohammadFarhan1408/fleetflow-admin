import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, unwrap } from "@/lib/api/client";
import type { Vehicle } from "./api";
import type { VehicleValues } from "./schemas";

/** Create when no vehicle is given, otherwise update that vehicle: the one form serves both. */
export const useSaveVehicle = (vehicle?: Vehicle) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: VehicleValues; idempotencyKey: string }) => {
      const body = {
        ...values,
        required_license_category: values.required_license_category as Vehicle["required_license_category"],
      };
      const headers = { "Idempotency-Key": idempotencyKey };
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
    // Lists and details are refetched, never patched in place, and also after a failure: a 403, 404 or 409
    // means what the screen shows may be stale.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });
};
