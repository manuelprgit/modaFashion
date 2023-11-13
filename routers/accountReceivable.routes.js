import express, { Router } from 'express';

import {
    getAccountReceivable,
    getInvoicesWithPendingBills,
    billPayment
} from '../controllers/accountReceivable.controller.js';

const router = Router();

const mainUrl = '/api/receivable/';

router.get(`${mainUrl}`, getAccountReceivable); 
router.get(`${mainUrl}invoices/:customerId`, getInvoicesWithPendingBills); 
router.post(`${mainUrl}`, express.json(), billPayment);


export default router;