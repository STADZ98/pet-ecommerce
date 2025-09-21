const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shippingController");

// POST /api/shipping/track
router.post("/track", express.json(), shippingController.track);
// GET /api/shipping/lookup?tracking=...  (public) - returns order summary + provider events when available
router.get("/lookup", shippingController.lookupOrderByTracking);

module.exports = router;
