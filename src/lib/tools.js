import pbkdf2Password from "pbkdf2-password";
import passport from "passport";

const hasher = pbkdf2Password();

// ===== 암호화 pbkdf2async 비동기 처리.
export const pbkdf2Async = inputData => {
  return new Promise((resolve, reject) => {
    hasher(inputData, (err, pass, salt, hash) => {
      if (err) {
        return reject(err);
      }
      resolve({ pass, salt, hash });
    });
  });
};

// ===== express req 객체의 ip 얻는 방법
export const getUserIp = req => {
  //   let ipAddress;
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  );

  //   if (!!req.hasOwnProperty("sessionID")) {
  //     ipAddress = req.headers["x-forwarded-for"];
  //   } else {
  //     if (!ipAddress) {
  //       var forwardedIpsStr = req.header("x-forwarded-for");

  //       if (forwardedIpsStr) {
  //         var forwardedIps = forwardedIpsStr.split(",");
  //         ipAddress = forwardedIps[0];
  //       }
  //       if (!ipAddress) {
  //         ipAddress = req.connection.remoteAddress;
  //       }
  //     }
  //   }
  return ipAddress;
};

//============ request 객체를 기반으로 아이피를 반환한다.
exports.getIp = req => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  return ip.split(":").pop();
};

//======= objectId 검증 미들웨어
exports.checkObjectId = (req, res, next) => {
  const { ObjectId } = require("mongoose").Types;
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return req.status(400);
  }
  return next();
};

//======= 로그인 확인 미들웨어
exports.checkLogin = (ctx, next) => {
  const logged = ctx.isAuthenticated();
  if (!logged) {
    ctx.status = 401;
    return null;
  }
  return next();
};

//======= 유효성 검증
exports.joiValidate = (req, res, schema) => {
  const Joi = require("joi");
  const result = Joi.validate(req.body, schema);
  if (result.error) {
    ErrorThrow(res, result.error, 400, "유효성 검증 실패");
    return false;
  }
  return true;
};

//======= mongodb의 타입이 UTC로 고정되어 있어서 한국시간대로 맞추기
exports.setKST = () => {
  return new Date().getTime() + 3600000 * 9;
};

// ===== 토큰 인증 확인
exports.authToken = (req, tokenType = "token") => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      tokenType,
      { session: false },
      (none, data, error) => {
        if (error) {
          return reject(error);
        }
        resolve(data);
      }
    )(req);
  });
};

// ===== 에러 처리
exports.ErrorThrow = (res, e, status = 500, message = "") => {
  const eMessage = (e && e.message) || e.message;
  console.log(`*** Error(${message}): \n> ${eMessage}`);
  res.status(status).json({
    error: true,
    message: `${eMessage}`
  });
};
