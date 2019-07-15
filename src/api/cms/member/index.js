import { Router } from "express";

import { mysqlMiddleware } from "middlewares";
import {
  register,
  login,
  googleLogin,
  googleLoginCallback
} from "./member.ctrl";

const router = new Router();

// 가입
router.post("/register", mysqlMiddleware, register);
// 로그인
router.post("/login", mysqlMiddleware, login);
router.get("/google", mysqlMiddleware, googleLogin);
router.get("/google/callback", mysqlMiddleware, googleLoginCallback);

router.get('/test', (req, res) => {
    res.json({'member': 'member'});
})

// token 유효성 검증
// router.get(
//   "/check",
//   passport.authenticate("token", { session: false }),
//   mysqlMiddleware,
//   check
// );

// // token 재발행
// router.get(
//   "/refreshToken",
//   passport.authenticate("refreshToken", { session: false }),
//   mysqlMiddleware,
//   refreshToken
// );

export default router;
