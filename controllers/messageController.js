const asyncHandler = require("express-async-handler");
const Message = require("../models/messageSchema");
const Group = require("..//models/groupSchema");

const sendMsg = asyncHandler(async (req, res) => {
  const { message, senderId, recieverId } = req.body;

  const isGrp = await Group.findById({ _id: recieverId });

  if (isGrp) {
    const newMsg = {
      message: {
        text: message.text,
        time_stamp: message.time_stamp,
        date_stamp: message.date_stamp, 
      },
      users: isGrp.members,
      senderId: senderId,
    };
    const updatedGrp = await Group.findByIdAndUpdate(
      { _id: recieverId },
      { $push: { messages: newMsg } },
      { new: true }
    );
    if (updatedGrp) {
      res.status(200).json({
        message: updatedGrp.messages.slice(-1)[0].message,
        isSenderMe: true,
        senderId,
      });
    } else {
      res.status(400).json({ msg: "Failed to send msg" });
    }
  } else {
    const newMsg = await Message.create({
      message: {
        text: message.text,
        time_stamp: message.time_stamp,
        date_stamp: message.date_stamp, 
      },
      users: [senderId, recieverId],
      senderId: senderId,
    });
    if (newMsg) {
      res
        .status(200)
        .json({ message: newMsg.message, isSenderMe: true, senderId });
    } else res.status(400).json({ msg: "Failed to send msg" });
  }
});

const getMessages = asyncHandler(async (req, res) => {
  const { from, to } = req.body;
  let msgs;
  const isGrp = await Group.findById({ _id: to });
  if (isGrp) {
    msgs = isGrp.messages;
  } else {
    msgs = await Message.find({
      users: {
        $all: [from, to],
      },
    }).sort({ createdAt: 1 });
  }
  if (msgs) {
    const allMsg = msgs.map((msg) => {
      return {
        message: msg.message,
        isSenderMe: msg.senderId.toString() === from,
        senderId: msg.senderId,
      };
    });

    res.status(200).json(allMsg);
  } else res.status(400).json({ msg: "Failed to retieve all the msgs" });
});

const deleteAllMsg = asyncHandler(async (req, res) => {
  const msgsDeleted = await Message.deleteMany({});
  const allGrps = await Group.find({});

  allGrps.forEach(async (element) => {
    await Group.findByIdAndUpdate(
      { _id: element._id },
      {
        $set: { messages: [] },
      }
    );
  });
});
module.exports = {
  sendMsg,
  getMessages,
  deleteAllMsg,
};
