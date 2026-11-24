import type { Customer, CustomerAddress } from "@/features/customers/api";

export const buildCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  public_id: "c-0001",
  kind: "business",
  name: "Northwind Traders",
  email: "ops@northwind.test",
  phone: "+4930123456",
  archived_at: null,
  created_at: "2026-11-01T09:00:00Z",
  updated_at: "2026-11-02T09:00:00Z",
  ...overrides,
});

export const buildAddress = (overrides: Partial<CustomerAddress> = {}): CustomerAddress => ({
  public_id: "a-0001",
  label: "Main warehouse",
  contact_name: "Mia Lager",
  phone: "+4930123456",
  line1: "Hafenstrasse 4",
  line2: "",
  city: "Berlin",
  region: "",
  postal_code: "10115",
  country: "DE",
  latitude: null,
  longitude: null,
  geocode_confidence: "none",
  archived_at: null,
  created_at: "2026-11-01T09:00:00Z",
  updated_at: "2026-11-01T09:00:00Z",
  ...overrides,
});
