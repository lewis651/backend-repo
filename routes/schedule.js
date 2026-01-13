import express from "express";
import Schedule from "../models/Schedule.js";

const router = express.Router();

router.get("/:location", async (req, res) => {
  const schedule = await Schedule.findOne({ location: req.params.location });
  res.json(schedule);
});

export default router;
