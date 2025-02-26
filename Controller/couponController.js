import Coupon from "../Model/couponModel.js";
import UsedCoupon from "../Model/usedCoupon.js";

const addCoupon = async (req, res) => {
  try {
    const {
      couponTitle: title,
      couponCode: code,
      couponType: type,
      discountValue: value,
      limit: usageLimit,
      minimumPurchaseAmount: minPurchaseAmount,
      maximumDiscount: maxDiscountAmount,
      description,
      expiryDate: expiresAt,
    } = req.body;

    const exists = await Coupon.findOne({ code: code.trim() });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon already exists" });
    }
    const coupon = new Coupon({
      title,
      code,
      type,
      value,
      usageLimit,
      minPurchaseAmount,
      maxDiscountAmount,
      description,
      expiresAt: new Date(expiresAt),
    });

    await coupon.save();
    res
      .status(200)
      .json({ success: true, message: "Coupon added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    await Coupon.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

const getUserCoupons = async (req, res) => {
  try {
    const { id } = req.user;
    const usedCoupons = await UsedCoupon.find({ userId: id }).populate(
      "couponCode"
    );
    const coupons = await Coupon.find();
    const expiredCoupons = usedCoupons.map((coupon) => {
      if (coupon.couponCode.usageLimit <= coupon.usageCount) {
        return coupon.couponCode._id.toString();
      }
    });

    const activeCoupons = coupons.filter(
      (coupon) =>
        !expiredCoupons.includes(coupon._id.toString()) &&
        coupon.expiresAt > new Date() &&
        coupon.createdAt <= new Date()
    );

    res.status(200).json({ success: true, coupons: activeCoupons });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
};

export { addCoupon, getAllCoupons, deleteCoupon, getUserCoupons };
