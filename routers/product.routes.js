import express, { Router } from 'express';
import multer from 'multer';
import {
    getAllProducts,
    getProductByBarcode,
    createPorduct,
    updateProduct   
} from '../controllers/product.controller.js'

const router = Router();

const mainUrl = '/api/product/'

router.get(mainUrl,getAllProducts);
router.get(`${mainUrl}barcode/:barcode`,getProductByBarcode);
router.post(`${mainUrl}`, express.json(), multer().any(), createPorduct);
router.put(`${mainUrl}:productId`, express.json(), multer().any(), updateProduct);

export default router;