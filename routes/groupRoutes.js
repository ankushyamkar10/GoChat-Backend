const router = require("express").Router();
const {
  makeGroup,
  getGroups,
  leaveGroup,
  getGroup,
  addUserToGroup,
} = require("../controllers/groupController");

router.post("/:id", makeGroup);
router.get("/all/:id", getGroups);
router
  .get("/:groupId", getGroup)
  .post("/leaveGroup/:groupId", leaveGroup)
  .post("/:groupId/add", addUserToGroup);

module.exports = router;
