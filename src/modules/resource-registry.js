// Money-moving resources (wallets, wallet-transactions, escrow, payments),
// riders, shipments, and disputes are deliberately NOT registered here — they
// have no ownership/role checks or business-rule enforcement in the generic
// CRUD layer below, which would let any authenticated user mutate arbitrary
// balances, release escrow, self-approve a rider's verification status,
// rewrite any shipment's status, or resolve their own dispute. They're served
// instead through the dedicated, guarded `/api/wallet`, `/api/riders`,
// `/api/shipments`, `/api/disputes`, and `/api/admin` routes.
module.exports = [
  {
    path: "shipment-status-history",
    model: "ShipmentStatusHistory",
    label: "shipment status history",
  },
  { path: "tracking-events", model: "TrackingEvent", label: "tracking event" },
  {
    path: "interstate-drivers",
    model: "InterstateDriver",
    label: "interstate driver",
  },
];
