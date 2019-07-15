import mysql from "mysql2/promise";

// 설정 값들
const env = process.env;
const dbConfig = {
  host: env.MYSQL_HOST,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  port: env.MYSQL_PORT,
  database: env.MYSQL_DB,
  waitForConnections: !env.MYSQL_WAIT_FOR_CONNECTIONS, // 풀에 여유가 없을 경우 대기 여부
  connectionLimit: env.MYSQL_CONNECTION_LIMIT // 최대 커넥션 수
};

// ===== 커넥션 풀 생성
const pool = mysql.createPool(dbConfig);
console.log("connected mysql");

export default (req, res, next) => {
  // 커넥션 풀 생성
  req.mysqlPool = pool;

  return next();
};
