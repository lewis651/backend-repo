import mongoose from "mongoose";

const driverScheduleSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  location: String,
  streets: [String],
  day: String,
  startTime: String,
  endTime: String
});

export default mongoose.model("DriverSchedule", driverScheduleSchema);
