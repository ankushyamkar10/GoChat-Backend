const asyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const cloudinary = require("../config/cloudinary");

const registerUser = asyncHandler(async (req, res) => {
  const { name, password, email } = req.body;

  if (!name || !password || !email) {
    res.status(400).json({ message: "Please fill all the details" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "User Already exists!" });
  }

  //hashing of password
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (newUser) {
    const token = generateToken(newUser._id, res);
    // console.log(token)
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAvtarSet: newUser.isAvtarSet,
      img: newUser.img,
      token,
      contacts: newUser.contacts,
      recievedRequests: newUser.recievedRequests,
      sentRequests: newUser.sentRequests,
    });
  } else {
    res.status(400).json({ message: "Invalid user data!" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(400).json({ message: "Please fill all the details!" });
  }
  const user = await User.findOne({ name });

  if (user) {
    if (await bcryptjs.compare(password, user.password)) {
      const token = generateToken(user._id, res);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAvtarSet: user.isAvtarSet,
        img: user.img,
        token,
        contacts: user.contacts,
        recievedRequests: user.recievedRequests,
        sentRequests: user.sentRequests,
      });
      // console.log(`logged in as ${user.name}`);
    } else {
      res.status(400).json({ message: "Password doesn't matches!" });
    }
  } else {
    res.status(400).json({ message: "User not found!" });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.params.id } }).select([
    "email",
    "name",
    "img",
    "_id",
    "isAvtarSet",
  ]);

  if (users) res.status(200).json(users);
  else {
    res.status(400).json({ message: "Users not found!" });
  }
});

const setAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: "gochat-users",
  });

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      isAvtarSet: true,
      img: {
        public_id: result.public_id,
        image_url: result.secure_url,
      },
    },
    {
      new: true,
    }
  );

  if (updatedUser) {
    const token = generateToken(updatedUser._id, res);
    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAvtarSet: updatedUser.isAvtarSet,
      img: updatedUser.img,
      token,
      contacts: updatedUser.contacts,
      recievedRequests: updatedUser.recievedRequests,
      sentRequests: updatedUser.sentRequests,
    });
  } else
    res.status(500).json({ message: "Server wasn't able to set your avtar!" });
});

const sendChatRequest = asyncHandler(async (req, res) => {
  const { data } = req.body;
  // const { recieverId, senderId } = data;

  const updatedUser = await User.findByIdAndUpdate(
    data.senderId,
    {
      $push: { sentRequests: data.recieverId },
    },
    { new: true }
  );

  if (updatedUser) {
    const token = generateToken(updatedUser._id, res);

    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAvtarSet: updatedUser.isAvtarSet,
      img: updatedUser.img,
      token,
      contacts: updatedUser.contacts,
      recievedRequests: updatedUser.recievedRequests,
      sentRequests: updatedUser.sentRequests,
    });
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const recieveChatRequest = asyncHandler(async (req, res) => {
  const { data } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    data.recieverId,
    {
      $push: { recievedRequests: data.senderId },
    },
    { new: true }
  );

  if (updatedUser) {
    const token = generateToken(updatedUser._id, res);
    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAvtarSet: updatedUser.isAvtarSet,
      img: updatedUser.img,
      token,
      contacts: updatedUser.contacts,
      recievedRequests: updatedUser.recievedRequests,
      sentRequests: updatedUser.sentRequests,
    });
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const cancelChatRequest = asyncHandler(async (req, res) => {
  const { data } = req.body;

  let updatedUser = null;
  if (data.action === "reciever") {
    updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { recievedRequests: { $in: [data.senderId] } },
      },
      { new: true }
    );
  } else if (data.action === "sender") {
    updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { sentRequests: { $in: [data.recieverId] } },
      },
      { new: true }
    );
  } else {
    res.status(403).json({ message: "Choose valid action!" });
  }

  if (updatedUser) {
    const token = generateToken(updatedUser._id, res);
    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAvtarSet: updatedUser.isAvtarSet,
      img: updatedUser.img,
      token,
      contacts: updatedUser.contacts,
      recievedRequests: updatedUser.recievedRequests,
      sentRequests: updatedUser.sentRequests,
    });
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const updateRequestAndContacts = asyncHandler(async (req, res) => {
  const { actionId, action } = req.body;
  let updatedUser = null;

  if (action === "accepted") {
    updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { contacts: actionId },
        $pull: {
          sentRequests: { $in: [actionId] },
          recievedRequests: { $in: [actionId] },
        },
      },
      { new: true }
    );
  } else if (action === "rejected") {
    updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          sentRequests: { $in: [actionId] },
          recievedRequests: { $in: [actionId] },
        },
      },
      { new: true }
    );
  } else {
    res.status(403).json({ message: "Please choose a valid action!" });
  }

  if (updatedUser) {
    const token = generateToken(updatedUser._id, res);
    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAvtarSet: updatedUser.isAvtarSet,
      img: updatedUser.img,
      token,
      contacts: updatedUser.contacts,
      sentRequests: updatedUser.sentRequests,
      recievedRequests: updatedUser.recievedRequests,
    });
    return;
  }

  res.status(500).json({ message: "Something went wrong" });
});

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.cookie("jwt", token, { httpOnly: true, secure: true });
  return token;
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  setAvatar,
  updateRequestAndContacts,
  sendChatRequest,
  recieveChatRequest,
  cancelChatRequest,
};
