import express from 'express';
import controllers from '../controllers/controllers';
const router = express.Router();

router.post('/auth', controllers.login);
router.post('/change-password', controllers.changePassword);
router.get('/items', controllers.getItems);
router.post('/purchase', controllers.purchaseItems);

export default router;