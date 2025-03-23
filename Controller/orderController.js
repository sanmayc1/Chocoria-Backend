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
import Category from "../Model/categoryModel.js";
import orderReturnRequest from "../Model/orderReturn.js";
import Review from "../Model/ReviewModel.js";
import mongoose from "mongoose";

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

    let totalAmount = 0;
    let totalAmountAfterOfferDiscount = 0;

    for (let item of items) {
      const variant = await Variant.findById(item.variant._id);
      if (!variant) {
        return res
          .status(400)
          .json({ success: false, message: "Variant not found" });
      }
      if (variant.quantity < item.quantity) {
        return res
          .status(409)
          .json({ success: false, message: "Product out of stock" });
      }

      let price = item.variant.actualPrice ?? item.variant.price;
      totalAmount += price * item.quantity;
      totalAmountAfterOfferDiscount += item.variant.price * item.quantity;
    }

    const totalAmountAfterDiscount =
      totalAmountAfterOfferDiscount - couponDiscount;
    if (paymentMethod === "COD" && totalAmountAfterDiscount > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "COD not available for orders above ₹1000. Please use another payment method.",
      });
    }

    if (paymentMethod === "razorpay") {
      paymentMethod = "Online";
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      const options = {
        amount: totalAmountAfterDiscount * 100,
        currency: "INR",
        receipt: `receipt${Date.now()}`,
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
      offerDiscount: totalAmount - totalAmountAfterOfferDiscount,
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
          ? Math.round(
              ((item.variant.price * item.quantity) / totalAmount) *
                couponDiscount
            )
          : 0;
        const price = item.variant.actualPrice ?? item.variant.price;
        const totalPrice = price * item.quantity;

        const orderItem = new OrderItem({
          orderId: order._id,
          productId: item.productId._id,
          name: item.productId.name,
          brand: item.productId.brand,
          offerDiscount: totalPrice - item.variant.price * item.quantity,
          offer: item.productId.offer,
          couponDiscount: couponDiscountOfEachItem,
          img: item.productId.images[0],
          variant: item.variant,
          quantity: item.quantity,
          totalAmountAfterDiscount: (
            item.variant.price * item.quantity -
            couponDiscountOfEachItem
          ).toFixed(2),
          totalPrice,
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

    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

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

    const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });
    const orderItems = await OrderItem.find({ orderId: order._id });

    await Promise.all(
      orderItems.map(async (item) => {
        item.status = "Order Not Placed";
        item.paymentStatus = "failed";
        await item.save();
      })
    );

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
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

    const orderItem = await OrderItem.findOne({ _id: id }).populate({
      path: "productId",
      populate: {
        path: "brand",
      },
    });
    const order = await Order.findOne({ _id: orderItem.orderId });
    const review = await Review.findOne({ orderItemId: id });

    res.status(200).json({ success: true, orderItem, order, review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getUserOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
          items: { $elemMatch: { paymentStatus: { $ne: "failed" } } },
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

    const returnRequests = await orderReturnRequest.countDocuments({
      status: "pending",
    });

    res
      .status(200)
      .json({ success: true, orders, orderCancelRequests, returnRequests });
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
    const order = await OrderItem.findOne({ _id: id }).populate("orderId");
    if (status === "Cancelled") {
      const variant = await Variant.findById(order.variant._id);
      variant.quantity += order.quantity;
      await variant.save();
      if (order.orderId.paymentMethod === "Online") {
        const wallet = await Wallet.findOne({ userId: order.orderId.userId });
        const transactionId = `TXN${Date.now()}${Math.floor(
          1000 + Math.random() * 9000
        )}`;
        if (!wallet) {
          const newWallet = new Wallet({
            userId: order.orderId.userId,
            balance: 0,
            transactions: [],
          });
          const savedWallet = await newWallet.save();

          const newTransaction = new WalletTransaction({
            walletId: savedWallet._id,
            transactionId,
            type: "credit",
            amount: order.totalAmountAfterDiscount,
            status: "success",
          });
          await newTransaction.save();

          savedWallet.transactions.push(newTransaction._id);
          savedWallet.balance += order.totalAmountAfterDiscount;
          await savedWallet.save();
        } else {
          const newTransaction = new WalletTransaction({
            walletId: wallet._id,
            transactionId,
            type: "credit",
            amount: order.totalAmountAfterDiscount,
            status: "success",
          });
          await newTransaction.save();
          wallet.transactions.push(newTransaction._id);
          wallet.balance += order.totalAmountAfterDiscount;
          await wallet.save();
        }
        order.paymentStatus = "refunded";
      }
    }
    if (status === "Delivered") {
      order.paymentStatus = "success";
      await order.save();
      const product = await Product.findById(order.productId);
      const category = await Category.findById(product.category);
      category.buyCount += order.quantity;
      product.buyCount += order.quantity;
      await product.save();
      await category.save();
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

// get cancel request by item id

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

// get return request

const getReturnRequestByItemId = async (req, res) => {
  try {
    const { id } = req.params;

    const returnRequest = await orderReturnRequest.findOne({
      orderItem: id,
    });

    res.status(200).json({ success: true, returnRequest });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all cancel requests
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

// get all return request

const getAllReturnRequests = async (req, res) => {
  try {
    const returnRequests = await orderReturnRequest
      .find({ status: "pending" })
      .populate("orderItem")
      .populate("orderId");
    res.status(200).json({ success: true, returnRequests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// update cancel request

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

      const productVariant = await Variant.findById(orderItem.variant._id);
      productVariant.quantity += orderItem.quantity;
      productVariant.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Request updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// return request update

const returnRequestUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const returnRequest = await orderReturnRequest.findOne({ _id: id });
    returnRequest.status = status;
    returnRequest.response = response;
    await returnRequest.save();
    if (status === "approved") {
      const orderItem = await OrderItem.findOne({
        _id: returnRequest.orderItem,
      });
      orderItem.status = "Return";
      if (orderItem.paymentStatus === "success" && status === "approved") {
        const wallet = await Wallet.findOne({ userId: returnRequest.userId });
        if (!wallet) {
          const newWallet = new Wallet({
            userId: returnRequest.userId,
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

      const productVariant = await Variant.findById(orderItem.variant._id);
      productVariant.quantity += orderItem.quantity;
      productVariant.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Request updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all delivered orders
const getAllDeliveredOrders = async (req, res) => {
  try {
    const orders = await OrderItem.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderId",
        },
      },

      {
        $unwind: "$orderId",
      },
      {
        $sort: {
          "orderId.orderDate": -1,
        },
      },
    ]);
    res
      .status(200)
      .json({ success: true, orders, message: "All Delivered Orders" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// total revenue
const totalRevenue = async (req, res) => {
  const { filter } = req.query;

  try {
    let orderItems = await OrderItem.find({ status: "Delivered" }).populate(
      "orderId"
    );

    if (filter === "yearly") {
      let yearlyRevenue = {};

      for (let item of orderItems) {
        if (yearlyRevenue[item.orderId.orderDate.getFullYear()]) {
          yearlyRevenue[item.orderId.orderDate.getFullYear()] +=
            item.totalAmountAfterDiscount;
        } else {
          yearlyRevenue[item.orderId.orderDate.getFullYear()] =
            item.totalAmountAfterDiscount;
        }
      }

      yearlyRevenue = Object.keys(yearlyRevenue).map((key) => ({
        filter: key,
        revenue: yearlyRevenue[key],
      }));

      return res
        .status(200)
        .json({ success: true, message: "sucess", revenue: yearlyRevenue });
    }

    if (filter === "monthly") {
      let monthlyRevenue = {};

      const currentYear = new Date().getFullYear();

      for (let item of orderItems) {
        if (item.orderId.orderDate.getFullYear() !== currentYear) {
          continue;
        }
        let month = item.orderId.orderDate.getMonth();
        if (monthlyRevenue[month]) {
          monthlyRevenue[month] += item.totalAmountAfterDiscount;
        } else {
          monthlyRevenue[month] = item.totalAmountAfterDiscount;
        }
      }

      const months = {
        0: "January",
        1: "February",
        2: "March",
        3: "April",
        4: "May",
        5: "June",
        6: "July",
        7: "August",
        8: "September",
        9: "October",
        10: "November",
        11: "December",
      };

      monthlyRevenue = Object.keys(monthlyRevenue).map((key) => ({
        filter: months[key],
        revenue: monthlyRevenue[key],
      }));

      return res
        .status(200)
        .json({ success: true, message: "sucess", revenue: monthlyRevenue });
    }

    if (filter === "daily") {
      let dailyRevenue = {};

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      for (let item of orderItems) {
        if (
          item.orderId.orderDate.getFullYear() !== currentYear ||
          item.orderId.orderDate.getMonth() !== currentMonth
        ) {
          continue;
        }
        let day = item.orderId.orderDate.getDate();
        if (dailyRevenue[day]) {
          dailyRevenue[day] += item.totalAmountAfterDiscount;
        } else {
          dailyRevenue[day] = item.totalAmountAfterDiscount;
        }
      }

      dailyRevenue = Object.keys(dailyRevenue).map((key) => ({
        filter: key,
        revenue: dailyRevenue[key],
      }));

      return res
        .status(200)
        .json({ success: true, message: "sucess", revenue: dailyRevenue });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createRazorpayOrder = async (req, res) => {
  const { totalAmountAfterDiscount, orderItemId } = req.body;

  const orderItem = await OrderItem.findById(orderItemId);
  console.log(orderItem);
  if (!orderItem) {
    return res
      .status(400)
      .json({ success: false, message: "Order item not found" });
  }

  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  const options = {
    amount: totalAmountAfterDiscount * 100,
    currency: "INR",
    receipt: `receipt${Date.now()}`,
  };
  const order = await razorpay.orders.create(options);

  if (!order) {
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
  orderItem.razorpayOrderId = order.id;
  orderItem.save();
  return res.status(200).json({ success: true, order });
};

const verifyRetryPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
    const orderItem = await OrderItem.findOne({ razorpayOrderId }).populate(
      "orderId"
    );
    orderItem.razorpayPaymentId = razorpayPaymentId;
    orderItem.paymentStatus = "success";
    orderItem.status = "Pending";
    orderItem.save();

    if (orderItem.orderId.coupon) {
      const couponUse = await UsedCoupon.findOne({
        couponCode: orderItem.orderId.coupon._id,
        userId: orderItem.orderId.userId,
      });
      if (!couponUse) {
        const newUsedCoupon = new UsedCoupon({
          couponCode: orderItem.orderId.coupon._id,
          userId: orderItem.orderId.userId,
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
      .json({ success: true, message: "Payment successful", orderItem });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const orderReturn = async (req, res) => {
  try {
    const { orderItemId, reason, explanation } = req.body;
    const orderItem = await OrderItem.findById(orderItemId);
    const { id: userId } = req.user;

    if (!orderItem) {
      return res
        .status(409)
        .json({ success: false, message: "No order found" });
    }
    const newReturnRequest = new orderReturnRequest({
      orderId: orderItem.orderId,
      userId,
      orderItem: orderItem._id,
      reason,
      explanation,
    });
    await newReturnRequest.save();

    res
      .status(200)
      .json({ success: true, message: "Request Sent Successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const orderReview = async (req, res) => {
  try {
    const { review, rating, productId, userId, orderItemId } = req.body;
    const product = await Product.findById(productId);

    if (!review.trim() && !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Please give rating and review" });
    }

    const newReview = await Review.create({
      review,
      rating,
      productId,
      userId,
      orderItemId,
    });

    const id = new mongoose.Types.ObjectId(`${productId}`);
    const averageRating = await Review.aggregate([
      {
        $match: { productId: id },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
        },
      },
    ]);

    product.averageRating = parseFloat(averageRating[0].average.toFixed(1));
    await product.save();

    res.status(200).json({ success: true, message: "Review Sumbimited" });
  } catch (error) {}
};

const getAllReviews = async (req, res) => {
  try {
    const { id } = req.params;
  
    const reviews = await Review.find({ productId: id }).populate("userId");

    res
      .status(200)
      .json({ success: true, message: "Reviews fetched", reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"Internal Server Error"})
    
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
  getAllDeliveredOrders,
  totalRevenue,
  getUserOrderDetails,
  createRazorpayOrder,
  verifyRetryPayment,
  orderReturn,
  getReturnRequestByItemId,
  getAllReturnRequests,
  returnRequestUpdate,
  orderReview,
  getAllReviews
};
