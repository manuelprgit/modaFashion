import express, { Router } from 'express';

import {
    createInvoice
} from '../controllers/invoice.controller.js';

const router = Router();

const mainUrl = '/api/invoice/';
;
router.post(`${mainUrl}`, express.json(),createInvoice);


export default router;