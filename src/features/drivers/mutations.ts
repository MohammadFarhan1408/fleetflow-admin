import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StatusChangeValues } from "@/components/shared/status-change";
import { apiClient, unwrap } from "@/lib/api/client";
import { normalizePhone } from "@/lib/phone";
import type { Driver, DriverStatus } from "./api";
import type { DriverValues, LeaveValues } from "./schemas";

const idempotencyHeader = (key: string) => ({ "Idempotency-Key": key });

/**
 * Lists, details, leave and the user picker are refetched, never patched in place, and also after a failure: a 403,
 * 404 or 409 means what the screen shows may be stale.
 */
const useRefetchDrivers = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["drivers"] });
};

/** Create when no driver is given, otherwise update that driver: the one form serves both. */
export const useSaveDriver = (driver?: Driver) => {
  const refetch = useRefetchDrivers();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: DriverValues; idempotencyKey: string }) => {
      const headers = idempotencyHeader(idempotencyKey);
      const profile = { branch_id: values.branch_id, phone: normalizePhone(values.phone) };
      return unwrap(
        driver
          ? apiClient.PATCH("/api/v1/drivers/{public_id}/", {
              params: { path: { public_id: driver.public_id } },
              body: profile,
              headers,
            })
          : apiClient.POST("/api/v1/drivers/", { body: { ...profile, user_id: values.user_id }, headers }),
      );
    },
    onSettled: refetch,
  });
};

export const useChangeDriverStatus = (publicId: string) => {
  const refetch = useRefetchDrivers();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: StatusChangeValues; idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/drivers/{public_id}/status/", {
          params: { path: { public_id: publicId } },
          body: { ...values, status: values.status as DriverStatus },
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: refetch,
  });
};

export const useArchiveDriver = (publicId: string) => {
  const refetch = useRefetchDrivers();
  return useMutation({
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/drivers/{public_id}/archive/", {
          params: { path: { public_id: publicId } },
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: refetch,
  });
};

export const useUnarchiveDriver = (publicId: string) => {
  const refetch = useRefetchDrivers();
  return useMutation({
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/drivers/{public_id}/unarchive/", {
          params: { path: { public_id: publicId } },
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: refetch,
  });
};

export const useAddLeave = (driverId: string) => {
  const refetch = useRefetchDrivers();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: LeaveValues; idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/drivers/{driver_id}/leave/", {
          params: { path: { driver_id: driverId } },
          body: values,
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: refetch,
  });
};

export const useDeleteLeave = (driverId: string) => {
  const refetch = useRefetchDrivers();
  return useMutation({
    mutationFn: ({ leaveId, idempotencyKey }: { leaveId: string; idempotencyKey: string }) =>
      unwrap(
        apiClient.DELETE("/api/v1/drivers/{driver_id}/leave/{public_id}/", {
          params: { path: { driver_id: driverId, public_id: leaveId } },
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: refetch,
  });
};
