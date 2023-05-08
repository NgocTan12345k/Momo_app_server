const express = require("express");

const router = express.Router();

const donationController = require("../controllers/donation");

// GET
router.get("/", donationController.getAllDonation);
router.get("/:id", donationController.getDonationDetail);
router.get("/history/:user_id", donationController.getHitoryDonation);

// POST
router.post("/add", donationController.addDonation);

// UPDATE
router.put("/update/:id", donationController.updateDonation);

// DELETE
router.delete("/delete/:id", donationController.deleteDonation);

module.exports = router;
