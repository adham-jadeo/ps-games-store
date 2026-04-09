const express = require("express");
const { Order, OrderItem } = require("../models/Order");
const { Cart, CartItem } = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// Create order from cart
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({
      where: { userId: req.userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const order = await Order.create({
      userId: req.userId,
      totalAmount: cart.total,
      status: "pending",
      ...shippingAddress,
    });

    // Create order items
    for (const cartItem of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productId: cartItem.productId,
        title: cartItem.product.title,
        price: cartItem.price,
        quantity: cartItem.quantity,
      });
    }

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id } });
    await cart.update({ total: 0 });

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    res.json(createdOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if order belongs to user
    if (order.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order (customer can only cancel their own pending order)
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        error: "Only pending orders can be cancelled",
      });
    }

    await order.update({ status: "cancelled" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm order delivery (customer can only confirm their own shipped order)
router.put("/:id/confirm-received", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (order.status !== "shipped") {
      return res.status(400).json({
        error: "Only shipped orders can be confirmed as received",
      });
    }

    await order.update({ status: "delivered" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order from customer history after it is completed or cancelled
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        error: "Only delivered or cancelled orders can be removed from history",
      });
    }

    await OrderItem.destroy({ where: { orderId: order.id } });
    await order.destroy();

    res.json({ message: "Order deleted from history" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin only)
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allowedStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({ status });
    const updatedOrder = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
