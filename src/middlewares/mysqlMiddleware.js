import mysql from "mysql2/promise";

class Mysql {
  tableName = "";
  where = "";
  field = "*";
  mysqlData = "";
  type = "SELECT";
  mysqlSkip = "";
  mysqlLimit = "";
  stTransaction = false; // 트렌젝션 시작
  transactioning = false; // 트렌젝션 사용중
  edTransaction = false; // 트렌젝션 종료 후 커밋
  useUnRelease = false; // 커넥션 끊을 지 말지 여부
  connection = null; // 커넥션
  useDebuging = false; // 디버깅

  // 생성자
  constructor(pool) {
    this.pool = pool;
  }

  // 테이블 셋팅
  table(tableName, type) {
    // console.log("\n*** run table", tableName, type);
    // 이전에 endTransion을 호출 하거나 unReleaseConnection 단독 사용시 clearAll
    if (this.edTransaction === true) {
      // console.log("> mysql clear all");
      this.clearAll();
    } else {
      // console.log("> mysql clear ");
      this.clear();
    }

    this.tableName = tableName;
    this.type = type.toUpperCase();
    return this;
  }

  // find
  find(_query) {
    let i = 0;
    for (let key in _query) {
      if (i > 0) {
        this.where += " AND ";
      }
      this.where += `${key}=${mysql.escape(_query[key])}`;
      i++;
    }
    return this;
  }

  // count
  count() {
    this.type = "COUNT";
    return this;
  }

  // field 셋팅
  select(_field) {
    this.field = _field;
    return this;
  }

  // 입력 혹은 업데이트 데이타
  data(_data) {
    let i = 0;
    let keys = "";
    let values = "";
    if (this.type === "INSERT") {
      for (let key in _data) {
        if (i <= 0) {
          keys += " (";
          values += " (";
        } else {
          keys += ", ";
          values += ", ";
        }
        keys += `${key}`;
        values += `${mysql.escape(_data[key])}`;
        i++;
      }
      keys += ")";
      values += ")";
      this.mysqlData += `${keys} VALUES ${values}`;
    } else if (this.type === "UPDATE") {
      for (let key in _data) {
        if (i > 0) {
          this.mysqlData += ", ";
        }
        this.mysqlData += `${key}=${mysql.escape(_data[key])}`;
        i++;
      }
    }
    return this;
  }

  // limit
  limit(num) {
    this.mysqlLimit = Number(num);
    return this;
  }

  // skip
  skip(num) {
    this.mysqlSkip = Number(num);
    return this;
  }

  // 트랜젝션 사용
  startTransaction() {
    this.stTransaction = true;
    this.transactioning = true;
    this.startUnRelease();
    return this;
  }

  // 트랜젝션 사용
  endTransaction() {
    this.edTransaction = true;
    this.endUnRelease();
    return this;
  }

  // 커넥셕을 반환 안하기 시작
  startUnRelease() {
    // console.log("> startUnRelease");
    this.useUnRelease = true;
    return this;
  }

  // 커넥션을 반환.
  endUnRelease() {
    // console.log("> endUnRelease");
    this.useUnRelease = false;
    return this;
  }

  // select, delete
  exec() {
    let queryString = "";

    if (this.type === "SELECT") {
      queryString += `SELECT ${this.field} FROM ${this.tableName} `;
    } else if (this.type === "DELETE") {
      queryString += `DELETE FROM ${this.tableName} `;
    } else if (this.type === "COUNT") {
      queryString += `SELECT COUNT(*) AS cnt FROM ${this.tableName} `;
    }
    queryString += this.mergeQuery();
    return this.runQuery(queryString);
  }

  // insert, update
  save() {
    let queryString = "";
    if (this.type === "INSERT") {
      queryString += `INSERT INTO ${this.tableName} ${this.mysqlData} `;
    } else if (this.type === "UPDATE") {
      queryString += `UPDATE ${this.tableName} SET ${this.mysqlData}  `;
      queryString += this.mergeQuery();
    }
    return this.runQuery(queryString);
  }

  // 쿼리를 합치기.
  mergeQuery() {
    let queryString = "";
    if (this.where) {
      queryString += `WHERE ${this.where} `;
    }
    if (this.mysqlLimit !== "") {
      queryString += `LIMIT ${this.mysqlLimit} `;
    }
    if (this.mysqlSkip !== "") {
      if (this.mysqlLimit) {
        queryString += `OFFSET ${this.mysqlSkip} `;
      } else {
        queryString += `LIMIT ${this.mysqlSkip}, 1 `;
      }
    }
    return queryString;
  }

  // 지역 변수 초기화
  clear() {
    this.tableName = "";
    this.where = "";
    this.field = "*";
    this.mysqlData = "";
    this.type = "SELECT";
    this.mysqlSkip = "";
    this.mysqlLimit = "";
    this.stTransaction = false;
    this.useDebuging = false;
  }

  // 지역변수 전체 초기화
  clearAll() {
    this.tableName = "";
    this.where = "";
    this.field = "*";
    this.mysqlData = "";
    this.type = "SELECT";
    this.mysqlSkip = "";
    this.mysqlLimit = "";
    this.stTransaction = false;
    this.transactioning = false;
    this.edTransaction = false;
    this.useUnRelease = false;
    this.connection = null;
    this.useDebuging = false;
  }

  // 쿼리
  async runQuery(_query) {
    if (this.useDebuging) {
      console.log("> runQquery:\n", _query + "\n");
    }
    const result = await this.query(_query, {
      startTransaction: this.stTransaction,
      transactioning: this.transactioning,
      endTransaction: this.edTransaction,
      useUnRelease: this.useUnRelease
    });

    return result;
  }

  // 쿼리 실행
  query(_query, _options) {
    let options = {
      startTransaction: false, // true 일 경우 트랜젝션 시작
      transactioning: false, // true 일 경우 트렌젝션 사용중
      endTransaction: false, // true 일 경우 커밋
      useUnRelease: false, // true 일 경우 커넥션을 반환 안함.
      ..._options
    };
    // console.log("> options: ", options);

    let {
      startTransaction,
      transactioning,
      endTransaction,
      useUnRelease
    } = options;

    return new Promise(async (resolve, reject) => {
      try {
        // get connection
        if (this.connection === null) {
          // console.log("> get connection");
          this.connection = await this.pool.getConnection(async conn => conn);
        }

        // 트렌젝션 시작
        if (startTransaction) {
          transactioning = true;
          await this.connection.beginTransaction();
        }

        // 쿼리
        const [result] = await this.connection.query(_query);
        // console.log("> result", result);

        // 트렌젝션 사용시 커밋
        if (endTransaction) {
          // console.log("> endTransaction");
          await this.connection.commit();
        }

        // 커넥션 반환
        if (useUnRelease === false) {
          // console.log("> connection release");
          this.connection.release();
          this.connection = null;
        }

        resolve(result);
      } catch (e) {
        console.log("*** mysqlMiddleware.query", e);
        this.releaseAndRollback();
        reject(e);
      }
    });
  }

  // 에러시 release or rollback
  releaseAndRollback() {
    // console.log("> releaseAndRollback");
    if (this.connection) {
      if (this.transactioning) {
        // console.log("> connection rollback");
        this.connection.rollback();
      }
      // console.log("> connection release");
      this.connection.release();
      this.connection = null;
    }
  }

  // 디버깅
  debug() {
    this.useDebuging = true;
  }
}

export default (req, res, next) => {
  req.mysql = new Mysql(req.mysqlPool);
  return next();
};
