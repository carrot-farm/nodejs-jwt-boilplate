/*
  인증용 미들웨어
  성공시 req.user 데이터 붙인다.
  req.user{
    _id, email, subject, ...
  }
*/
import passport from "passport";

import User from "models/user";
import { authToken } from "lib/tools";

const getUserMiddleware = async (req, res, next) => {
  //   console.log(authToken(req));
  //   console.log(req.headers["x-access-token"]);
  if (!req.headers["x-access-token"]) {
    return next();
  }
  try {
    const tokenData = await authToken(req);
    // 유저 정보 가져오기
    req.user = await User.findOne({ _id: tokenData._id });
    next();
  } catch (e) {
    next();
  }
};

export default getUserMiddleware;
