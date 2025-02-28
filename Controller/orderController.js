import Order from "../Model/orderModel.js";
import OrderItem from "../Model/orderItemsModel.js";
import Product from "../Model/productModel.js";
import dateFormat from "../utils/dateFormat.js";
import OrderCancelRequest from "../Model/orderCancelRequest.js";
import Variant from "../Model/variant.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../utils/envValues.js";
import User from "../Model/userModel.js";
import Wallet from "../Model/walletModel.js";
import WalletTransaction from "../Model/walletTransaction.js";
import UsedCoupon from "../Model/usedCoupon.js";
import Coupon from "../Model/couponModel.js";

// create order
const createOrder = async (req, res) => {
  try {
    const { id } = req.user;
    let { shippingAddress, items, paymentMethod, coupon, couponDiscount } =
      req.body;
    let razorpayOrder = null;
    if (!shippingAddress || !items || !paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "Please Check all details" });
    }

    const user = await User.findById(id);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    const totalAmountAfterDiscount = totalAmount - couponDiscount;

    if (paymentMethod === "razorpay") {
      paymentMethod = "Online";
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      const options = {
        amount: totalAmountAfterDiscount * 100,
        currency: "INR",
        receipt: "order_rcptid_11",
      };
      const order = await razorpay.orders.create(options);

      if (!order) {
        return res
          .status(400)
          .json({ success: false, message: "Something went wrong" });
      }
      razorpayOrder = order;
    }

    const uniqueOrderId = `ORD${Date.now().toString()}`;
    const order = new Order({
      uniqueOrderId,
      userId: id,
      couponDiscount,
      coupon,
      shippingAddress,
      totalAmount,
      razorpayOrderId: razorpayOrder?.id,
      totalAmountAfterDiscount,
      paymentMethod,
      items: [],
    });

    await order.save();

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const couponDiscountOfEachItem = couponDiscount
          ? (
              ((item.variant.price * item.quantity) / totalAmount) *
              couponDiscount
            ).toFixed(2)
          : 0;

        const orderItem = new OrderItem({
          orderId: order._id,
          productId: item.productId._id,
          name: item.productId.name,
          brand: item.productId.brand,
          couponDiscount: couponDiscountOfEachItem,
          img: item.productId.images[0],
          variant: item.variant,
          quantity: item.quantity,
          totalAmountAfterDiscount: (
            item.variant.price * item.quantity -
            couponDiscountOfEachItem
          ).toFixed(2),
          totalPrice: item.variant.price * item.quantity,
        });

        const savedOrderItem = await orderItem.save();
        if (paymentMethod === "COD") {
          const variant = await Variant.findById(item.variant._id);
          variant.quantity -= item.quantity;
          await variant.save();

          if (coupon) {
            const couponUse = await UsedCoupon.findOne({
              couponCode: coupon._id,
              userId: id,
            });
            if (!couponUse) {
              const newUsedCoupon = new UsedCoupon({
                couponCode: coupon._id,
                userId: id,
                usageCount: 1,
              });
              await newUsedCoupon.save();
            } else {
              couponUse.usageCount += 1;
              await couponUse.save();
            }
          }
        }

        return savedOrderItem._id;
      })
    );

    order.items = orderItems;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order,
      razorpayOrder,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Verify razorpay payment

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    console.log(req.body);
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");
    console.log(generatedSignature === razorpaySignature);

    if (generatedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
    const order = await Order.findOne({
      razorpayOrderId: razorpayOrderId,
    }).populate("items");
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    await Promise.all(
      order.items.map(async (item) => {
        const variant = await Variant.findById(item.variant._id);
        variant.quantity -= item.quantity;
        await variant.save();
        const orderItem = await OrderItem.findById(item._id);
        orderItem.paymentStatus = "success";
        await orderItem.save();
      })
    );
    if (order.coupon) {
      const couponUse = await UsedCoupon.findOne({
        couponCode: order.coupon._id,
        userId: order.userId,
      });
      if (!couponUse) {
        const newUsedCoupon = new UsedCoupon({
          couponCode: order.coupon._id,
          userId: order.userId,
          usageCount: 1,
        });
        await newUsedCoupon.save();
      } else {
        couponUse.usageCount += 1;
        await couponUse.save();
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Payment verified", order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

const orderStatusUpdate = async (req, res) => {
  try {
    const { razorpayOrderId } = req.body;

    console.log(req.body);
    const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });
    const orderItems = await OrderItem.find({ orderId: order._id });

    await Promise.all(
      orderItems.map(async (item) => {
        item.status = "Order Not Placed";
        item.paymentStatus = "failed";
        await item.save();
      })
    );

    res.status(200).json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.log(error);
  }
};

// get all orders by user id
const getAllOrderOfUser = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ userId: id })
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
        },
      })
      .sort({ orderDate: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get specific order item by  and item id
const getOrderItemDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const orderItem = await OrderItem.findOne({ _id: id }).populate(
      "productId"
    );
    const order = await Order.findOne({ _id: orderItem.orderId });

    res.status(200).json({ success: true, orderItem, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all orders

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "orderitems",
          localField: "items",
          foreignField: "_id",
          as: "items",
        },
      },
      {
        $match: {
          "items.paymentStatus": {
            $ne: "failed",
          },
        },
      },

      {
        $sort: {
          orderDate: -1,
        },
      },
    ]);
    const orderCancelRequests = await OrderCancelRequest.countDocuments({
      status: "pending",
    });
    console.log(orders);

    res.status(200).json({ success: true, orders , orderCancelRequests});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get order items by order id
