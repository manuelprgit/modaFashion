import express, { Router } from 'express';

import {
    getOrders,
    getOrdersById,
    createOrders,
    updateOrders,
    getOrderStatus,
    postOrder,
    rejectOrder
} from '../controllers/orders.controller.js';

const router = Router();

const mainUrl = '/api/orders/';

router.get(`${mainUrl}`, getOrders);
router.get(`${mainUrl}status`, getOrderStatus);
router.get(`${mainUrl}:orderId`, getOrdersById);
router.post(`${mainUrl}`, express.json(), createOrders);
router.post(`${mainUrl}post`, express.json(), postOrder);
router.post(`${mainUrl}reject`, express.json(), rejectOrder);
router.put(`${mainUrl}:orderId`, express.json(), updateOrders);

export default router;