const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    lastName: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    role: {
      type: DataTypes.ENUM("customer", "admin"),
      defaultValue: "customer",
    },
    phone: {
      type: DataTypes.STRING,
    },
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    country: DataTypes.STRING,
  },
  {
    timestamps: true,
    tableName: "users",
  },
);

module.exports = User;
