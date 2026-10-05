const express = require("express");
const { protectAdmin } = require("../middleware/auth");
const { upload } = require("../config/multerCloudinary");
const { uploadMedia, getMedia, updateMedia, deleteMedia } = require("../controllers/mediaController");

const router = express.Router();

router.use(protectAdmin);

router.post("/upload", upload.single("file"), uploadMedia);
router.get("/", getMedia);
router.patch("/:id", updateMedia);
router.delete("/:id", deleteMedia);

module.exports = router;
