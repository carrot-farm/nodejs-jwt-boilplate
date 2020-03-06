import curtomError from 'utils/curtomError';

// ===== helloWorld
export const helloWorld = (req, res) => {
  res.send('Hello World');
};

// ===== post 요청 실패
export const failedPost = (req, res) => {
  if(req.body.hello !== 'world') {
    return res.status(400).json(
      curtomError({
        error: 'MISMATCH',
        message: 'hello의 값이 일치하지 않거나 존재하지 않습니다.'
      })
    );
  }

  res.send('success')
}
