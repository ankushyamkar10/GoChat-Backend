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
    "token",
    "contacts",
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
    });
  } else
    res.status(500).json({ message: "Server wasn't able to set your avtar!" });
});

const addUser = asyncHandler(async (req, res) => {
  const { user_id, addUser } = req.body;

  if (await User.findById(user_id)) {
    let updatedUser;
    for (let user in addUser) {
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          $push: { contacts: addUser[user] },
        },
        { new: true }
      );
    }

    if (updatedUser) {
      const token = generateToken(updatedUser._id, res);
      console.log(updatedUser.contacts);
      res.status(201).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAvtarSet: updatedUser.isAvtarSet,
        img: updatedUser.img,
        token,
        contacts: updatedUser.contacts,
      });
      return;
    }
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
  addUser,
};
