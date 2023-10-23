import express, { Router } from 'express';
import multer from 'multer';

import {
    getAllSalesman,
    getSellerById,
    createSalesman,
    updateSalesman
} from '../controllers/saller.controller.js'

const router = Router();

const mainUrl = '/api/sellers/'

router.get(mainUrl, getAllSalesman);
router.get(`${mainUrl}:idSeller`, getSellerById);
router.post(mainUrl, express.json(), multer().any(), createSalesman);
router.put(`${mainUrl}:idSeller`, express.json(), multer().any(), updateSalesman);

export default router;