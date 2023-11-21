import express, { Router } from 'express';

import {
    getOrderCollected, 
    getOrderCollectedById, 
    createOrderCollected,
} from '../controllers/orderCollector.controller.js';

const router = Router();

const mainUrl = '/api/ordersCollector/';

router.get(`${mainUrl}`, getOrderCollected);
router.get(`${mainUrl}:collectionId`, getOrderCollectedById);
router.post(`${mainUrl}`, express.json(), createOrderCollected);
// router.get(`${mainUrl}status`, getOrderStatus);
// router.get(`${mainUrl}:orderId`, getOrdersById);
// router.post(`${mainUrl}post`, express.json(), postOrder);
// router.post(`${mainUrl}reject`, express.json(), rejectOrder);
// router.post(`${mainUrl}recieve`, express.json(), recieveOrder);
// router.post(`${mainUrl}given`, express.json(), giveOrder);
// router.put(`${mainUrl}:orderId`, express.json(), updateOrders); 

export default router;