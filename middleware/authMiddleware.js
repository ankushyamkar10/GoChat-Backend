const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // token = req.headers.authorization.substring(7);

      //Get token
      token = req.headers.authorization.split(" ")[1];

      //Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //decode = (is the result we get from the token verification) { id: '63ef79d04000e9159baab469', iat: 1676640577, exp: 1679232577 }

      //Get Token from user
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authorized");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
