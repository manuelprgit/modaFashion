import express, { Router } from 'express';
import multer from 'multer';

import {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer
} from '../controllers/customer.controller.js'

const router = Router();

const mainUrl = '/api/customer/'

router.get(mainUrl, getAllCustomers);
router.get(`${mainUrl}:customerId`, getCustomerById);
router.post(mainUrl, express.json(), multer().any(), createCustomer);
router.put(`${mainUrl}:idCustomer`, express.json(), multer().any(), updateCustomer);

export default router;