const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: "https://via.placeholder.com/300x400",
    },
    genre: {
      type: DataTypes.ENUM(
        "Action",
        "RPG",
        "Sports",
        "Racing",
        "Adventure",
        "Puzzle",
        "Shooter",
        "Strategy",
        "Other",
      ),
      defaultValue: "Other",
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: { min: 0, max: 5 },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    releaseDate: DataTypes.DATE,
    developer: DataTypes.STRING,
    publisher: DataTypes.STRING,
  },
  {
    timestamps: true,
    tableName: "products",
  },
);

module.exports = Product;
