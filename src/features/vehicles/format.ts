const quantity = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });

// The API sends decimals as strings ("1500.000") to keep their precision; they are only formatted here, never summed.
/** The number and its unit apart, for places where the figure leads and the unit is quieter. */
export const formatCapacity = {
  weight: (kilograms: string) => ({ value: quantity.format(Number(kilograms)), unit: "kg" }),
  volume: (cubicMetres: string) => ({ value: quantity.format(Number(cubicMetres)), unit: "m³" }),
};

export const formatWeightKg = (kilograms: string) => `${quantity.format(Number(kilograms))} kg`;
export const formatVolumeM3 = (cubicMetres: string) => `${quantity.format(Number(cubicMetres))} m³`;
