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
      });
      // console.log(`logged in as ${user.name}`);
    } else {
      res.status(400).json({ message: "Password doesn't matches!" });
    }
  } else {
    res.status(400).json({ message: "User not found!" });
  }
});

const generateToken = (id, res) => {
  const token = jwt.sign({ id }, process.env.JWT_SEC, {
    expiresIn: "30d",
  });
  res.cookie("jwt", token, { httpOnly: true, secure: true });
  return token;
};

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.params.id } }).select([
    "email",
    "name",
    "img",
    "_id",
    "isAvtarSet",
    "token",
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

  console.log(result.secure_url);

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      isAvtarSet: true,
      img: {
        public_id: result.public_id,
        utl: result.secure_url,
      },
    },
    {
      new: true,
    }
  );

  if (updatedUser) {
    res.status(200).json(updatedUser);
  } else
    res.status(500).json({ message: "Server wasn't able to set your avtar!" });
});

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  setAvatar,
};
