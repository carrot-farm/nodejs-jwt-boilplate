import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

// ===== 환경 변수
const env = process.env.NODE_ENV;

const appMiddleware = (app, mysql) => {
  // # express 용 body paser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // mysql 커넥션 풀
  // app.use(mysql);

  // # cors 설정
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["POST", "GET", "DELETE", "OPTIONS", "PATCH"]
  };
  app.use(cors(corsOptions));

  // ===== 개발 환경시만 사용
  if ( env === 'development' ) {
    // # api 응답 로그
    app.use(morgan("dev"));
  }
};

export default appMiddleware;
