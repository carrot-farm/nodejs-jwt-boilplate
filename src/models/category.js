import mongoose, { Schema } from "mongoose";

const category = new Schema({
  category: {
    type: String,
    trim: true
  },
  _userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true
  }
});

export default mongoose.model("Category", category);
