const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.getAllUser = async (req, res, next) => {
  try {
    const userList = await User.find();
    res.status(200).json(userList);
  } catch (error) {
    console.log(error);
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const user = await User.findOne({ email: email });
    if (user) {
      res.status(401).json({ message: "email already exists" });
    } else {
      bcrypt.hash(password, 12, async (err, hash) => {
        const newUser = new User({
          fullName: fullName,
          email: email,
          password: hash,
          role: role,
          status: "inactive",
        });
        const savedUser = await newUser.save();
        res.status(201).json({ message: "add user successful", savedUser });
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  // Thiếu 1 bước delete Token
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "delete user successful" });
  } catch (error) {
    console.log(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ message: "update user successful", updatedUser });
  } catch (error) {
    console.log(error);
  }
};

exports.getUserDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
};
