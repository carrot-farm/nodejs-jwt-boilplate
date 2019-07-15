const Joi = require("joi");

import ToDos from "models/toDos";
import Category from "models/category";
import { ErrorThrow, setKST, joiValidate } from "lib/tools";

//======= POST /api/toDos/
exports.write = async (req, res) => {
  try {
    const { _id: _userId } = req.user;
    const data = req.body;
    const schema = Joi.object().keys({
      content: Joi.string().required(),
      categoryId: Joi.string().required()
    });

    //유효성 검증
    const result = Joi.validate(data, schema);
    if (result.error) {
      return ErrorThrow(res, result.error, 400, "유효성검증 실패");
    }
    //입력 객체 생성
    const toDos = new ToDos({
      _categoryId: data.categoryId,
      _userId: _userId,
      content: data.content,
      writeTime: setKST()
    });
    await toDos.save();

    res.json({
      _id: toDos._id,
      _categoryId: toDos._categoryId,
      _userId: toDos._userId,
      content: toDos.content,
      completed: toDos.completed,
      writeTime: toDos.writeTime
    });
  } catch (e) {
    ErrorThrow(res, e, 500, "서버 에러");
  }
};

//======= GET /api/toDos/toDo/:itemId
exports.read = async (req, res) => {
  try {
    const { _id: _userId } = req.user;
    const { itemId } = req.params;
    const query = {
      _userId: _userId,
      _id: itemId
    };
    const item = await ToDos.findOne(query)
      .select(
        "completed content writeTime completeTime _id _categoryId _userId"
      )
      .lean()
      .exec();
    //마지막 페이지를 헤더에 알려주기.
    res.json(item);
  } catch (e) {
    ErrorThrow(res, e, 500, "서버 에러");
  }
};

//======= GET /api/toDos/:categoryId?search=value&completed=true
exports.list = async (req, res) => {
  try {
    const { _id: _userId } = req.user;
    const { categoryId: _categoryId } = req.params;
    const completed = req.query.completed === "true" ? true : false;
    const page = Number(req.query.page || 1);
    const listNum = 10;
    let query = {
      _userId: _userId,
      _categoryId: _categoryId,
      completed
    };
    if (completed) {
      delete query.completed;
    }
    const list = await ToDos.find(query)
      .sort({ _id: -1 }) //_id 필드 역정렬
      .limit(listNum) //지정된 갯수 만큼 가져오기.
      .skip((page - 1) * listNum) //
      .select(
        "completed content writeTime completeTime _id _categoryId _userId"
      )
      .lean()
      .exec();
    const totalNum = await ToDos.find(query)
      .countDocuments()
      .exec();

    // 완료하지 않은 할일 목록 숫자 세기
    const notCompletedCount = await ToDos.aggregate([
      { $match: { completed: false } },
      {
        $group: {
          _id: "$_categoryId",
          count: { $sum: 1 }
        }
      }
    ]).exec();
    // 마지막 페이지를 헤더에 알려주기.
    res.set("last-page", Math.ceil(totalNum / listNum));
    res.json({
      lastPage: Math.ceil(totalNum / listNum),
      list,
      notCompletedCount
    });
  } catch (e) {
    ErrorThrow(res, e, 500, "toDos list");
  }
};

//======= PATCH /api/toDos/:itemId
exports.update = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { _id: userId } = req.user;
    const query = { _id: itemId, _userId: userId };
    const schema = Joi.object().keys({
      content: Joi.string().required(),
      completed: Joi.boolean().required()
    });
    //유효성 검증
    if (!joiValidate(req, res, schema)) {
      return;
    }
    if (req.body.completed) {
      req.body.completeTime = setKST();
    } else {
      req.body.completeTime = null;
    }
    const item = await ToDos.findByIdAndUpdate(query, req.body, {
      new: true
    }).exec();
    if (!item) {
      res.status(404);
      return;
    }
    res.json(item);
  } catch (e) {
    ErrorThrow(res, e, 500, "서버에러");
  }
};

//======= DELETE /api/toDos/:itemId
exports.remove = async (req, res) => {
  const { itemId } = req.params;
  const { _id: userId } = req.user;
  const query = { _id: itemId, _userId: userId };
  try {
    await ToDos.findByIdAndRemove(query).exec();
    res.json({ _id: itemId });
  } catch (e) {
    ErrorThrow(res, e, 500, "failed delete todo");
  }
};
