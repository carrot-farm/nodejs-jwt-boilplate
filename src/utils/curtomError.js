// ===== 커스텀 에러 함수
const curtomError = ({error = 'GENERIC', message = ''}) => {
  const errorData = {
    error,
    message
  };
  if(Error.capturesStackTrace) {
    Error.capturesStackTrace(errorData, CustomError);
  }
  return errorData
};

export default curtomError;