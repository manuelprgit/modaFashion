import express, { Router } from 'express';

import {
    getAccountReceivable
} from '../controllers/accountReceivable.controller.js';

const router = Router();

const mainUrl = '/api/receivable/';

router.get(`${mainUrl}`, getAccountReceivable); 

export default router;