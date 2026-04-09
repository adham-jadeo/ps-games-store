const express = require("express");
const { Op } = require("sequelize");
const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

const updateProductRating = async (productId) => {
  const reviews = await Review.findAll({
    where: { productId },
    attributes: ["rating"],
  });

  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

  await Product.update(
    { rating: Number(averageRating.toFixed(1)) },
    { where: { id: productId } },
  );
};

// Get all products with pagination and filters
router.get("/", async (req, res) => {
  try {
    const {
      genre,
      search,
      page = 1,
      limit = 12,
      sortBy = "createdAt",
    } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (genre) where.genre = genre;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [[sortBy, "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.json({
      products: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Review,
          as: "reviews",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
            },
          ],
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update a review for a product
router.post("/:id/reviews", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const rating = parseInt(req.body.rating, 10);
    const comment = req.body.comment?.trim();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment) {
      return res.status(400).json({ error: "Review comment is required" });
    }

    const existingReview = await Review.findOne({
      where: { productId: product.id, userId: req.userId },
    });

    if (existingReview) {
      await existingReview.update({ rating, comment });
    } else {
      await Review.create({
        userId: req.userId,
        productId: product.id,
        rating,
        comment,
      });
    }

    await updateProductRating(product.id);

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Review,
          as: "reviews",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a review (admin only)
router.delete(
  "/:productId/reviews/:reviewId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const review = await Review.findOne({
        where: {
          id: req.params.reviewId,
          productId: req.params.productId,
        },
      });

      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      await review.destroy();
      await updateProductRating(req.params.productId);

      const updatedProduct = await Product.findByPk(req.params.productId, {
        include: [
          {
            model: Review,
            as: "reviews",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "username"],
              },
            ],
          },
        ],
      });

      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
