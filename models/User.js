import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    role: {
      type: String,
      enum: ["admin", "driver", "user"],
      default: "user"
    },
  
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  password: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: false,
  },
});

export default mongoose.model("User", userSchema);
