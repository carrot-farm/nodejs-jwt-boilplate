import jwt from "jsonwebtoken";
import passport from "passport";
// import queryString from "query-string";

import User from "models/user";

//========== 사용자 정보 찿기
export const getUser = email => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email });
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
};

//========== 구글 로그인
export const auth_google = (req, res, next) => {
  // 앱의 리다이렉트 링크가 있을 경우.
  if (req.query && req.query.redirect_uri) {
    req.session.redirect_uri = req.query.redirect_uri;
  }

  passport.authenticate("toDoGoogle")(req, res, next);
};

//========== 구글 콜백
export const auth_google_callback = (req, res, next) => {
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
  passport.authenticate("toDoGoogle", (none, data, error) => {
    // 유저가 없거나 에러일 경우
    if (error) {
      return complete(res, { error: true, message: error.message });
    }
    let token;

    // 토큰에 저장할 유저 정보
    const tokenUser = { email: data.email, _id: data._id } || null;

    // 로그인 처리
    req.login(tokenUser, { session: false }, async _error => {
      try {
        if (_error) {
          throw new Error(_error.message);
        }
        // 토큰 생성
        token = jwt.sign(tokenUser, tokenSecret, {
          ...tokenOptions,
          expiresIn: tokenExp
        });
        // console.log('*** issue token: ', token)
        complete(res, { token });
      } catch (e) {
        return complete(res, { error: true, message: e.message });
      }
    });
  })(req, res);
};

//========== 유저 가입
export const joinUser = (req, profile) => {
  const { email, strategyId, strategy, nickname, ip } = profile;

  return new Promise(async (resolve, reject) => {
    try {
      const userInfo = await User.findOne({ email: email });
      // 해당 유저가 존재할 경우
      if (userInfo) {
        return resolve({
          email: userInfo.email,
          strategy: userInfo.strategy,
          nickname: userInfo.nickname,
          _id: userInfo._id
        });
      }
      // console.log('*** register user')
      // 해당 유저가 존재하지 않을 경우 가입 처리
      const user = new User({
        email: email,
        strategy: strategy,
        nickname: nickname,
        joinIp: ip
      });
      await user.save();
      //promise 성공 반환
      return resolve({
        email,
        strategy,
        nickname,
        _id: user._id
      });
    } catch (e) {
      reject(e);
    }
  });
};

//========== 유저 정보
export const userInfo = req => {
  if (!req.session.user) {
    return (req.status = 204);
  }
  req.json(req.session.user);
};

//========== 로그인 유무 확인
export const check = (req, res) => {
  console.log("check ", req.token);
  return res.json();
};

//=========== 접속 시 초기 데이터
export const initialData = (req, res) => {
  if (!req.user) {
    return res.json({ logged: false });
  }
  const returnData = {
    logged: true,
    _selectedCategory: req.user._selectedCategory || "",
    toggleCompleteView: req.user.toggleCompleteView
  };

  res.json(returnData);
};

//========== 로그아웃
export const logout = (req, res) => {
  req.logout();
  res.status(204);
};

//========== 로그인 완료시
export const complete = (res, data = {}) => {
  const sendData = {
    type: "login",
    ...data
  };
  res.send(`<script>
      window.opener.postMessage(${JSON.stringify(sendData)}, "*");
      window.close();
   </script>`);
};
