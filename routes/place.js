const Place = require("../controller/placeController");
const express = require("express");

const router = express.Router();

// const { protect } = require('../middleware/authMiddleware');

router.get("/", Place.getAllPlaces);
router.get("/:placeId", Place.getMyPlaces);
router.post("/addPlace", Place.addPlace);
router.delete("/:placeId", Place.deletePlace);
router.get("/search/params", Place.searchPlaces);

module.exports = router;
