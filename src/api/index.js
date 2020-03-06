import { Router } from 'express';

// import oauth from './oauth';

const router = new Router();

// router.use('./oauth', oauth);

router.get('/test', (req, res) => {
  res.send('Hello World');
})

export default router;