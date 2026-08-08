const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getStats, getRecent, getActivity } = require("../controllers/dashboardController");
 
const router = express.Router();
 
router.use(protect);
 
router.get("/stats", getStats);
router.get("/recent", getRecent);
router.get("/activity", getActivity);
 
module.exports = router;