import { getConnection } from "../database/dbconfig.js";

const getOrderCollected = async (req, res) => {

    let pool = await getConnection();

    let ordersCollected = await pool.query(`
        select * from invoice.orderCollection
    `)

    let ordersDetailsList = [];

    ordersCollected = ordersCollected.recordset;

    for (let ordersCollect of ordersCollected) {

        let getOrderCollect = await pool.query(`
            select 
                collectionId,
                totalAmount,
                collectionDate date,
                orderStatusId
            from invoice.orderCollection
            where collectionId = ${ordersCollect.collectionId}
        `);
        //*Cabecera
        getOrderCollect = getOrderCollect.recordset[0];

        //*Detalle
        let ordersCollectedDetails = await pool.query(`
            select * from invoice.orderCollectionDetail
            where collectionid = ${getOrderCollect.collectionId}
        `);

        ordersCollectedDetails = ordersCollectedDetails.recordset;
        getOrderCollect['ordersCollectedDetails'] = ordersCollectedDetails;

        ordersDetailsList.push(getOrderCollect);
    }

    res.json(ordersDetailsList);
}

const getOrderCollectedById = async (req, res) => {

    let { collectionId } = req.params;

    let pool = await getConnection();

    let getOrderCollect = await pool.query(`
            select 
                collectionId,
                totalAmount,
                collectionDate date,
                orderStatusId
            from invoice.orderCollection
            where collectionId = ${collectionId}
        `);
    //*Cabecera
    getOrderCollect = getOrderCollect.recordset[0];

    //*Detalle
    let ordersCollectedDetails = await pool.query(`
            select * from invoice.orderCollectionDetail
            where collectionid = ${getOrderCollect.collectionId}
        `);

    ordersCollectedDetails = ordersCollectedDetails.recordset;
    getOrderCollect['ordersCollectedDetails'] = ordersCollectedDetails;

    res.json(getOrderCollect);
}

const createOrderCollected = async (req, res) => {

}
const updateOrderCollected = async (req, res) => {

}




export {
    getOrderCollected,
    getOrderCollectedById,
    createOrderCollected,
    updateOrderCollected
}