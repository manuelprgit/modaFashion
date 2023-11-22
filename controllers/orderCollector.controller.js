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

    let {
        collectionId,
        totalAmount,
        ordersCollectedDetails
    } = req.body
    let pool = await getConnection();

    let orderCollectedId = await pool.query(`

        insert into invoice.orderCollection(
            totalAmount,
            collectionDate,
            orderStatusId
        )
        values(
            ${totalAmount},
            getdate(),
            1
        )

        DECLARE @invoicesOrdes INT;
        SET @invoicesOrdes = SCOPE_IDENTITY();
        select @invoicesOrdes as invoicesOrdes

    `);

    orderCollectedId = orderCollectedId.recordset[0].invoicesOrdes;

    for(let ordersCollected of ordersCollectedDetails){

        let {recordset} = await pool.query(`
            select * from invoice.orders
            where orderId = ${ordersCollected.orderId}
        `);

        let order = recordset[0];

        await pool.query(`
            insert into invoice.orderCollectionDetail(
                collectionId,
                orderId,
                orderAmount
            )values(
                ${orderCollectedId},
                ${order.orderId},
                ${order.amount}
            )
        `)
    }

    res.status(201).json({
        status: 201,
        msg: 'Se ha creado el pedido exitosamente',
        data: {'orderCollectedId':orderCollectedId}
    })

}
const updateOrderCollected = async (req, res) => {

    let {
        totalAmount,
        ordersCollectedDetails
    } = req.body;

    let collectionId = req.params.collectionId;
    
    let pool = await getConnection();

    await pool.query(`

        update invoice.orderCollection set
        totalAmount = ${totalAmount}
        where collectionId = ${collectionId}

        delete from invoice.orderCollectionDetail
        where collectionId = ${collectionId}
    `); 

    for(let ordersCollected of ordersCollectedDetails){

        let {recordset} = await pool.query(`
            select * from invoice.orders
            where orderId = ${ordersCollected.orderId}
        `);

        let order = recordset[0];

        await pool.query(`
            insert into invoice.orderCollectionDetail(
                collectionId,
                orderId,
                orderAmount
            )values(
                ${collectionId},
                ${order.orderId},
                ${order.amount}
            )
        `)
    }

    res.status(204).json({})

}

export {
    getOrderCollected,
    getOrderCollectedById,
    createOrderCollected,
    updateOrderCollected
}