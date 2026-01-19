import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import DriverSchedule from "../models/DriverSchedule.js";
import Schedule from "../models/Schedule.js";
import Report from "../models/Report.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/create-driver", protect(["admin"]), async (req, res) => {
  const { email, password, name, location } = req.body;

  if (!email || !password || !name || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const driver = await User.create({
      email,
      password: hashed,
      role: "driver",
      name,
      location
    });

    try {
      await sendEmail(
        email,
        "HYSACAM Driver Account Created",
        `This is your log in details for Hysacam connect.\nEmail: ${email}\nPassword: ${password}\nLogin at: your-app-url`
      );
    } catch (error) {
      console.error("Email sending failed:", error);
      // Still return success, but log the error
    }

    res.json(driver);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("Driver creation failed:", error);
    res.status(500).json({ message: "Failed to create driver" });
  }
});

router.get("/dashboard-stats", protect(["admin"]), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeDrivers = await User.countDocuments({ role: "driver", status: "ACTIVE" });
    const deactivatedAccounts = await User.countDocuments({ status: "INACTIVE" });
    const scheduledCollections = await Schedule.countDocuments(); // Assuming User Schedules is what we want here
    const openReports = await Report.countDocuments({ status: { $ne: "resolved" } }); // simplified pending/in-progress

    res.json({
      totalUsers,
      activeDrivers,
      deactivatedAccounts,
      scheduledCollections,
      openReports
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

router.get("/users", protect(["admin"]), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.get("/drivers", protect(["admin"]), async (req, res) => {
  const drivers = await User.find({ role: "driver" });
  res.json(drivers);
});

router.put("/user/:id", protect(["admin"]), async (req, res) => {
  const { role, status } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, status }, { new: true }).select('-password');
  res.json(user);
});

router.delete("/driver/:id", protect(["admin"]), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Driver deleted" });
});

router.delete("/user/:id", protect(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.post("/assign-schedule", protect(["admin"]), async (req, res) => {
  const { driverId, location, day, startTime, endTime } = req.body;
  const schedule = await DriverSchedule.create({ driverId, location, day, startTime, endTime });
  res.json(schedule);
});

router.get("/schedules", protect(["admin"]), async (req, res) => {
  const schedules = await DriverSchedule.find().populate('driverId', 'name email');
  res.json(schedules);
});

router.get("/user-schedules", async (req, res) => {
  const schedules = await Schedule.find();
  res.json(schedules);
});

router.post("/user-schedules", async (req, res) => {
  const { location, days } = req.body;
  if (!location || !days) {
    return res.status(400).json({ message: "Location and days are required" });
  }
  const schedule = await Schedule.findOneAndUpdate(
    { location },
    { days },
    { upsert: true, new: true }
  );

  res.json(schedule);
});

router.delete("/user-schedules/:location", async (req, res) => {
  await Schedule.findOneAndDelete({ location: req.params.location });
  res.json({ message: "Schedule deleted" });
});

router.get("/reports", async (req, res) => {
  const reports = await Report.find().populate('userId', 'name email').sort({ createdAt: -1 });
  res.json(reports);
});

router.get("/user-reports", protect(), async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

router.post("/reports", protect(), upload.single('image'), async (req, res) => {
  const { issueType, description, location } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const report = await Report.create({
      userId: req.user.id,
      issueType,
      description,
      location,
      image
    });
    res.json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

router.put("/reports/:id", async (req, res) => {
  const { status } = req.body;
  const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(report);
});

router.delete("/reports/:id", protect(["admin"]), async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

export default router;
