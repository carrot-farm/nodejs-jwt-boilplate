/*
  토큰이 유효한지 검사하는 미들웨어
  성공시 req.isAuth=true
  실패시 res.status(401).json({error: true, message:'failed authentication'})
*/
import { authToken } from "../lib/tools";

const isLoginMiddleware = async (req, res, next) => {
  if (!req.headers["x-access-token"]) {
    return res.status(401).json({
      error: true,
      message: "failed authentication"
    });
  }
  try {
    const tokenData = await authToken(req);
    req.isAuth = tokenData ? true : false;
    if (req.isAuth === false) {
      return res.status(401).json({
        error: true,
        message: "failed authentication"
      });
    }
    next();
  } catch (e) {
    next();
  }
};

export default isLoginMiddleware;
