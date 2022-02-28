import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  res.send('Resources');
});

export default router;
