import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, unwrap } from "@/lib/api/client";
import type { Customer } from "./api";
import type { CustomerValues } from "./schemas";

const idempotencyHeader = (key: string) => ({ "Idempotency-Key": key });

/** Lists and the changed customer are refetched, never patched in place: the API is the source of truth. */
const useInvalidateCustomers = () => {
  const queryClient = useQueryClient();
  return (publicId?: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["customers", "list"] }),
      publicId ? queryClient.invalidateQueries({ queryKey: ["customers", "detail", publicId] }) : undefined,
    ]);
};

/** Create when no customer is given, otherwise update that customer: the one form serves both. */
export const useSaveCustomer = (customer?: Customer) => {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: CustomerValues; idempotencyKey: string }) =>
      unwrap(
        customer
          ? apiClient.PATCH("/api/v1/customers/{public_id}/", {
              params: { path: { public_id: customer.public_id } },
              body: values,
              headers: idempotencyHeader(idempotencyKey),
            })
          : apiClient.POST("/api/v1/customers/", { body: values, headers: idempotencyHeader(idempotencyKey) }),
      ),
    // Also refetch on failure: a 403, 404 or 409 means what the screen shows may be stale.
    onSettled: (saved) => invalidate(saved?.public_id ?? customer?.public_id),
  });
};

export const useArchiveCustomer = (publicId: string) => {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/customers/{public_id}/archive/", {
          params: { path: { public_id: publicId } },
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    // Archiving also archives the customer's addresses, so their cached lists are stale too.
    onSettled: () => Promise.all([invalidate(publicId), invalidate()]),
  });
};
