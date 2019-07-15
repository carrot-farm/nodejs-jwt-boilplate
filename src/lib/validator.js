import Joi from "joi";

// ===== email과 password 유효성 검증.
export const userValidate = (email, password) => {
  // validation
  const schema = Joi.object().keys({
    email: Joi.string()
      .required()
      .email({ minDomainAtoms: 2 }),
    // 8~16 영문자, 숫자, 특수 문자 포함.
    password: Joi.string()
      .required()
      .regex(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}/)
  });
  let result = Joi.validate({ email, password }, schema);
  if (result.error) {
    result.error.field = result.error.details[0].path[0];
  }
  return result;
};
