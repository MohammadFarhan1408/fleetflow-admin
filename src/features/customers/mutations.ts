import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient, unwrap } from "@/lib/api/client";
import type { Customer, CustomerAddress } from "./api";
import { toAddressBody, type AddressValues, type CustomerValues } from "./schemas";

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

const addressKey = (customerId: string) => ["customers", "addresses", customerId] as const;

/** Create when no address is given, otherwise update that address: the one form serves both. */
export const useSaveAddress = (customerId: string, address?: CustomerAddress) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, idempotencyKey }: { values: AddressValues; idempotencyKey: string }) => {
      const body = toAddressBody(values);
      const headers = idempotencyHeader(idempotencyKey);
      return unwrap(
        address
          ? apiClient.PATCH("/api/v1/customers/{customer_id}/addresses/{public_id}/", {
              params: { path: { customer_id: customerId, public_id: address.public_id } },
              body,
              headers,
            })
          : apiClient.POST("/api/v1/customers/{customer_id}/addresses/", {
              params: { path: { customer_id: customerId } },
              body,
              headers,
            }),
      );
    },
    // Also refetch on failure: a 403, 404 or 409 means what the screen shows may be stale.
    onSettled: () => queryClient.invalidateQueries({ queryKey: addressKey(customerId) }),
  });
};

export const useArchiveAddress = (customerId: string, addressId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idempotencyKey }: { idempotencyKey: string }) =>
      unwrap(
        apiClient.POST("/api/v1/customers/{customer_id}/addresses/{public_id}/archive/", {
          params: { path: { customer_id: customerId, public_id: addressId } },
          headers: idempotencyHeader(idempotencyKey),
        }),
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: addressKey(customerId) }),
  });
};
