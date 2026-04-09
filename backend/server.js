const express = require("express");
const sequelize = require("./config/database");
const cors = require("cors");
require("dotenv").config();

// Import models with associations
require("./models");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection
sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL database connected");
    // Sync models with database
    return sequelize.sync({ alter: false });
  })
  .then(() => console.log("Database models synced"))
  .catch((err) => console.log("Database connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
