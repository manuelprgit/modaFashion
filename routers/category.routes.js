import express, { Router } from 'express';

import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateeCategory
} from '../controllers/category.controller.js'

const router = Router();

const mainUrl = '/api/category/'

router.get(mainUrl, getAllCategories);
router.get(`${mainUrl}:categoryId`, getCategoryById);
router.post(mainUrl, express.json(), createCategory);
router.put(`${mainUrl}:categoryId`,express.json() , updateeCategory);


export default router;