const quantity = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });

// The API sends decimals as strings ("1500.000") to keep their precision; they are only formatted here, never summed.
export const formatWeightKg = (kilograms: string) => `${quantity.format(Number(kilograms))} kg`;
export const formatVolumeM3 = (cubicMetres: string) => `${quantity.format(Number(cubicMetres))} m³`;
