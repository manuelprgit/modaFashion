import express, { Router } from 'express';
import multer from 'multer';
import {
    getAllProducts,
    getProductByBarcode,
    createPorduct,
    updateProduct,
    inventoryConsult
} from '../controllers/product.controller.js'

const router = Router();

const mainUrl = '/api/product/'

router.get(mainUrl,getAllProducts);
router.get(`${mainUrl}barcode/:barcode`,getProductByBarcode);
router.get(`${mainUrl}inventory`,inventoryConsult);
router.post(`${mainUrl}`, express.json(), multer().any(), createPorduct);
router.put(`${mainUrl}:productId`, express.json(), multer().any(), updateProduct);

export default router;