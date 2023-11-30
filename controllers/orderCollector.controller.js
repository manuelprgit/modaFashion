import { getConnection } from "../database/dbconfig.js";

const getOrderCollected = async (_, res) => {

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
            select 
                a.collectionDetailId,
                a.collectionId,
                b.orderId,
                a.orderAmount,
                c.idCustomer,
                c.nameCustomer,
                d.total,
                d.totalProducts
            from invoice.orderCollectionDetail a
            left join invoice.orders b
            on a.orderId = b.orderId
            left join invoice.customers c
            on b.customerId = c.idCustomer
            left join (
            select 
                a.orderId,
                sum(total) total,
                sum(productQuantity) totalProducts 
            from invoice.orderDetails a
            left join invoice.orderCollectionDetail b
            on a.orderId = b.orderId
            where b.collectionId = ${getOrderCollect.collectionId}
            group by a.orderId
            ) d
            on b.orderId = d.orderId
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

    for (let ordersCollected of ordersCollectedDetails) {

        let { recordset } = await pool.query(`
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
        data: { 'orderCollectedId': orderCollectedId }
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

    for (let ordersCollected of ordersCollectedDetails) {

        let { recordset } = await pool.query(`
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

const postOrderCollected = async (req, res) => {

    let { orderCollectId } = req.body;

    let pool = await getConnection();

    let { recordset } = await pool.query(`
        select * from invoice.orderCollectionDetail
        where collectionId = ${orderCollectId}
    `);

    let ordersCollectedDetails = recordset;

    for (let order of ordersCollectedDetails) {

        let { recordset } = await pool.query(`
            select * from invoice.orders
            where orderId = ${order.orderId}
        `);

        let currentOrder = recordset[0];

        if (currentOrder.orderStatusId != 1) {
            res.status(400).json({
                msg: `El documento ${currentOrder.orderId} ya no puede ser modificado`,
                status: 400
            });
            return;
        };

        await pool.query(`
            insert into invoice.accountsReceivable (
                customerId,
                documentId,
                amount,
                dueDate,
                accountStatus,
                paymentDate,
                paymentTypeId,
                notes
            )
                select 
                b.idCustomer,
                a.orderId,
                a.amount,
                GETDATE()+30 dueDate, 
                'Pendiente' accountStatus,
                GETDATE() paymentDate,
                1 paymentTypeId,
                'Orden de shein' notes
            from invoice.orders a
            left join invoice.customers b
            on a.customerId = b.idCustomer
            where a.orderId = ${order.orderId}
        `);

        await pool.query(`
            update invoice.orders
            set orderStatusId = 2
            where orderId = ${order.orderId}
        `);
    }

    await pool.query(`
        update invoice.orderCollection
        set orderStatusId = 2
        where collectionId = ${orderCollectId}
    `);

    res.status(200).json({
        msg: "El pedido fue posteado con exito",
        status: 200,
        data: orderCollectId
    });

}

const receiveOrderCollected = async (req,res) => {

    let { orderCollectId } = req.body;

    let pool = await getConnection();

    try {
        let orderList = await pool.query(`
        select * from invoice.orderCollectionDetail
        where collectionId = ${orderCollectId}
        `);

        orderList = orderList.recordset;

        for (let orders of orderList) {

            let documentId = orders.orderId

            let { recordset } = await pool.query(`
                select * from invoice.orders
                where orderId = ${documentId}
            `);
            let order = recordset[0]
            if (order == undefined) {
                res.status(400).json({
                    msg: "La orden no existe",
                    status: 400
                });
                return;
            }

            if (order.orderStatusId != 2) {
                res.status(400).json({
                    msg: "La orden debe de estar con el estatus PEDIDO",
                    status: 400
                });
                return;
            }

            let getOrderDetail = await pool.query(`
                select * from invoice.orderDetails
                where orderId = ${documentId}
            `);

            getOrderDetail = getOrderDetail.recordset;

            for (let product of getOrderDetail) {

                let articleExis = await pool.query(`
                    select * from inventory.existence 
                    where productId = ${product.productId}
                `);

                if (articleExis.recordset.length == 0) {

                    await pool.query(`
                        insert into inventory.existence
                        select 
                            productId,
                            productQuantity,
                            1 storeId
                        from invoice.orderDetails
                        where orderId = ${documentId} 
                        and productId = ${product.productId}
                    `);

                } else {
                    await pool.query(` 
                        update inventory.existence
                        set quantity = quantity + ${product.productQuantity}
                        where productId = ${product.productId}
                    `);
                }
            }
            //Cambio de estatus a RECIBIDO
            await pool.query(`
                update invoice.orders
                set orderStatusId = 3
                where orderId = ${orders.orderId}
            `);

        }

        res.status(201).json({
            msg: "Las ordenes del pedido fueron recibidas con éxito",
            status: 201,
            data: orderCollectId
        });
    }
    catch (error) {
        console.log(error);
    }


}

export {
    getOrderCollected,
    getOrderCollectedById,
    createOrderCollected,
    updateOrderCollected,
    postOrderCollected,
    receiveOrderCollected
}