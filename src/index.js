import '@babel/polyfill';
import path from 'path';
import Express from "express";

// ===== dotenv 적용
require('dotenv').config({ 
  path: `./env/.env_${process.env.NODE_ENV}` 
});

// ===== appRoot 지정
global.appRoot = path.resolve(__dirname);

// import mongoose from "./config/mongoose";
// import mysql from "./config/mysql";
import appMiddleware from "./middlewares/appMiddleware";
import api from "./api";
import staticRouter from "./router";



const { PORT: port } = process.env;
const app = Express();

let isDisableKeepAlive = false; // keep-alive 비활성화 플래그.
// mongodb 접속
// mongoose();

// 미들웨어 적용
// appMiddleware(app, mysql);
appMiddleware(app);

// api 라우팅
app.use("/api", api);

// static 파일 라우팅
app.use("/", staticRouter);

// passport
// passportMiddleware(app);

const server = app.listen(port, () => {
  if(process.send) { // IPC채널 적용시에만 생성.
    process.send('ready'); // ready 이벤트 발생으로 새로운 프로세스로 교체한다.
  }
  console.log(`> server listen ${port}`);
});

// ===== SIGINT 이벤트 리스닝
process.on('SIGINT', () => {
  // # keep-alive 비활성화
  isDisableKeepAlive = true;

  // # 새로운 요청을 받기 않게 앱 종료
  server.close(function() {
    console.log('server closed');
    process.exit(0); //
  });
});

export default server;
