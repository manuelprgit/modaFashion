import express, { Router } from 'express';

import {
    getAccountReceivable,
    getInvoicesWithPendingBills
} from '../controllers/accountReceivable.controller.js';

const router = Router();

const mainUrl = '/api/receivable/';

router.get(`${mainUrl}`, getAccountReceivable); 
router.get(`${mainUrl}invoices`, getInvoicesWithPendingBills); 

export default router;