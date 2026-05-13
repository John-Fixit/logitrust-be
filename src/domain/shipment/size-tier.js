/**
 * Single source of truth for shipment package size tiers.
 * Used by Joi validators and shipmentService when resolving weight (kg) for pricing/ops.
 *
 * `representativeKg` is the nominal weight stored on the shipment row when the customer
 * picks a tier (estimate until weighed at pickup).
 */
const SIZE_TIER_CONFIG = {
  documents: {
    label: "Documents / light mail",
    description: "Letters, flat documents, very small items (typically under 0.5 kg)",
    representativeKg: 0.25,
  },
  small_parcel: {
    label: "Small parcel",
    description: "Shoe-box size or similar (about 0.5–2 kg)",
    representativeKg: 1.25,
  },
  medium_parcel: {
    label: "Medium parcel",
    description: "Standard box (about 2–8 kg)",
    representativeKg: 5,
  },
  large_parcel: {
    label: "Large parcel",
    description: "Large box or multiple items (about 8–20 kg)",
    representativeKg: 14,
  },
  oversized: {
    label: "Oversized / heavy",
    description: "Bulky or heavy shipments (20+ kg nominal — may be verified at pickup)",
    representativeKg: 28,
  },
};

const SIZE_TIER_IDS = Object.freeze(Object.keys(SIZE_TIER_CONFIG));

function isValidSizeTier(value) {
  return typeof value === "string" && SIZE_TIER_IDS.includes(value);
}

/** @returns {number} positive kg */
function getRepresentativeWeightKg(sizeTier) {
  if (!isValidSizeTier(sizeTier)) {
    const err = new Error(`Invalid size tier: ${sizeTier}`);
    err.statusCode = 400;
    throw err;
  }
  return SIZE_TIER_CONFIG[sizeTier].representativeKg;
}

function listSizeTiersForDocs() {
  return SIZE_TIER_IDS.map((id) => ({
    id,
    ...SIZE_TIER_CONFIG[id],
  }));
}

module.exports = {
  SIZE_TIER_CONFIG,
  SIZE_TIER_IDS,
  isValidSizeTier,
  getRepresentativeWeightKg,
  listSizeTiersForDocs,
};
