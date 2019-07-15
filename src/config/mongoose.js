import mongoose, { mongo } from "mongoose";

const { MONGO_URI: mongoUri } = process.env;

export default () => {
  // 글로벌 promise를 사용
  mongoose.Promise = global.Promise;
  // mongodb 접속
  mongoose.connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true
  });

  mongoose.connection
    .once("open", () => console.log("Mongodb running"))
    .on("error", err => console.error(err));
};
