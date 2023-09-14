const router = require("express").Router();
const { makeGroup, getGroups } = require("../controllers/groupController");

router.post("/:id", makeGroup);
router.get("/:id", getGroups);

module.exports = router;
