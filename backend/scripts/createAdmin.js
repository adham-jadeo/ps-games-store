const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const User = require("../models/User");

// Load .env from backend folder
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database.");

    const email = "adhamnader963@gmail.com";
    const username = "adhamnader963";
    const password = "adham1234";

    let user = await User.findOne({ where: { email } });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user created:", email);
    } else {
      user.username = username;
      user.password = await bcrypt.hash(password, 10);
      user.role = "admin";
      await user.save();
      console.log("Existing user updated to admin:", email);
    }

    console.log("Admin account is ready. You can now log in as admin.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin account:", error.message);
    process.exit(1);
  }
}

createAdmin();
