const db = require("../models");
const { Op } = require("sequelize");

const riderInclude = {
  model: db.Rider,
  as: "rider",
  attributes: ["id", "full_name", "phone", "vehicle_type"],
  required: false,
};

/**
 * Normalize caller payload: either flat Sequelize options or `{ options: { ... } }`.
 */
const normalizeQuery = (extra) => {
  if (!extra || typeof extra !== "object") return {};
  return extra.options !== undefined ? { ...extra.options } : { ...extra };
};

class ShipmentDao {
  create(payload, transaction) {
    return db.Shipment.create(payload, { transaction });
  }

  findByTrackingCode(tracking_code) {
    return db.Shipment.findOne({
      where: { tracking_code },
      include: [riderInclude],
    });
  }

  findById(id) {
    return db.Shipment.findByPk(id, { include: [riderInclude] });
  }

  /**
   * Flexible read for a user's shipments. Pass any Sequelize `findAll` fields
   * (`where`, `order`, `limit`, `attributes`, `include`, `subQuery`, …).
   * `where` is merged with `{ user_id: userId }`.
   *
   * @param {number|string} userId
   * @param {object} [query] - Sequelize findAll options (or `{ options: {...} }`)
   * @param {boolean} [query.includeRider=true] - When true, prepends default rider include.
   *        Set `includeRider: false` for lean queries. Extra `include` entries are appended.
   */
  findShipmentsForUser(userId, query = {}) {
    const q = normalizeQuery(query);
    const {
      includeRider = true,
      include: extraIncludes = [],
      where: whereExtra = {},
      order,
      ...sequelizeRest
    } = q;

    const includes = [];
    if (includeRider) includes.push(riderInclude);
    const extra = Array.isArray(extraIncludes)
      ? extraIncludes
      : extraIncludes
        ? [extraIncludes]
        : [];
    includes.push(...extra);

    return db.Shipment.findAll({
      where: { user_id: userId, ...whereExtra },
      ...(includes.length ? { include: includes } : {}),
      order: order !== undefined ? order : [["created_at", "DESC"]],
      ...sequelizeRest,
    });
  }

  findByUserId(userId, extra = {}) {
    const src = normalizeQuery(extra);
    return this.findShipmentsForUser(userId, {
      ...src,
      includeRider: src.includeRider !== false,
    });
  }

  /**
   * `count` for a user's shipments; `where` merged with `{ user_id: userId }`.
   * Accepts flat options or `{ options: {...} }`.
   */
  countShipmentsForUser(userId, query = {}) {
    const q = normalizeQuery(query);
    const { where: whereExtra = {}, ...sequelizeRest } = q || {};
    return db.Shipment.count({
      where: { user_id: userId, ...whereExtra },
      ...sequelizeRest,
    });
  }

  /** @deprecated Prefer countShipmentsForUser */
  countUserShipment(userId, query) {
    return this.countShipmentsForUser(userId, query);
  }

  findShipmentStatusHistoryOne(where, order = [["created_at", "ASC"]]) {
    return db.ShipmentStatusHistory.findOne({
      where,
      order,
    });
  }

  /**
   * Escrows joined to shipments owned by `userId`. Pass `escrowWhere`, `shipmentWhere`,
   * and any other `findAll` options (e.g. `limit`, `order`, `attributes`).
   */
  findEscrowsForUserShipments(userId, options = {}) {
    const {
      escrowWhere = {},
      shipmentWhere = {},
      shipmentAttributes = ["id"],
      ...findAllRest
    } = options;
    return db.Escrow.findAll({
      where: { ...escrowWhere },
      include: [
        {
          model: db.Shipment,
          as: "shipment",
          where: { user_id: userId, ...shipmentWhere },
          attributes: shipmentAttributes,
        },
      ],
      ...findAllRest,
    });
  }

  /**
   * Sum escrow.amount for rows linked to this user's shipments (default: held escrow, non-draft).
   */
  async sumHeldEscrowAmountForUser(userId, shipmentWhere = {}) {
    const rows = await this.findEscrowsForUserShipments(userId, {
      escrowWhere: { status: "held" },
      shipmentWhere: { is_draft: false, ...shipmentWhere },
      shipmentAttributes: ["id"],
    });
    return rows.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  }

  findDeliveredShipmentsWithHeldEscrow(userId, limit = 3) {
    return this.findShipmentsForUser(userId, {
      where: { is_draft: false, status: "delivered" },
      includeRider: false,
      include: [
        {
          model: db.Escrow,
          as: "escrow",
          where: { status: "held" },
          required: true,
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
    });
  }

  findPendingShipmentsWithAssignedRider(userId, limit = 3) {
    return this.findShipmentsForUser(userId, {
      where: {
        is_draft: false,
        status: "pending",
        rider_id: { [Op.ne]: null },
      },
      includeRider: false,
      order: [["created_at", "DESC"]],
      limit,
    });
  }

  addStatusHistory(payload, transaction) {
    return db.ShipmentStatusHistory.create(payload, { transaction });
  }

  addTrackingEvent(payload, transaction) {
    return db.TrackingEvent.create(payload, { transaction });
  }

  createEscrow(payload, transaction) {
    return db.Escrow.create(payload, { transaction });
  }
}

module.exports = new ShipmentDao();
