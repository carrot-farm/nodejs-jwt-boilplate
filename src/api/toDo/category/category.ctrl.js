import Joi from "joi";
import Category from "models/category";
import { ESRCH } from "constants";
import { ErrorThrow } from "lib/tools";

//======= GET /api/category/:id
exports.read = async (req, res) => {
  try {
    const query = { _id: req.params.id, _userId: req.user._id };
    const category = await Category.findOne(query)
      .select("_id category")
      .exec();
    if (!category) {
      res.status(404);
      return;
    }
    res.json(category);
  } catch (e) {
    console.log("*** Error(/api/category/:id)", e.message);
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
};

//======= GET /api/category/
exports.list = async (req, res) => {
  const { _id } = req.user;
  const page = Number(req.query.page || 1);
  const query = { _userId: _id };
  const listNum = 20;
  try {
    const categories = await Category.find(query)
      .sort({ _id: -1 })
      .limit(listNum)
      .skip((page - 1) * listNum)
      .select("_id category")
      .lean()
      .exec();
    const totalNum = await Category.find(query)
      .countDocuments()
      .exec();
    //마지막 페이지를 헤더에 알려주기.
    res.set("Last-Page", Math.ceil(totalNum / listNum)).json(categories);
  } catch (e) {
    console.log("*** error: ", e.message);
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
};

//======= POST /api/category/
exports.write = async (req, res) => {
  try {
    const { _id: _userId } = req.user;
    const schema = Joi.object().keys({
      category: Joi.string().required()
    });
    //유효성 검증
    const result = Joi.validate(req.body, schema);
    if (result.error) {
      return res.status(400);
    }
    //입력 객체 생성
    const category = new Category({
      category: req.body.category,
      _userId: _userId
    });
    await category.save();
    res.json(category);
  } catch (e) {
    console.log("*** Error(POST /api/category/)", e.message);
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
};

//======= PATCH /api/category/:categoryId
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;
    const query = { _id: id, _userId: userId };
    const category = await Category.findOneAndUpdate(query, req.body, {
      new: true
    }).exec();

    if (!category) {
      return res.status(400);
    }

    res.json(category);
  } catch (e) {
    console.log("*** Error(PATCH /api/category/:categoryId): ", e.message);
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
};

//======= DELETE /api/category/:categoryId
exports.remove = async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user;
  const query = { _id: id, _userId: userId };
  try {
    await Category.findOneAndRemove(query).exec();
    res.json({ id });
  } catch (e) {
    console.log(
      "*** Error(DELETE /api/category/:categoryId): \n ***",
      e.message
    );
    res.status(500).json({
      error: true,
      message: e.message
    });
  }
};

//카테고리 선택
//======= patch /api/category/select/:id
exports.selectCategory = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const { User } = mongoose.models;
    const { id: categoryId } = req.params;
    const { _id: userId } = req.user;
    const query = { _id: userId };
    const data = {
      _selectedCategory: categoryId
    };
    const user = await User.findOneAndUpdate(query, data).exec();
    if (!user) {
      return req.status(404);
    }
    res.json(data._selectedCategory);
  } catch (e) {
    ErrorThrow(res, e, 500, "카테고리 선택 에러");
  }
};
