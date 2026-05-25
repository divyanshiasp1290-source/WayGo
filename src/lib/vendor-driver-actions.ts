// Wrapper module for TanStack Start server actions.
// This file must stay client-safe; server implementation lives under src/server/.
export {
  createVendorDriver,
  updateVendorDriver,
  setVendorDriverStatus,
  deleteVendorDriver,
  verifyDriverDocument,
} from "./_server/vendor-driver-actions";






