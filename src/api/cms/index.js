import { Router } from "express";
import multer from 'multer';


// import admin from "./admin";
import auth from "./auth";
import member from "./member";
import { mysqlMiddleware } from "middlewares";

const api = new Router();
const upload = multer({dest: 'uploads/'}).single('file');

// api.use("/admin", admin);
api.use("/auth", auth);
api.use("/member", member);

api.get("/test", mysqlMiddleware, async (req, res) => {
  res.json({ 'tokenData': 'carrot' });
});
api.post("/test", mysqlMiddleware, upload, (req, res) => {
  //   res.json({ tokenData: req.tokenData });
  //   res.json({ tokenData: req.tokenData });
  console.log(req.file);
  console.log(req.body);
  return res.json({ test: "ㅇㅇ" });
});

export default api;
