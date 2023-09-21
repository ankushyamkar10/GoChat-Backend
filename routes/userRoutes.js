const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getAllUsers,
  setAvatar,
  addUser,
} = require("../controllers/userController");

router
  .post("/register", registerUser)
  .post("/login", loginUser)
  .get("/all/:id", getAllUsers);
router.patch("/:id", setAvatar).patch("/", protect, addUser);

module.exports = router;
