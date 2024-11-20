const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, "Please enter your first name"],
  },
  lname: {
    type: String,
    required: [true, "Please enter your last name"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  isActive: {
    type: Boolean,
  },
  resetPasswordToken: {
    type: String, // Token to reset password
  },
  resetPasswordExpires: {
    type: Date, // Expiration time for the token
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  items: [
    {
      name: {
        type: String,
        required: [true, "Please enter the item name"],
      },
      description: {
        type: String,
        required: [true, "Please enter the item description"],
      },
      price: {
        type: Number,
        required: [true, "Please enter the item price"],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    console.log("User found:", user.email);
    console.log("Entered password:", password);
    console.log("Stored hashed password:", user.password);

    const auth = await bcrypt.compare(password, user.password);

    if (auth) {
      console.log("Password matched");
      return user;
    } else {
      console.log("Password did not match");
    }
  } else {
    console.log("User not found");
  }

  throw Error("incorrect email or password");
};

const User = mongoose.model("User", userSchema);

module.exports = User;
