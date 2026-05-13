const { Op } = require("sequelize");
const db = require("../models");
const shipmentService = require("./shipmentService");
const shipmentDao = require("../dao/shipmentDao");

class DashboardService {
  notDraftWhere() {
    return { is_draft: false };
  }

  async getActiveDeliveries(userId) {
    return shipmentDao.countShipmentsForUser(userId, {
      where: {
        ...this.notDraftWhere(),
        status: "in_transit",
      },
    });
  }

  async getCompletedTrips(userId) {
    return this.getCompletedShipments(userId);
  }

  async getPendingShipments(userId) {
    return shipmentDao.countShipmentsForUser(userId, {
      where: {
        ...this.notDraftWhere(),
        status: "pending",
      },
    });
  }

  async getCompletedShipments(userId) {
    return shipmentDao.countShipmentsForUser(userId, {
      where: { status: "delivered", ...this.notDraftWhere() },
    });
  }

  async getOngoingShipments(userId) {
    return shipmentService.getOngoingShipments(userId);
  }

  async getTotalShipments(userId) {
    return shipmentDao.countShipmentsForUser(userId, {
      where: { ...this.notDraftWhere() },
    });
  }

  async getMonthlyShipmentMetrics(userId) {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthCount = await shipmentDao.countShipmentsForUser(userId, {
      where: {
        created_at: { [Op.gte]: startThisMonth },
        ...this.notDraftWhere(),
      },
    });
    const lastMonthCount = await shipmentDao.countShipmentsForUser(userId, {
      where: {
        created_at: { [Op.gte]: startLastMonth, [Op.lt]: startThisMonth },
        ...this.notDraftWhere(),
      },
    });
    let monthlyMomChangePct = null;
    if (lastMonthCount > 0) {
      monthlyMomChangePct =
        Math.round(
          ((thisMonthCount - lastMonthCount) / lastMonthCount) * 1000,
        ) / 10;
    }
    return { thisMonthCount, lastMonthCount, monthlyMomChangePct };
  }

  async getSuccessRatePct(userId) {
    const total = await this.getTotalShipments(userId);
    if (!total) return 0;
    const delivered = await this.getCompletedShipments(userId);
    return Math.round((delivered / total) * 1000) / 10;
  }

  async getAvgDeliveryHours(userId) {
    const shipments = await shipmentDao.findShipmentsForUser(userId, {
      where: {
        ...this.notDraftWhere(),
        status: "delivered",
      },
      includeRider: false,
      attributes: ["id", "created_at"],
    });
    if (!shipments.length) return null;
    const hours = [];
    for (const s of shipments) {
      const plain = s.get ? s.get({ plain: true }) : s;
      const hist = await shipmentDao.findShipmentStatusHistoryOne(
        { shipment_id: plain.id, status: "delivered" },
        [["created_at", "ASC"]],
      );
      if (hist && plain.created_at) {
        const deltaMs =
          new Date(hist.created_at).getTime() -
          new Date(plain.created_at).getTime();
        if (deltaMs >= 0) hours.push(deltaMs / (1000 * 60 * 60));
      }
    }
    if (!hours.length) return null;
    const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
    return Math.round(avg * 10) / 10;
  }

  async getEscrowWalletSummary(userId) {
    const wallet = await db.Wallet.findOne({ where: { user_id: userId } });
    const availableBalance = Number(wallet?.balance || 0);
    const lockedFunds = await shipmentDao.sumHeldEscrowAmountForUser(
      userId,
      {},
    );
    const headlineTotal =
      Math.round((lockedFunds + availableBalance) * 100) / 100;
    return {
      headlineTotal,
      lockedFunds: Math.round(lockedFunds * 100) / 100,
      availableBalance: Math.round(availableBalance * 100) / 100,
    };
  }

  async getActionCenterItems(userId) {
    const items = [];

    const releaseRows =
      await shipmentDao.findDeliveredShipmentsWithHeldEscrow(userId, 3);
    for (const row of releaseRows) {
      const plain = row.get({ plain: true });
      items.push({
        id: `release-${plain.id}`,
        type: "release_payment",
        title: "Release payment",
        description: `${plain.tracking_code} was delivered — confirm to release escrow.`,
        trackingId: plain.tracking_code,
        primaryLabel: "Confirm & release",
        secondaryLabel: "Dispute",
      });
    }

    const pickupRows =
      await shipmentDao.findPendingShipmentsWithAssignedRider(userId, 3);
    for (const row of pickupRows) {
      const plain = row.get({ plain: true });
      items.push({
        id: `pickup-${plain.id}`,
        type: "confirm_pickup",
        title: "Confirm pickup",
        description: `A rider is assigned for ${plain.tracking_code}. Hand over when ready.`,
        trackingId: plain.tracking_code,
        primaryLabel: "Handover package",
        secondaryLabel: "Call rider",
      });
    }

    return items;
  }

  async getDashboardUiData(userId) {
    const [
      recentShipments,
      activeDeliveries,
      completedTrips,
      pendingShipments,
      completedShipments,
      ongoingShipments,
      totalShipments,
      orderCtx,
      monthlyMetrics,
      successRatePct,
      avgDeliveryHours,
      escrowWallet,
      actionItems,
    ] = await Promise.all([
      shipmentService.getRecentShipments(userId),
      this.getActiveDeliveries(userId),
      this.getCompletedTrips(userId),
      this.getPendingShipments(userId),
      this.getCompletedShipments(userId),
      this.getOngoingShipments(userId),
      this.getTotalShipments(userId),
      shipmentService.getCurrentOrderContext(userId),
      this.getMonthlyShipmentMetrics(userId),
      this.getSuccessRatePct(userId),
      this.getAvgDeliveryHours(userId),
      this.getEscrowWalletSummary(userId),
      this.getActionCenterItems(userId),
    ]);

    const summary = {
      monthlyShipments: monthlyMetrics.thisMonthCount,
      monthlyMomChangePct: monthlyMetrics.monthlyMomChangePct,
      successRatePct,
      avgDeliveryHours,
      avgDeliveryMomChangeMinutes: null,
    };

    const actionCenter = {
      urgentActionsCount: actionItems.length,
      items: actionItems,
      escrowWallet,
    };

    return {
      recentShipments,
      activeDeliveries,
      completedTrips,
      pendingShipments,
      completedShipments,
      ongoingShipments,
      totalShipments,
      currentOrderTimeline: orderCtx.timeline,
      currentOrderTrackingId: orderCtx.trackingId,
      currentOrderStatus: orderCtx.statusUi,
      summary,
      actionCenter,
    };
  }
}

module.exports = new DashboardService();
