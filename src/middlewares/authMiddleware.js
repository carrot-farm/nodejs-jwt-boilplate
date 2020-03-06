/*
  토큰이 유효한지 검사하는 미들웨어
  성공시 req.isAuth=true
*/
import { authToken } from "../lib/tools";

const authMiddleware = async (req, res, next) => {
  let tokenType = "none";
  if (req.headers["x-access-token"]) {
    tokenType = "token";
  }
  if (req.headers["x-fresh-token"]) {
    tokenType = "refreshToken";
  }
  try {
    if (tokenType === "none") {
      throw new Error("unauthorization");
    }
    const tokenData = await authToken(req, tokenType);
    // console.log('*** tokenData', tokenData);
    // console.log('*** iat', new Date(tokenData.iat*1000).format('yyyy-MM-dd hh:mm:ss'));
    // console.log('*** exp', new Date(tokenData.exp*1000).format('yyyy-MM-dd hh:mm:ss'));
    req.isAuth = tokenData ? true : false;
    req.token = tokenData;
    next();
  } catch (e) {
    // console.log('*** authMiddleware Error: ', e);
    res.json({
      error: true,
      // true일 경우 access token 발급 재요청
      refreshToken: tokenType === "token" ? true : false,
      // true일 경우 인증 실패(토큰이 없거나 refresh 토큰까지 기한이 만료되었을 경우)
      unauthorization:
        tokenType === "none" || tokenType === "refreshToken" ? true : false,
      message: e.message
    });
  }
};

export default authMiddleware;
