import express, { Router } from 'express';

import {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier
} from '../controllers/supplier.controller.js';

const router = Router();

const mainUrl = '/api/suppliers/'

router.get(mainUrl, getSuppliers);
router.get(`${mainUrl}:supplierId`, getSupplierById);
router.post(mainUrl, express.json(), createSupplier);
router.put(`${mainUrl}:idCustomer`, express.json(), updateSupplier);

export default router;