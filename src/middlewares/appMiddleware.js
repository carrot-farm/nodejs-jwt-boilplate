import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";

const { SESSION_SECRET: sessionSecret } = process.env;

const appMiddleware = (app, mysql) => {
  // express 용 body paser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // carrot-todo 용 session 나중에 jwt로 변경하자.
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: true
    })
  );

  // mysql 커넥션 풀
  // app.use(mysql);

  // api 응답 로그
  app.use(morgan("dev"));

  // cors 설정
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["POST", "GET", "DELETE", "OPTIONS", "PATCH"]
  };
  app.use(cors(corsOptions));
};

export default appMiddleware;
