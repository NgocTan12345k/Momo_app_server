const Donation = require("../models/donation");
const nodemailer = require("nodemailer");
const senGridTransport = require("nodemailer-sendgrid-transport");
const User = require("../models/user");

exports.addDonation = async (req, res, next) => {
  const { post_id, user_id, amount, payment, email } = req.body;
  try {
    const user = await User.findById(user_id);
    const newDonation = new Donation({
      post_id: post_id,
      user_id: user_id,
      amount: amount,
      payment: payment,
    });

    const savedDonation = await newDonation.save();
    // SEND MAIL AFTER USER DONATION SUCCESS
    const transporter = nodemailer.createTransport(
      senGridTransport({
        auth: {
          api_key: process.env.API_KEY_SENGRID,
        },
      })
    );

    const htmlResult =
      "<h1>Chào bạn " +
      user.fullName +
      "!" +
      "</h1>" +
      "<br/>" +
      "<h3> Cảm ơn bạn đã quyên góp tới quỹ từ thiện với số tiền là: <strong>" +
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        currencyDisplay: "code",
      }).format(amount) +
      "</strong></h3>" +
      "<p>Mong bạn sẽ tiếp tục đồng hành cũng chương trình trong thời gian tới! </p>";

    await transporter.sendMail({
      from: "tanbn@funix.edu.vn",
      to: email,
      subject: "Bạn đã quyên góp thành công!",
      html: htmlResult,
    });
    res.status(200).json({ message: "add donation successful", savedDonation });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllDonation = async (req, res, next) => {
  try {
    const DonationList = await Donation.find().populate([
      { path: "user_id" },
      { path: "post_id" },
    ]);
    res.status(200).json(DonationList);
  } catch (error) {
    console.log(error);
  }
};

exports.updateDonation = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "update donation successful", updatedDonation });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteDonation = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Donation.findByIdAndDelete(id);
    res.status(200).json({ message: "delete donation successful" });
  } catch (error) {
    console.log(error);
  }
};

exports.getDonationDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const donation = await Donation.findById(id);
    res.status(200).json(donation);
  } catch (error) {
    console.log(error);
  }
};

exports.getHitoryDonation = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const historyDonation = await Donation.find({
      user_id: user_id,
    }).populate([{ path: "user_id" }, { path: "post_id" }]);
    res.status(200).json(historyDonation);
  } catch (error) {
    console.log(error);
  }
};
