import mongoose, { Schema } from "mongoose";
// const mongoose = require("mongoose");

// const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    trimg: true
  },
  nickname: {
    type: String,
    unique: true,
    trim: true
  },
  strategy: {
    type: String,
    require: true
  },
  strategyId: String,
  // 완료 목록 같이 보기.
  toggleCompleteView: {
    type: Boolean,
    default: false
  },
  joinTime: {
    type: Date,
    default: Date.now,
    require: true
  },
  _selectedCategory: {
    //현재 선택되어진 카테고리
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  joinIp: {
    type: String,
    require: true
  }
});

export default mongoose.model("User", userSchema);
