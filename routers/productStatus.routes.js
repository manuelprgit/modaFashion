import express, { Router } from 'express';

import {
    getAllStatus,
    getproductStatusById
} from '../controllers/productStatus.controller.js'

const router = Router();

const mainUrl = '/api/productstatus/'

router.get(mainUrl,getAllStatus);
router.get(`${mainUrl}:statusId`,getproductStatusById);

export default router;