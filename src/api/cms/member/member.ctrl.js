import jwt from "jsonwebtoken";
import pbkdf2Password from "pbkdf2-password";
import passport from "passport";

import { userValidate } from "lib/validator";
import { pbkdf2Async, getUserIp } from "lib/tools";
import { loginWindowDone, registerMember, memberLogin } from "lib/common";

const {
  TOKEN_SECRET: tokenSecret,
  TOKEN_REFRESH_SECRET: tokenRefreshSecret,
  TOKEN_ISSUER: tokenIssuer,
  TOKEN_SUBJECT: tokenSubject,
  TOKEN_EXP: tokenExp,
  TOKEN_REFRESH_EXP: tokenRefreshExp
} = process.env;
const tokenOptions = {
  issuer: tokenIssuer,
  subject: tokenSubject
};

// ========== 가입
export const register = async (req, res) => {
  const { email, password, checkedTerms3 } = req.body;

  // 유효성 검사
  const validationResult = userValidate(email, password);

  try {
    if (validationResult.error) {
      throw new Error(`${validationResult.error.field} 에러.`);
    }

    await registerMember(req, {
      email,
      password,
      mem_receive_email: checkedTerms3,
      provider: "local"
    });

    res.json({
      error: false,
      message: "가입이 완료되었습니다. 로그인을 해주십시요."
    });
  } catch (e) {
    console.log("*** member.ctrl.register Error ", e);
    res.status(401).json({
      error: true,
      message: e.message
    });
  }
};

// ========== 로그인
export const login = async (req, res) => {
  const { email, password } = req.body;
  // console.log("*** login inputData ", email, password);

  // email, password validate
  const validationResult = userValidate(email, password);
  // console.log("> validationResult", validationResult);
  if (validationResult.error) {
    return res.status(401).json({
      error: true,
      message: `${validationResult.error.field} 에러.`
    });
  }

  // 미리 정의된 memberStrategy 실행 후 user 로 지정된 정보를 넘긴다.
  passport.authenticate("memberStrategy", async (e, user, error) => {
    // console.log("> memberStrategy user", user);
    if (error) {
      // console.log("> memberStrategy Error", error);
      return res.status(401).json({
        error: true,
        message: error.message
      });
    }

    // 토큰에 저장 할 유저 정보
    const tokenUser = {
      email: user.email,
      isAdmin: user.isAdmin > 0 ? true : false
    };
    try {
      const tokenData = await memberLogin(req, tokenUser);
      if (tokenData.error) {
        throw new Error(tokenData.message);
      }
      // 리프레시 토큰 저장
      res.json({
        userInfo: tokenUser,
        token: tokenData.token,
        refreshToken: tokenData.refreshToken,
        isLogged: true
      });
    } catch (e) {
      console.log("*** login Error: ", e);
      return res.status(401).json({
        error: true,
        message: e.message
      });
    }
  })(req, res);
};

// ========== google login
export const googleLogin = (req, res, next) => {
  passport.authenticate("cmsGoogle")(req, res, next);
};

// ========== google login callback
export const googleLoginCallback = (req, res, next) => {
  passport.authenticate("cmsGoogle", async (none, data, error) => {
    let { user, email, password, provider } = data;
    // 에러일 경우
    if (error) {
      return loginWindowDone(res, { error: true, message: error.message });
    }
    console.log("*** googleLoginCallback", user, email, provider);
    try {
      // 유저가 없을 경우 가입 처리
      if (!user) {
        user = await registerMember(req, {
          email,
          password,
          provider
        });
      }
      // console.log("> user: ", user);

      // 로그인 처리
      const tokenUser = {
        email,
        isAdmin: user.mem_is_admin > 0 ? true : false
      };
      const tokenData = await memberLogin(req, tokenUser);
      // console.log("> tokenData: ", tokenData);
      if (tokenData.error === true) {
        throw new Error(tokenData.message);
      }

      // 완료처리
      loginWindowDone(res, {
        token: tokenData.token,
        refreshToken: tokenData.refreshToken,
        userInfo: tokenUser
      });
    } catch (e) {
      console.log("*** registerMember error: ", e);
      return loginWindowDone(res, { error: true, message: e.message });
    }
  })(req, res);
};

// ========== access token check
export const check = (req, res) => {
  res.json({
    success: true,
    message: "pass check"
  });
};

// ========== access token 재발행
export const refreshToken = async (req, res) => {
  try {
    // 토큰 정보
    let tokenUser = {
      email: req.user.email,
      admin: req.user.admin
    };
    let token;
    let refreshToken;
    // 관리자일 경우
    if (req.user.amidn) {
      // 리프레시 토큰 유효성 검증
      const oldRefreshToken = await req.mysql
        .table("bd_config", "select")
        .find({
          cf_admin_refresh_token: req.headers["x-refresh-token"]
        })
        .select("COUNT (*) as cnt")
        .exec();
      if (oldRefreshToken[0].cnt <= 0) {
        throw new Error("un authorized");
      }
    }
    // 일반 유저일 경우.
    else {
    }
    // access token 발행
    token = jwt.sign(tokenUser, tokenSecret, {
      ...tokenOptions,
      expiresIn: tokenExp
    });
    // 리프레시 토큰의 남은 만료시간(일)
    const diffDate = Math.round(
      (req.user.exp * 1000 - new Date().getTime()) / 1000 / 60 / 60 / 24
    );
    // 리프레시 토큰의 유효기간이 2일 이내 일경우 리프레시 토큰 재발행.
    if (diffDate <= 2) {
      refreshToken = jwt.sign(tokenUser, tokenRefreshSecret, {
        ...tokenOptions,
        expiresIn: tokenRefreshExp
      });
    }
    // return
    res.json({
      token,
      refreshToken
    });
  } catch (e) {
    res.status(401).send(e.message);
  }
};
