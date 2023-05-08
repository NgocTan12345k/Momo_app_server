const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");
const middlewareController = require("../controllers/middleware");

// GET
router.get(
  "/",
  // middlewareController.verifyToken,
  userController.getAllUser
);
router.get("/:id", userController.getUserDetail);

// POST
router.post("/add", userController.addUser);

// Update
router.put("/update/:id", userController.updateUser);

// DELETE
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;
