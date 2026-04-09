const express = require("express");
const { Cart, CartItem } = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Get cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.userId, total: 0 });
      cart = await Cart.findByPk(cart.id, {
        include: [
          {
            model: CartItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
        ],
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cart = await Cart.findOne({ where: { userId: req.userId } });
    if (!cart) {
      cart = await Cart.create({ userId: req.userId, total: 0 });
    }

    // Check if product already in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      });
    }

    // Recalculate total
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    await cart.update({ total });

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ where: { userId: req.userId } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    await CartItem.destroy({
      where: { cartId: cart.id, productId },
    });

    // Recalculate total
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    await cart.update({ total });

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update quantity
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ where: { userId: req.userId } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const item = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });
    if (item) {
      await item.update({ quantity });
    }

    // Recalculate total
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    await cart.update({ total });

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.post("/clear", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.userId } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    await cart.update({ total: 0 });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
