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
  cancelChatRequest,
} = require("../controllers/userController");

router
  .post("/register", registerUser)
  .post("/login", loginUser)
  .get("/all/:id", getAllUsers);
router.patch("/:id", setAvatar);
router
  .post("/sendChatRequest", protect, sendChatRequest)
  .post("/recieveChatRequest", protect, recieveChatRequest)
  .post("/requestAction", protect, updateRequestAndContacts)
  .post("/cancelChatRequest", protect, cancelChatRequest);

module.exports = router;
