const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    paymentMethod: DataTypes.STRING,
    transactionId: DataTypes.STRING,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    country: DataTypes.STRING,
  },
  {
    timestamps: true,
    tableName: "orders",
  },
);

// OrderItem model for individual items in order
const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
    title: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    quantity: DataTypes.INTEGER,
  },
  {
    timestamps: false,
    tableName: "order_items",
  },
);

module.exports = { Order, OrderItem };
