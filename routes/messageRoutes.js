const {
  sendMsg,
  getMessages,
  deleteAllMsg,
} = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addMsg", sendMsg).post("/getMsgs", getMessages);
router.delete("/delete", deleteAllMsg);

module.exports = router;
