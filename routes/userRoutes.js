const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getAllUsers,
  setAvatar,
  updateRequestAndContacts,
  sendChatRequest,
  recieveChatRequest,
} = require("../controllers/userController");

router
  .post("/register", registerUser)
  .post("/login", loginUser)
  .get("/all/:id", getAllUsers);
router.patch("/:id", setAvatar);

router
  .post("/sendChatRequest", protect, sendChatRequest)
  .post("/recieveChatRequest", protect, recieveChatRequest)
  .post("/requestAction", protect, updateRequestAndContacts);

module.exports = router;
