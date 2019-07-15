import { ErrorThrow } from "lib/tools";
import User from "models/user";

// ===== GET /api/config
exports.getConfig = async (req, res) => {
  const { _id } = req.user;
  const query = { _id };
  const select = { toggleCompleteView: 1, _id: 0 };

  try {
    const config = await User.findOne(query)
      .select(select)
      .exec();
    if (!config) {
      return ErrorThrow(res, null, 400, "유효성 검사 실패");
    }
    res.json(config);
  } catch (e) {
    ErrorThrow(res, e, 500, "서버에러");
  }
};

// ======= PATCH /api/config/toggleCompleteView?sw=true
// 완료 목록 같이 보기.
exports.toggleCompleteView = async (req, res) => {
  const { sw } = req.query;
  const { _id } = req.user;
  const query = { _id };
  const updateData = {
    toggleCompleteView: sw === "true" ? true : false
  };

  if (sw === undefined) {
    return ErrorThrow(res, null, 400, "유효성 검사 실패");
  }

  try {
    const user = await User.findOneAndUpdate(query, updateData).exec();
    if (!user) {
      return ErrorThrow(res, null, 400, "대상을 찾을 수 없음");
    }
    res.json(updateData);
  } catch (e) {
    ErrorThrow(res, e, 500, "서버에러");
  }
};
