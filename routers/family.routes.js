import express, { Router } from 'express';

import {
    getAllFamilies,
    getFamilyById
} from '../controllers/family.controller.js'

const router = Router();

const mainUrl = '/api/family/'

router.get(mainUrl,getAllFamilies);
router.get(`${mainUrl}:familyId`,getFamilyById);

export default router;