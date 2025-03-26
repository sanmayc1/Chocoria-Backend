import mongoose from "mongoose";

const referralOfferSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  offer:
    {
      type: String,
      default:"defaultReferral",
    },
});

const ReferralOffer = mongoose.model("ReferralOffer", referralOfferSchema);

export default ReferralOffer;
