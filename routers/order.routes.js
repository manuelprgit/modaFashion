import express, { Router } from 'express';

import {
    createOrders
} from '../controllers/orders.controller.js';

const router = Router();

const mainUrl = '/api/orders/';
;
router.post(`${mainUrl}`, express.json(),createOrders);

export default router;