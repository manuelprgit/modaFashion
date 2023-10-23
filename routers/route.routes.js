import { Router } from "express";

import Product from './product.routes.js';
import Category from './category.routes.js';
import Family from './family.routes.js';
import productStatus from './productStatus.routes.js';
import Customer from './customer.routes.js';
import Supplier from './supplier.routes.js';
import Seller from './seller.routes.js';

import Invoice from './invoice.routes.js';

const mainRoutes = Router();

mainRoutes.use(Product);
mainRoutes.use(Category);
mainRoutes.use(Family);
mainRoutes.use(productStatus);
mainRoutes.use(Customer);
mainRoutes.use(Supplier);
mainRoutes.use(Seller);

mainRoutes.use(Invoice);

export default mainRoutes;