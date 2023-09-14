const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getAllUsers,
  setAvatar,
} = require("../../controllers/userController");

router
  .post("/register", registerUser)
  .post("/login", loginUser)
  .get("/all/:id", getAllUsers);
router.patch("/:id", setAvatar);

module.exports = router;
