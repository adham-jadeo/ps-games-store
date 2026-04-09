const User = require("./User");
const Product = require("./Product");
const { Cart, CartItem } = require("./Cart");
const { Order, OrderItem } = require("./Order");
const Review = require("./Review");

// Setup associations
User.hasMany(Cart, { foreignKey: "userId", as: "carts" });
Cart.belongsTo(User, { foreignKey: "userId" });

Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(CartItem, { foreignKey: "productId" });

User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "productId" });

User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = {
  User,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
};
