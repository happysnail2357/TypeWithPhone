import { Router } from 'express';
import * as controller from './register.controller.js';

const router = Router();

router.get('/', controller.register);

export default router;
