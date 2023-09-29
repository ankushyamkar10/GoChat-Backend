const asyncHandler = require("express-async-handler");
const Groups = require("../models/groupSchema");

const makeGroup = asyncHandler(async (req, res) => {
  const admin = req.params.id;
  const { name, desc, members } = req.body.group;

  //member includes the sender
  if (!admin || !name || !Array.isArray(members) || members.length <= 0) {
    res.status(400);
    throw new Error("Select atleat 1 participant");
  }
  members.push(admin);
  const details = {
    name,
    admin,
    members,
  };

  if (desc && desc.length > 0) details["desc"] = desc;

  const newGroup = await Groups.create(details);
  if (newGroup) {
    const result = {
      name: newGroup.name,
      admin: newGroup.admin,
      members: newGroup.members,
      isAvtarSet: newGroup.isAvtarSet,
      img: newGroup.img,
      messages: newGroup.messages,
      createdAt: newGroup.createdAt,
    };
    if (newGroup.desc?.length > 0) result.desc = newGroup.desc;

    res.status(200).json(result);
  } else {
    res.status(400);
    throw new Error("Something went wrong.");
  }
});

const getGroups = asyncHandler(async (req, res) => {
  const user = req.params.id;
  const allGroups = await Groups.find({ members: { $in: [user] } });
  if (allGroups) {
    const results = [];
    allGroups.forEach((element) => {
      delete element.updatedAt;
      delete element.__v;
      results.push(element);
    });

    res.status(200).send(results);
  } else res.status(400).json({ msg: "Groups not found" });
});

const leaveGroup = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { groupId } = req.params;


  const foundGroup = await Groups.findById(groupId);
  if (foundGroup) {
    const isUSerAdmin = foundGroup.admin.includes(userId);

    if (isUSerAdmin) {
      if (foundGroup.admin.length <= 1) {
        console.log("You are the only admin!");
        res.status(403).json({ message: "You are the only admin!" });
        return;
      } else {
        foundGroup.admin = foundGroup.admin.filter((user) => user !== userId);
      }
    }
    foundGroup.members = foundGroup.members.filter(
      (member) => member !== userId
    );
    await foundGroup.save();
    res.status(200);
  } else {
    res.status(500).json({ message: "Groups not found" });
  }
});

module.exports = {
  makeGroup,
  getGroups,
  leaveGroup,
};
