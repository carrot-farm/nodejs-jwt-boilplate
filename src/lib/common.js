import Joi from "joi";
import jwt from "jsonwebtoken";

import { getUserIp, pbkdf2Async } from "lib/tools";

// ===== 가입 처리
export const registerMember = async (
  req,
  { email, password, mem_receive_email, provider }
) => {
  const now = new Date().format("yyyy-MM-dd HH:mm:ss");
  const nowDate = now.split(" ")[0];
  let insertData = {
    mem_is_admin: 0,
    mem_registered_platform: provider || "local", // 가입 플랫폼
    mem_user_id: email,
    mem_password: "",
    mem_salt: "",
    mem_refresh_token: "",
    mem_email: email,
    mem_birthday: nowDate,
    mem_receive_email: mem_receive_email ? 1 : 0, // 광고성 메일 수신 여부
    mem_register_datetime: now,
    mem_profile_content: "",
    mem_admin_memo: ""
  };
  //   console.log("*** register: ", email, password, mem_receive_email, provider);
  return new Promise(async (resolve, reject) => {
    const schema = Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      provider: Joi.strict().required()
    });
    const validateResult = Joi.validate({ email, password, provider }, schema);

    try {
      if (validateResult.error) {
        return new Error("유효성 검증에 실패  하였습니다.");
      }
      // 해당 유저가 있는지 확인.
      const memberInfo = await req.mysql
        .table("bd_member", "select")
        .startUnRelease()
        .select("mem_user_id, mem_password, mem_salt")
        .find({ mem_user_id: email })
        .exec();
      //   console.log("> memberInfo \n", memberInfo);
      if (memberInfo.length) {
        throw new Error("해당 유저는 이미 가입되어 있습니다.");
      }

      // 총 회원 수
      const [{ cnt }] = await req.mysql
        .table("bd_member", "select")
        .endUnRelease()
        .count()
        .exec();
      //   console.log("> totalMember \n", cnt);
      // 총 회원수가 없을 경우 최고 관리자
      if (cnt <= 0) {
        insertData.mem_is_admin = 1;
      }

      // 아이피 확인.
      const userIp = getUserIp(req);
      insertData.mem_register_ip = userIp;
      //   console.log("> userIp \n", userIp);

      // 암호화
      const { salt, hash } = await pbkdf2Async({ password });
      insertData.mem_salt = salt;
      insertData.mem_password = hash;
      //   console.log("> salt & hash \n", salt, hash);

      //   console.log("> insertData: \n", insertData);
      // insert data
      await req.mysql
        .table("bd_member", "insert")
        .data(insertData)
        .save();

      resolve(insertData);
    } catch (e) {
      req.mysql.releaseAndRollback();
      //   console.log("*** registerMember Error:", e);
      reject({ error: true, message: e.message });
    }
  });
};

// ===== 로그인 처리
export const memberLogin = async (req, tokenUser) => {
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
  let returnData = {};
  return new Promise( async (resolve, reject) => {
    // req.login(tokenUser, { session: false }, async error => {
      try {
        // if (error) {
        //   throw new Error(error.message);
        // }
        // 토큰 생성
        returnData.token = jwt.sign(tokenUser, tokenSecret, {
          ...tokenOptions,
          expiresIn: tokenExp
        });
        // 리프레시 토큰 생성
        returnData.refreshToken = jwt.sign(tokenUser, tokenRefreshSecret, {
          ...tokenOptions,
          expiresIn: tokenRefreshExp
        });
        // console.log("*** issue token: ", returnData);
        await req.mysql
          .table("bd_member", "UPDATE")
          .find({ mem_user_id: tokenUser.email })
          .data({ mem_refresh_token: returnData.refreshToken })
          .save();
        resolve(returnData);
      } catch (e) {
        req.mysql.releaseAndRollback();
        // console.log("*** login error", e);
        reject({ error: true, message: e.message });
      }
    // });
  });
};

// ===== login api를 사용시 완료 처리.
export const loginWindowDone = (res, jsonData) => {
  res.send(`<script>
        window.opener.postMessage(${JSON.stringify(jsonData)}, "*");
        window.close();
    </script>`);
};
