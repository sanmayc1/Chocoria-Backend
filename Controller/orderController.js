import Order from "../Model/orderModel.js";
import OrderItem from "../Model/orderItemsModel.js";
import Product from "../Model/productModel.js";
import dateFormat from "../utils/dateFormat.js";
import OrderCancelRequest from "../Model/orderCancelRequest.js";
import Variant from "../Model/variant.js";

// create order
const createOrder = async (req, res) => {
  try {
    const { id } = req.user;
    const { shippingAddress, items, paymentMethod } = req.body;

    if (!shippingAddress || !items || !paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "Please Check all details" });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    const order = new Order({
      userId: id,
      shippingAddress,
      totalAmount,
      totalAmountAfterDiscount: totalAmount,
      paymentMethod,
      items: [],
    });

    await order.save();

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const orderItem = new OrderItem({
          orderId: order._id,
          productId: item.productId._id,
          name: item.productId.name,
          brand: item.productId.brand,
          img: item.productId.images[0],
          variant: item.variant,
          quantity: item.quantity,
          totalPrice: item.variant.price * item.quantity,
        });

        const savedOrderItem = await orderItem.save();
        const variant = await Variant.findById(item.variant._id);
        variant.quantity -= item.quantity;
        await variant.save();
        return savedOrderItem._id;
      })
    );

    order.items = orderItems;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
    let orders = await Order.find();
    orders = orders.map((order) => {
      const orderDate = dateFormat(order.orderDate);
      return { ...order._doc, orderDate };
    });
    res.status(200).json({ success: true, orders });
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

    const orderItem = await OrderItem.findOne({ _id: orderItemId });
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
};
