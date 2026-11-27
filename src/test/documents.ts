import type { FleetDocument } from "@/features/fleet-documents/api";

export const buildDocument = (overrides: Partial<FleetDocument> = {}): FleetDocument => ({
  public_id: "doc-1",
  type: "registration",
  number: "REG-123",
  issued_on: "2026-01-01",
  expires_on: "2027-06-30",
  is_expired: false,
  archived_at: null,
  created_at: "2026-11-20T09:00:00Z",
  ...overrides,
});

export const documentsPage = (results: FleetDocument[], next: string | null = null) => ({
  results,
  next,
  previous: null,
});
