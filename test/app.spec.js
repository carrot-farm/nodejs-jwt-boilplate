const axios = require('axios');
const expect = require('expect');
const request = require('supertest');

// ===== 개발용 환경 변수 가져오기
require('dotenv').config({ path: `./env/.env_${process.env.NODE_ENV}` });

// ===== 환경 변수
const { HOST: host } = process.env; // host 정보

// ===== 기본 테스트
describe('기본 테스트', () => {
  it('배열 index 확인', () => {
    expect([1, 2, 3].indexOf(4)).toEqual(-1);
  });
})

// ===== GET /test
describe('GET /test', () => {
  // * 성공
  describe('* 성공', () => {
    it('Hello World 반환', async () => {
      const res = await axios.get(`${host}/api/test`);
      expect(res)
      .toMatch({ status: 200 })
      .toMatch({ data: 'Hello World' });
    });
  })
});

// ===== POST /test
describe('POST /test', () => {
  describe('* 성공', () => {
    it('post 전송 성공', async () => {
      const res = await axios.post(`${host}/api/test`, { hello: 'world' });
      expect(res)
      .toMatch({ status: 200 })
      .toMatch({ data: 'success' });
    }); 
  });

  describe('* 실패', () => {
    it('파라메터가 없거나 일치 하지 않음.', async () => {
      try {
        await axios.post(`${host}/api/test`, { hello: '' });
      } catch (e) {
        expect(e.response)
        .toMatch({ status: 400 })
        .toMatch({ data: { error: 'MISMATCH' } });
      }
    });
  });
});
