const riderDao = require("../dao/riderDao");
const shipmentService = require("./shipmentService");

const notFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
};

const conflict = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  throw error;
};

const forbidden = (message) => {
  const error = new Error(message);
  error.statusCode = 403;
  throw error;
};

class RiderService {
  toUiRider(rider) {
    const plain = rider.get ? rider.get({ plain: true }) : rider;
    return {
      id: plain.id,
      fullName: plain.full_name,
      phone: plain.phone,
      vehicleType: plain.vehicle_type,
      availabilityStatus: plain.availability_status,
      verificationStatus: plain.verification_status,
      createdAt: plain.created_at,
    };
  }

  async apply(userId, body) {
    const existing = await riderDao.findByUserId(userId);
    if (existing) conflict("You already have a rider profile");

    const rider = await riderDao.create({
      user_id: userId,
      full_name: body.full_name,
      phone: body.phone,
      vehicle_type: body.vehicle_type,
    });
    return this.toUiRider(rider);
  }

  async getMyProfile(userId) {
    const rider = await riderDao.findByUserId(userId);
    return rider ? this.toUiRider(rider) : null;
  }

  /** Loads the caller's rider row and throws a clear error if they can't act as a rider yet. */
  async _requireApprovedRider(userId) {
    const rider = await riderDao.findByUserId(userId);
    if (!rider) notFound("Apply to become a rider first");
    if (rider.verification_status !== "approved") {
      forbidden("Your rider application is still pending verification");
    }
    return rider;
  }

  async updateAvailability(userId, status) {
    const rider = await this._requireApprovedRider(userId);
    rider.availability_status = status;
    await rider.save();
    return this.toUiRider(rider);
  }

  async listAvailableJobs(userId) {
    await this._requireApprovedRider(userId);
    return shipmentService.listAvailableJobs();
  }

  async listMyJobs(userId, { active } = {}) {
    const rider = await this._requireApprovedRider(userId);
    const statusIn = active ? ["pending", "in_transit"] : undefined;
    return shipmentService.listJobsForRider(rider.id, statusIn);
  }

  async acceptJob(userId, trackingCode) {
    const rider = await this._requireApprovedRider(userId);
    const shipment = await shipmentService.acceptJob(rider.id, trackingCode);
    if (!shipment) notFound("Shipment not found");
    return shipment;
  }

  async updateJobStatus(userId, trackingCode, payload) {
    const rider = await this._requireApprovedRider(userId);
    const shipment = await shipmentService.updateStatusAsRider(rider.id, trackingCode, payload);
    if (!shipment) notFound("Shipment not found");
    return shipment;
  }

  /** Completed-delivery payout total + count, derived from this rider's wallet payouts. */
  async getEarnings(userId) {
    const rider = await riderDao.findByUserId(userId);
    if (!rider) notFound("Apply to become a rider first");

    const completed = await shipmentService.listJobsForRider(rider.id, ["delivered"]);
    const totalEarned = completed.reduce((acc, s) => acc + Number(s.pricing.serviceFee || 0), 0);

    return {
      totalEarned: Math.round(totalEarned * 100) / 100,
      completedDeliveries: completed.length,
      recentDeliveries: completed.slice(0, 10),
    };
  }

  // -- admin --

  async verify(riderId, status) {
    const rider = await riderDao.findById(riderId);
    if (!rider) notFound("Rider not found");
    rider.verification_status = status;
    await rider.save();
    return this.toUiRider(rider);
  }
}

module.exports = new RiderService();
