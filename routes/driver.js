import express from "express";
import DriverSchedule from "../models/DriverSchedule.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/schedule", protect(["driver"]), async (req, res) => {
  const schedules = await DriverSchedule.find({ driverId: req.user.id });
  res.json(schedules);
});

export default router;
