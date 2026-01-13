import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
  location: String,
  days: [
    { day: String, time: String }
  ]
});

export default mongoose.model("Schedule", ScheduleSchema);
