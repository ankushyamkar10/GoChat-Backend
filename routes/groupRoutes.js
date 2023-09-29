const router = require("express").Router();
const {
  makeGroup,
  getGroups,
  leaveGroup,
} = require("../controllers/groupController");

router.post("/:id", makeGroup);
router.get("/:id", getGroups);
router.post("/leaveGroup/:groupId", leaveGroup);

module.exports = router;
