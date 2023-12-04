import express, { Router } from 'express';

import {
    getOrderCollected, 
    getOrderCollectedById, 
    createOrderCollected,
    updateOrderCollected,
    postOrderCollected,
    receiveOrderCollected
} from '../controllers/orderCollector.controller.js';

const router = Router();

const mainUrl = '/api/ordersCollector/';

router.get(`${mainUrl}`, getOrderCollected);
router.get(`${mainUrl}:collectionId`, getOrderCollectedById);
router.post(`${mainUrl}`, express.json(), createOrderCollected);
router.put(`${mainUrl}:collectionId`, express.json(), updateOrderCollected);
router.post(`${mainUrl}postOrderCollected`, express.json(), postOrderCollected);
router.post(`${mainUrl}recieveOrderCollected`, express.json(), receiveOrderCollected);

export default router;
