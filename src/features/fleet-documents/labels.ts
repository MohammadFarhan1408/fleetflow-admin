import type { DocumentOwner, DocumentType, DriverDocumentType, VehicleDocumentType } from "./api";

// Labels follow the generated enum descriptions.
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  license: "Driving licence",
  id_card: "ID card",
  medical: "Medical certificate",
  registration: "Registration",
  insurance: "Insurance",
  inspection: "Inspection",
  other: "Other",
};

export const DOCUMENT_TYPES = {
  drivers: ["license", "id_card", "medical", "other"],
  vehicles: ["registration", "insurance", "inspection", "other"],
} as const satisfies Record<DocumentOwner, readonly (DriverDocumentType | VehicleDocumentType)[]>;

/** Types the API requires an expiry date for (CHANGELOG: Phase 3 PR 3). */
export const TYPES_WITH_EXPIRY: readonly DocumentType[] = ["license", "medical", "registration", "insurance"];

/** What the owner needs before it can be assigned: the empty state's sentence. */
export const REQUIRED_DOCUMENTS_NOTE: Record<DocumentOwner, string> = {
  drivers: "A driver needs a valid driving licence to be assigned.",
  vehicles: "A vehicle needs a valid registration and insurance to be assigned.",
};

export const OWNER_SUBJECT: Record<DocumentOwner, string> = { drivers: "driver", vehicles: "vehicle" };

export const NUMBER_MAX_LENGTH = 50;
