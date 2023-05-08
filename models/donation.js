const mongoose = require("mongoose");
const donationSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment: {
      type: String,
      enum: ["Credit Card", "Paypal", "Banking"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model("donation", donationSchema);

module.exports = Donation;
