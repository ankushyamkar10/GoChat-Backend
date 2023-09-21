const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAvtarSet: {
      type: Boolean,
      default: false,
    },
    img: {
      public_id: {
        type: String,
      },
      image_url: {
        type: String,
        required: true,
        default:
          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      },
    },
    contacts: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
