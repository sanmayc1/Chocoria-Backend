import Order from "../Model/orderModel.js";
import OrderItem from "../Model/orderItemsModel.js";
import Product from "../Model/productModel.js";
import dateFormat from "../utils/dateFormat.js";


// create order
const create_Order = async (req, res) => {
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
          name:item.productId.name,
          brand:item.productId.brand,
          img:item.productId.images[0],
          variant: item.variant,
          quantity: item.quantity,
          totalPrice: item.variant.price * item.quantity,
        });
        
        const savedOrderItem = await orderItem.save();
        const product = await Product.findById(item.productId._id);
        product.variants = product.variants.map((variant) => {
            if (variant.id === item.variant.id) {
              return { ...variant, quantity: variant.quantity - item.quantity }; // Update variant quantity correctly
            }
            return variant;
          });
        await product.save();
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
const get_all_orders_by_user_id = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ userId: id }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });


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

    const orderItem = await OrderItem.findOne({ _id: id }).populate("productId");
    const order = await Order.findOne({ _id: orderItem.orderId });

    res.status(200).json({ success: true, orderItem, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// get all orders 
 

const get_all_orders = async (req, res) => {
  try {
   let orders = await Order.find()
   orders = orders.map((order) => {
    const orderDate = dateFormat(order.orderDate)
    return {...order._doc, orderDate}
   })
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// get order items by order id
const getAllItemsByOrderId = async (req, res) => {
  try {
    const { id } = req.params;
    const orderItems = await OrderItem.find({ orderId: id }).populate("productId");
    const order = await Order.findOne({ _id: id });

    res.status(200).json({ success: true, orderItems, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// change order status
const changeOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await OrderItem.findOne({ _id: id });
    order.status = status;
    await order.save();
    res.status(200).json({ success: true, message: "Order status changed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


export { create_Order, get_all_orders_by_user_id, getOrderItemDetails  , get_all_orders ,getAllItemsByOrderId ,changeOrderStatus };
