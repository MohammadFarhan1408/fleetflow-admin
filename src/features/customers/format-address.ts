import type { CustomerAddress } from "./api";

/** "Hafenstrasse 4, Berlin 10115, DE": the parts that exist, in postal order. */
export const formatAddress = (address: CustomerAddress) =>
  [
    address.line1,
    address.line2,
    [address.city, address.region, address.postal_code].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

/** What to call an address in a title or message: its label, otherwise its first line. */
export const addressTitle = (address: CustomerAddress) => address.label || address.line1;
