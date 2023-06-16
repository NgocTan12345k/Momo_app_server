const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const senGridTransport = require("nodemailer-sendgrid-transport");

dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" });
};
const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "365d",
  });
};

exports.register = async (req, res, next) => {
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

        // send email to user for authentication
        const transporter = nodemailer.createTransport(
          senGridTransport({
            auth: {
              api_key: process.env.API_KEY_SENGRID,
            },
          })
        );
        // async email
        try {
          const emailToken = jwt.sign(
            { email: email },
            process.env.EMAIL_SECRET,
            {
              expiresIn: "7d",
            }
          );
          const url = `http://localhost:3000/confirmEmail/${emailToken}`;
          await transporter.sendMail({
            from: "tanbn@funix.edu.vn",
            to: email,
            subject: "Confirm Email",
            html: `<p>Please click this email to confirm your email: <a href="${url}">${url}</a></p>`,
          });
        } catch (error) {
          console.log(error);
        }

        res.status(201).json({ message: "register successful", savedUser });
      });
    }
  } catch (error) {
    // res.status(401).json(error);
    console.log(error);
  }
};

exports.confirmedEmail = async (req, res, next) => {
  try {
    const token = req.params.token;
    const decodedEmail = jwt.verify(token, process.env.EMAIL_SECRET);
    await User.findOneAndUpdate(
      { email: decodedEmail.email },
      {
        $set: {
          confirmedEmail: true,
          status: "active",
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "confirm email successful!" });
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (user) {
    if (!user.confirmedEmail) {
      res.status(401).json({ message: "Please confirm your email to login!" });
    } else {
      const temp = {
        userID: user._id,
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        role: user.role,
        status: user.status,
      };
      let hashPassword = temp.password;
      bcrypt.compare(password, hashPassword, async function (err, result) {
        if (result === true) {
          const { password, ...others } = temp;
          const accessToken = generateAccessToken(others);
          const refreshToken = generateRefreshToken(others);
          await User.findOneAndUpdate(
            { email: temp.email },
            { refresh_token: refreshToken }
          );
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/",
            secure: false,
            sameSite: "strict",
          });
          res.status(200).json({
            message: "login successful",
            user: others,
            accessToken: accessToken,
          });
        } else {
          res.status(401).json({ message: "wrong password" });
        }
      });
    }
  } else {
    res.status(401).json({ message: "wrong email" });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log("email-->", email);
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(401).json({ message: "wrong email" });
    } else {
      const newPassword = Math.random().toString(36).substring(2, 12);
      console.log(newPassword);
      // SEND MAIL
      const transporter = nodemailer.createTransport(
        senGridTransport({
          auth: {
            api_key: process.env.API_KEY_SENGRID,
          },
        })
      );

      await transporter.sendMail({
        from: "tanbn@funix.edu.vn",
        to: email,
        subject: "Reset password successful!",
        html:
          "<h1>Hello " +
          user.fullName +
          "</h1>" +
          "</br>" +
          "<p>This is your new password: <strong>" +
          newPassword +
          "</strong></p>" +
          "</br>" +
          "<p>Thank you!</p>",
      });
      bcrypt.hash(newPassword, 12, async (err, hash) => {
        const newUser = await User.findOneAndUpdate(
          { email: email },
          {
            password: hash,
          },
          {
            new: true,
          }
        );
        console.log("newuser-->", newUser);
        await newUser.save();
        res.status(200).json({ message: "reset password successful" });
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { userID, password, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(userID);
    let hashPassword = user.password;
    bcrypt.compare(password, hashPassword, async function (err, result) {
      if (result === true) {
        if (newPassword === confirmNewPassword) {
          bcrypt.hash(newPassword, 12, async (err, hash) => {
            await User.findByIdAndUpdate(
              userID,
              {
                password: hash,
              },
              {
                new: true,
              }
            );
            res.status(200).json({ message: "change password successful" });
          });
        } else {
          res.status(401).json({
            message: "Confirm New Password does not match New Password",
          });
        }
      } else {
        res.status(401).json({ message: "wrong password" });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.requestRefreshToken = async (req, res, next) => {
  // Take refresh Token from User
  // console.log("req-->", req);
  const refreshToken = req.cookies.refreshToken;
  // console.log("refreshToken-->", refreshToken);
  if (!refreshToken) {
    return res.status(401).json({ message: "You are not authenticated" });
  } else {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      // console.log("user-->", user);
      if (err) {
        console.log(err);
      }
      // Create new accessToken, refreshToken
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        secure: false,
        sameSite: "strict",
      });
      res.status(200).json({ accessToken: newAccessToken });
    });
  }
};

// Log out
exports.logout = async (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "logged out successfully" });
};
