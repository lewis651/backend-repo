import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminExists = await User.findOne({ email: "hysacamadmin@gmail.com" });
    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      email: "hysacamadmin@gmail.com",
      password: hashedPassword,
      location: "Admin Location",
      role: "admin"
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();