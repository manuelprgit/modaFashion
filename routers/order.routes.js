import express, { Router } from 'express';

import {
    getOrders,
    getOrdersById,
    createOrders,
    // updateOrders
} from '../controllers/orders.controller.js';

const router = Router();

const mainUrl = '/api/orders/';

router.get(`${mainUrl}`, getOrders);
router.get(`${mainUrl}:orderId`, getOrdersById);
router.post(`${mainUrl}`, express.json(), createOrders);
// router.post(`${mainUrl}:orderId`, express.json(), updateOrders);

export default router;