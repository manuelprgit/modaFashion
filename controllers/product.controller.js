import { getConnection } from "../database/dbconfig.js";

const getAllProducts = async (_, res) => {
    let pool = await getConnection();
    let products = await pool.query(`
        select 
            a.productId,
            a.productName,
            a.productBarCode,
            a.productDetail,
            a.productPrice,
            a.productCost,
            a.productCategory,
            a.productFamily,
            a.productStatusId,
            d.statusDescription,
            isnull(a.supplierId,0) supplierId,
            isnull(c.supplierName,'N/A') supplierName,
            isnull(a.linkURL,'Pendiente') linkURL,
            isnull(b.quantity,0) quantity
        from inventory.products a
        left join inventory.existence b
        on a.productId = b.productId
        left join purchase.suppliers c
        on a.supplierId = c.supplierId
        left join inventory.productStatus d
        on a.productStatusId = d.statusId
    `);
    res.json(products.recordset);
}

const getProductByBarcode = async (req, res) => {
    const { barcode } = req.params;
    let pool = await getConnection();
    let products = await pool.query(`
        select 
            a.productId,
            a.productName,
            a.productBarCode,
            a.productDetail,
            a.productPrice,
            a.productCost,
            a.productCategory,
            a.productFamily,
            a.productStatusId,
            d.statusDescription,
            isnull(a.supplierId,0) supplierId,
            isnull(c.supplierName,'N/A') supplierName,
            isnull(a.linkURL,'Pendiente') linkURL,
            isnull(b.quantity,0) quantity
        from inventory.products a
        left join inventory.existence b
        on a.productId = b.productId
        left join purchase.suppliers c
        on a.supplierId = c.supplierId
        left join inventory.productStatus d
        on a.productStatusId = d.statusId
        where a.productBarCode = '${barcode}'
    `);
    if (!products.recordset[0]) {
        res.status(400).json({
            msg: 'Articulo no encontrado',
            error: 40
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
                ,linkURL = '${linkUrl}'
            where productId = ${productId}
         `);


        res.status(201).json({});

    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: error.message,
            error: 401
        })
    }
}
//TODO: hacer una lista para ver los articulos: estatus, cantidad, descripcion (con el link), etc...
const inventoryConsult = async (req, res)=> {
    const pool = await getConnection();
    let getInventory = await pool.query(`
        select 
            a.productId,
            a.productName,
            a.productBarCode,
            a.productDetail,
            a.productPrice,
            a.productCost,
            a.productFamily,
            a.productStatusId,
            d.statusDescription,
            isnull(a.supplierId,0) supplierId,
            isnull(c.supplierName,'N/A') supplierName,
            isnull(a.linkURL,'Pendiente') linkURL,
            isnull(b.quantity,0) quantity
        from inventory.products a
        left join inventory.existence b
        on a.productId = b.productId
        left join purchase.suppliers c
        on a.supplierId = c.supplierId
        left join inventory.productStatus d
        on a.productStatusId = d.statusId
    `);
    getInventory = getInventory.recordset;

    res.json(getInventory);

}


export {
    getAllProducts,
    getProductByBarcode,
    createPorduct,
    updateProduct,
    inventoryConsult
}