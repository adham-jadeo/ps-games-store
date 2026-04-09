const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Order, OrderItem } = require("../models/Order");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Create payment intent
router.post("/create-intent", authMiddleware, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: { orderId },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
router.post("/confirm-payment", authMiddleware, async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update({
      status: "paid",
      transactionId,
      paymentMethod: "stripe",
    });

    const updatedOrder = await Order.findByPk(orderId, {
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
