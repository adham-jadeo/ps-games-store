const express = require("express");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("../models/Product");
const { Order, OrderItem } = require("../models/Order");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// Add product (admin only)
router.post("/products", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      image,
      genre,
      stock,
      releaseDate,
      developer,
      publisher,
    } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      image,
      genre,
      stock,
      releaseDate,
      developer,
      publisher,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (admin only)
router.put(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      await product.update(req.body);
      const updatedProduct = await Product.findByPk(req.params.id);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete product (admin only)
router.delete(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      await product.destroy();
      res.json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get all orders (admin only)
router.get("/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
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

// Update order status (admin only)
router.put(
  "/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
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

      if (status === "shipped" && order.status !== "shipped") {
        for (const item of order.items) {
          const product = await Product.findByPk(item.productId);

          if (!product) {
            return res.status(404).json({
              error: `Product for order item "${item.title}" was not found`,
            });
          }

          if (product.stock < item.quantity) {
            return res.status(400).json({
              error: `Not enough stock for "${product.title}"`,
            });
          }
        }

        for (const item of order.items) {
          const product = await Product.findByPk(item.productId);
          await product.update({ stock: product.stock - item.quantity });
        }
      }

      await order.update({ status });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Delete order from admin history after it is completed or cancelled
router.delete(
  "/orders/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (!["delivered", "cancelled"].includes(order.status)) {
        return res.status(400).json({
          error: "Only delivered or cancelled orders can be deleted",
        });
      }

      await OrderItem.destroy({ where: { orderId: order.id } });
      await order.destroy();

      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Get dashboard stats (admin only)
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalOrders = await Order.count({
      where: {
        status: {
          [Op.ne]: "cancelled",
        },
      },
    });

    const totalRevenueResult = await Order.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "total"],
      ],
      where: {
        status: {
          [Op.in]: ["shipped", "delivered"],
        },
      },
      raw: true,
    });

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const pendingOrders = await Order.count({
      where: { status: "pending" },
    });

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue),
      pendingOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
