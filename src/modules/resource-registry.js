// Money-moving resources (wallets, wallet-transactions, escrow, payments) are
// deliberately NOT registered here — they have no ownership/role checks or
// business-rule enforcement in the generic CRUD layer below, which would let
// any authenticated user mutate arbitrary balances or release escrow. They're
// served instead through the dedicated, guarded `/api/wallet` routes.
module.exports = [
  { path: "shipments", model: "Shipment", label: "shipment" },
  {
    path: "shipment-status-history",
    model: "ShipmentStatusHistory",
    label: "shipment status history",
  },
  { path: "tracking-events", model: "TrackingEvent", label: "tracking event" },
  { path: "riders", model: "Rider", label: "rider" },
  {
    path: "interstate-drivers",
    model: "InterstateDriver",
    label: "interstate driver",
  },
  { path: "deliveries", model: "Delivery", label: "delivery" },
  { path: "delivery-packages", model: "DeliveryPackage", label: "delivery package" },
  { path: "delivery-tracking", model: "DeliveryTracking", label: "delivery tracking" },
  { path: "handoff-details", model: "HandoffDetail", label: "handoff detail" },
  { path: "call-logs", model: "CallLog", label: "call log" },
  { path: "ratings", model: "Rating", label: "rating" },
  { path: "disputes", model: "Dispute", label: "dispute" },
];