const getAllItemsByOrderId = async (req, res) => {
  try {
    const { id } = req.params;
    const orderItems = await OrderItem.find({ orderId: id }).populate(
      "productId"
    );
    const order = await Order.findOne({ _id: id });

    res.status(200).json({ success: true, orderItems, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// change order status
const changeOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderItem.findOne({ _id: id });
    if (status === "Cancelled") {
      const variant = await Variant.findById(order.variant._id);
      variant.quantity += order.quantity;
      await variant.save();
    }
    if (status === "Delivered") {
      order.paymentStatus = "success";
      await order.save();
    }

    order.status = status;
    await order.save();
    res.status(200).json({ success: true, message: "Order status changed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// order cancel request
const createOrderCancelRequest = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { id: userId } = req.user;
    const { reason, explanation, orderItemId } = req.body;

    const orderItem = await OrderItem.findOne({ _id: orderItemId }).populate(
      "orderId"
    );
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, message: "Order item not found" });
    }

    if (orderItem.status !== "Pending") {
      const cancelRequest = new OrderCancelRequest({
        orderId,
        orderItem: orderItemId,
        reason,
        explanation,
        userId,
      });
      await cancelRequest.save();
      return res
        .status(200)
        .json({ success: true, message: "Request sent successfully" });
    }
    if (orderItem.orderId.paymentMethod !== "COD") {
      const wallet = await Wallet.findOne({ userId: orderItem.orderId.userId });
      const transactionId = `TXN${Date.now()}${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      if (!wallet) {
        const newWallet = new Wallet({
          userId: orderItem.orderId.userId,
          balance: 0,
          transactions: [],
        });
        const savedWallet = await newWallet.save();

        const newTransaction = new WalletTransaction({
          walletId: savedWallet._id,
          transactionId,
          type: "credit",
          amount: orderItem.totalAmountAfterDiscount,
          status: "success",
        });
        await newTransaction.save();

        savedWallet.transactions.push(newTransaction._id);
        savedWallet.balance += orderItem.totalAmountAfterDiscount;
        await savedWallet.save();
      } else {
        const newTransaction = new WalletTransaction({
          walletId: wallet._id,
          transactionId,
          type: "credit",
          amount: orderItem.totalAmountAfterDiscount,
          status: "success",
        });
        await newTransaction.save();
        wallet.transactions.push(newTransaction._id);
        wallet.balance += orderItem.totalAmountAfterDiscount;
        await wallet.save();
      }
      orderItem.paymentStatus = "refunded";
    }

    const variant = await Variant.findById(orderItem.variant._id);
    variant.quantity += orderItem.quantity;
    await variant.save();
    orderItem.status = "Cancelled";
    await orderItem.save();

    res
      .status(200)
      .json({ success: true, message: "Your order has been cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getCancleRequestByItemId = async (req, res) => {
  try {
    const { id } = req.params;
    const cancelRequest = await OrderCancelRequest.findOne({
      orderItem: id,
    });
    res.status(200).json({ success: true, cancelRequest });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllCancelRequests = async (req, res) => {
  try {
    const cancelRequests = await OrderCancelRequest.find({ status: "pending" })
      .populate("orderItem")
      .populate("orderId");
    res.status(200).json({ success: true, cancelRequests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const cancelRequestUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const cancelRequest = await OrderCancelRequest.findOne({ _id: id });
    cancelRequest.status = status;
    cancelRequest.response = response;
    await cancelRequest.save();
    if (status === "approved") {
      const orderItem = await OrderItem.findOne({
        _id: cancelRequest.orderItem,
      });
      orderItem.status = "Cancelled";
      if (orderItem.paymentStatus === "success" && status === "approved") {
        const wallet = await Wallet.findOne({ userId: cancelRequest.userId });
        if (!wallet) {
          const newWallet = new Wallet({
            userId: cancelRequest.userId,
            balance: 0,
            transactions: [],
          });
          const savedWallet = await newWallet.save();
          const transactionId = `TXN${Date.now()}${Math.floor(
            1000 + Math.random() * 9000
          )}`;
          const newTransaction = new WalletTransaction({
            walletId: savedWallet._id,
            transactionId,
            type: "credit",
            amount: orderItem.totalAmountAfterDiscount,
            status: "success",
          });
          await newTransaction.save();
          savedWallet.transactions.push(newTransaction._id);
          savedWallet.balance += newTransaction.amount;
          await savedWallet.save();
        } else {
          const transactionId = `TXN${Date.now()}${Math.floor(
            1000 + Math.random() * 9000
          )}`;
          const newTransaction = new WalletTransaction({
            walletId: wallet._id,
            transactionId,
            type: "credit",
            amount: orderItem.totalAmountAfterDiscount,
            status: "success",
          });
          await newTransaction.save();
          wallet.transactions.push(newTransaction._id);
          wallet.balance += newTransaction.amount;
          await wallet.save();
        }
        orderItem.paymentStatus = "refunded";
      }
      await orderItem.save();

      const product = await Product.findById(orderItem.productId);
      product.variants = product.variants.map((variant) => {
        if (variant.id === orderItem.variant.id) {
          return {
            ...variant,
            quantity: variant.quantity + orderItem.quantity,
          };
        }
        return variant;
      });
      await product.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Request updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  createOrder,
  getAllOrderOfUser,
  getOrderItemDetails,
  getAllOrders,
  getAllItemsByOrderId,
  changeOrderStatus,
  createOrderCancelRequest,
  getCancleRequestByItemId,
  getAllCancelRequests,
  cancelRequestUpdate,
  verifyRazorpayPayment,
  orderStatusUpdate,
};
