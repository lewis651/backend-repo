import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  image: String, // URL or path to image
  status: { type: String, default: 'pending', enum: ['pending', 'in-progress', 'resolved'] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", ReportSchema);