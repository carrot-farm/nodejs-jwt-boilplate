import { Router } from 'express';
import { helloWorld, failedPost } from './test.ctrl';

const router = new Router();

router.get('/', helloWorld);
router.post('/', failedPost)



export default router;