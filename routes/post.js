const express = require("express");
const router = express.Router();
const postController = require("../controllers/post");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + "_" + file.originalname);
  },
});

const filFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: filFilter });

// POST
// router.post("/add", upload.single("photo"), postController.addPost);
router.post("/add", upload.array("photos", 10), postController.addPost);

// GET
router.get("/", postController.getAllPost);
router.get("/:id", postController.getPostDetail);

// UPDATE
// router.put("/update/:id", upload.single("photo"), postController.updatePost);
router.put(
  "/update/:id",
  upload.array("photos", 10),
  postController.updatePost
);

// DELETE
router.delete("/delete/:id", postController.deletePost);

module.exports = router;
