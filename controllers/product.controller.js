import { getConnection } from "../database/dbconfig.js";

const getAllProducts = async (_, res) => {
    let pool = await getConnection();
    let products = await pool.query(`
        select * from 
        inventory.products
    `);
    res.json(products.recordset);
}

const getProductByBarcode = async (req, res) => {
    const { barcode } = req.params;
    let pool = await getConnection();
    let products = await pool.query(`
        select * from inventory.products 
        where productBarCode = '${barcode}'
    `);
    if (!products.recordset[0]) {
        res.status(404).json({
            msg: 'Articulo no encontrado',
            error: 404
        });
        return;
    }
    res.status(200).json(products.recordset[0]);
}

const createPorduct = async (req, res) => {

    const {
        barCode,
        name,
        price,
        cost,
        suplierId, //TODO: crear el suplidor
        familyId,
        linkUrl,
        categoryId,
        status,
        description
    } = req.body;

    try {
        let pool = await getConnection();

        let hasRepeatBarcode = await pool.query(`
            select * from inventory.products
            where productBarcode = '${barCode}'
        `)
        console.log(hasRepeatBarcode.recordset);
        if (hasRepeatBarcode.recordset.length > 0) {
            res.status(405).json({
                msg: 'El codigo de barra ya existe',
                error: 405
            })
            return;
        }

        await pool.query(`
            insert into inventory.products(
                productName
                ,productBarCode
                ,productDetail
                ,productPrice
                ,productCost
                ,productFamily
                ,productCategory
                ,productStatusId
                ,linkURL
            )
            values (
                 '${name}'
                ,'${barCode}'
                ,'${description}'
                , ${price}
                , ${cost}
                , ${familyId}
                , ${categoryId}
                , ${status}
                ,'${linkUrl}'
            )
         `);


        let { recordset } = await pool.query(`
            select * from inventory.products
            where productBarcode = '${barCode}'
        `);

        res.status(200).json(recordset[0]);

    } catch (error) {
        res.status(401).json({
            msg: error.message,
            error: 401
        })
    }
}

const updateProduct = async (req, res) => {

    const {
        barCode,
        name,
        price,
        cost,
        suplierId, //TODO: crear el suplidor
        familyId,
        categoryId,
        status,
        linkUrl,
        description
    } = req.body;

    const { productId } = req.params;

    try {
        let pool = await getConnection();

        await pool.query(`
            update inventory.products
            set
                 productName = '${name}'
                ,productBarCode = '${barCode}'
                ,productDetail = '${description}'
                ,productPrice = ${price}
                ,productCost = ${cost}
                ,productFamily = ${familyId}
                ,productCategory = ${categoryId}
                ,productStatusId = ${status}
                ,linkURL = ${linkUrl}
            where productId = ${productId}
         `);


        res.status(201).json({});

    } catch (error) {
        res.status(401).json({
            msg: error.message,
            error: 401
        })
    }
}

export {
    getAllProducts,
    getProductByBarcode,
    createPorduct,
    updateProduct
}