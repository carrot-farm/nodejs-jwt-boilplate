import axios from 'axios';
const assert = require('assert');

// ===== 개발용 환경 변수 가져오기
require('dotenv').config({ path: `./config/.env_${process.env.NODE_ENV}` });

// ===== 환경 변수
const {
  HOST: host
} = process.env;

// ===== 테스트
describe('## 테스트', () => {
  describe('* 기본 테스트', () => {
    it('re', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });

    it('ajax test', async () => {
      const res = await axios.get(`${host}/api/test`);
      assert.equal(res.data, 'Hello World');
    });
  });
});