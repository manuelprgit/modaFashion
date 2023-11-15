import { getConnection } from "../database/dbconfig.js";

const getOrders = async (req, res) => {
    let pool = await getConnection();

    let status = req.query;

    //TODO: creaar un get para todas las ordenes
    let orders = await pool.query(`
        select * from invoice.orders
        where orderStatusId not between 4 and 5
        ${(status.statusId) ? `and orderStatusId = ${status.statusId}` : ''}
        order by orderId desc
    `)

    let ordersStructured = [];

    for (let order of orders.recordset) {

        let { recordset } = await pool.query(`
            select 
                a.orderId,
                a.orderCreationDate,
                a.amount,
                c.orderStatusId,
                b.idCustomer,
                b.nameCustomer,
                b.lastNameCustomer,
                b.customerIdentification
            from invoice.orders a
            left join invoice.customers b
            on a.customerId = b.idCustomer
            left join invoice.orderStatus c
            on a.orderStatusId = c.orderStatusId
            where a.orderId = ${order.orderId}
        `);
        let getOrders = recordset[0];

        let orderStatus = await pool.query(`
            select * from invoice.orderStatus 
            where orderStatusId = ${getOrders.orderStatusId} 
        `)

        getOrders['orderStatus'] = orderStatus.recordset[0];

        let orderDetail = await pool.query(`
            select 
                a.orderId,
                b.orderDetailId,
                c.productId,
                c.productBarCode,
                c.productDetail,
                c.linkURL,
                b.productQuantity,
                b.price,
                b.price * b.productQuantity total,
                c.productCost
            from invoice.orders a
            inner join invoice.orderDetails b
            on a.orderId = b.orderId
            left join inventory.products c
            on b.productId = c.productId
            where a.orderId = ${order.orderId}
        `);
        orderDetail = orderDetail.recordset;
        getOrders['orderDetail'] = orderDetail;
        ordersStructured.push(getOrders);
    }

    res.json(ordersStructured);
}

const getOrdersById = async (req, res) => {

    try {
        let orderId = req.params.orderId;

        let pool = await getConnection();
        let orders = await pool.query(`
            select 
                a.orderId,
                a.amount,
                a.orderCreationDate,
                c.orderStatusId,
                b.idCustomer,
                b.nameCustomer,
                b.lastNameCustomer,
                b.customerIdentification
            from invoice.orders A
            left join invoice.customers b
            on a.customerId = b.idCustomer
            left join invoice.orderStatus c
            on a.orderStatusId = c.orderStatusId
            where a.orderId = ${orderId}
        `);

        orders = orders.recordset[0];

        let orderDetail = await pool.query(`
            select 
                a.orderId,
                b.orderDetailId,
                c.productId,
                c.productBarCode,
                c.productDetail,
                c.linkURL,
                b.productQuantity,
                b.price,
                b.price * b.productQuantity total,
                c.productCost
            from invoice.orders a
            inner join invoice.orderDetails b
            on a.orderId = b.orderId
            left join inventory.products c
            on b.productId = c.productId
            where a.orderId = ${orderId}
        `);
        orderDetail = orderDetail.recordset;

        let orderStatus = await pool.query(`
            select * from invoice.orderStatus 
            where orderStatusId = ${orders.orderStatusId} 
        `)

        orders['orderStatus'] = orderStatus.recordset[0];
        orders['orderDetail'] = orderDetail;
        res.json(orders);

    } catch (error) {
        res.status(400).json({
            msg: 'Orden inexistente',
            error: 400,
            errorType: error
        });
        return
    }

}

const createOrders = async (req, res) => {
    const {
        customerId,
        orderDetails
    } = req.body; 

    console.log(new Date().toISOString().substring(0, 10));

    let totalAmount = orderDetails.reduce((acumulator, currentValue) => {
        return acumulator + (currentValue.price * currentValue.productQuantity);
    }, 0);

    try {
        let pool = await getConnection();
        let idOrderInserted = await pool.query(`
        insert into invoice.orders(
            customerId,
            orderCreationDate,
            orderStatusId,
            amount
        )
        values(
            ${customerId},
            getdate(),
            1,
            ${totalAmount}
        )
        
        DECLARE @orderId INT;
        SET @orderId = SCOPE_IDENTITY();
        
        select @orderId as orderId
        `);

        let orderIdInserted = idOrderInserted.recordset[0].orderId;
        let orderDetailInserted = await insertOrderDetails(orderIdInserted, orderDetails);

        if (orderDetailInserted) {
            res.status(400).json({
                msg: 'Problemas al insertar uno o mas artículos',
                error: 400,
                errorType: error 
            });
            return
        }

        let newOrder = await pool.query(`
            select * from invoice.orders 
            where orderId = ${orderIdInserted}
        `);

        res.status(201).json({
            msg: 'Orden creada safistactoriamente',
            status: 201,
            data: newOrder.recordset[0]
        });

    } catch (error) {

        res.status(400).json({
            msg: 'Problema al crear la orden',
            status: 400,
            errorType: error
        });
    }
}

const updateOrders = async (req, res) => {

    let {
        customerId,
        orderStatusId,
        orderDetails
    } = req.body

    let totalAmount = orderDetails.reduce((acumulator, currentValue) => {
        return acumulator + (currentValue.price * currentValue.productQuantity);
    }, 0);

    let orderId = req.params.orderId;
    try {

        let pool = await getConnection();
        await pool.query(`
            update invoice.orders
            set customerId = ${customerId},
                orderStatusId = ${orderStatusId},
                amount = ${totalAmount}
            where orderId = ${orderId} 
        `);

        await insertOrderDetails(orderId, orderDetails);

        res.status(204).json({});

    } catch (error) {
        res.status(400).json({
            msg: 'Problemas al actualizar la orden',
            error: 400,
            errorType: error
        });
        return
    }

}

const getOrderStatus = async (_, res) => {
    let pool = await getConnection();

    let { recordset } = await pool.query(`
        select * from invoice.orderStatus
    `)
    let odersStatus = recordset;

    res.json(odersStatus);
}

const insertOrderDetails = async (id, orderDetails) => {

    let pool = await getConnection();
    await pool.query(`
        delete from invoice.orderDetails
        where orderId = ${id}
    `);

    try {
        for (let orderDetail of orderDetails) {
            await pool.query(`
                insert into invoice.orderDetails(
                    orderId,
                    productId, 
                    productQuantity,
                    price,
                    total
                )values(
                    ${id},
                    ${orderDetail.productId}, 
                    ${orderDetail.productQuantity},
                    ${orderDetail.price},
                    ${Number(orderDetail.price) * Number(orderDetail.productQuantity)}
                )
            `);
        }
    } catch (error) {
        console.log(error);
        return error;
    }

}
//Postear ordenes
const postOrder = async (req, res) => {
    let { documentId } = req.body;

    let pool = await getConnection();

    let { recordset } = await pool.query(`
        select * from invoice.orders
        where orderId = ${documentId}
    `)

    if (recordset[0].orderStatusId != 1) {
        res.status(400).json({
            msg: "El documento ya no puede ser modificado",
            status: 400
        });
        return;
    }

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
        where a.orderId = ${documentId}
    `);

    await pool.query(`
        update invoice.orders
        set orderStatusId = 2
        where orderId = ${documentId}
    `)

    res.status(201).json({
        msg: "Documento posteado con exito",
        status: 201,
        data: documentId
    });

}
//Rechazar Ordenes
const rejectOrder = async (req, res) => {

    let { documentId } = req.body;

    let pool = await getConnection();

    let { recordset } = await pool.query(`
        select * from invoice.orders
        where orderId = ${documentId}
    `);

    if (recordset[0].orderStatusId != 1) {
        res.status(400).json({
            msg: "El documento ya no puede ser modificado",
            status: 400
        });
        return;
    }

    await pool.query(`
        update invoice.orders
        set orderStatusId = 5
        where orderId = ${documentId}
    `);

    res.status(201).json({
        msg: "El documento fue rechazado",
        status: 201,
        data: documentId
    });

}
//Recibir odenes
const recieveOrder = async (req, res) => {

    let { documentId } = req.body;

    let pool = await getConnection();
    try {
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
    } catch (error) {
        console.log(error);
    }

    //Cambio de estatus a RECIBIDO
    await pool.query(`
        update invoice.orders
        set orderStatusId = 3
        where orderId = ${documentId}
    `);

    res.status(201).json({
        msg: "El documento fue recibido con éxito",
        status: 201,
        data: documentId
    });
}
//Entragar la orden
const giveOrder = async (req, res) => {

    let {
        documentId,
        killReceivable
    } = req.body

    let pool = await getConnection()
    try {
        let { recordset } = await pool.query(`
            select * from invoice.orders
            where orderId = ${documentId}
        `);

        let order = recordset[0];

        if (order == undefined) {
            res.status(400).json({
                msg: "La orden no existe",
                status: 400
            });
            return;
        } 
        if (order.orderStatusId != 3) {
            res.status(400).json({
                msg: "La orden debe de estar en estatus Recibido",
                status: 400
            });
            return;
        }

        let orderDetails = await pool.query(`
            select * from invoice.orderDetails
            where orderId = ${documentId};
        `)
        
        orderDetails = orderDetails.recordset;
        
        for(let product of orderDetails){

            await pool.query(`
                update inventory.existence
                set quantity = quantity - ${product.productQuantity}
                where productId = ${product.productId}
            `);
            
        }

        if(killReceivable){

            let remaining = await pool.query(`
                select
                    sum(amount) remainingAmount
                from invoice.accountsReceivable
                where documentId = ${documentId}
            `);

            remaining = remaining.recordset[0];

            await pool.query(` 
                insert into invoice.accountsReceivable(
                    customerId,
                    documentId,
                    amount,
                    dueDate,
                    accountStatus,
                    paymentDate,
                    paymentTypeId,
                    notes
                )
                values(
                    ${order.customerId},
                    ${order.orderId},
                    -${remaining.remainingAmount},
                    GETDATE(),
                    '',
                    GETDATE(),
                    2,
                    'Pago'
                )

                update invoice.accountsReceivable
                set accountStatus = 'Saldado'
                where  paymentTypeId = 1
                and documentId = ${documentId}

                update invoice.orders
                set orderStatusId = 4
                where orderId = ${documentId}
            `);

        }

        res.status(201).json({
            msg: "El documento fue entregado éxitosamente",
            status: 201,
            data: documentId
        });

    } catch (error) {
        console.log(error);
    }
}

export {
    getOrders,
    getOrdersById,
    createOrders,
    updateOrders,
    getOrderStatus,
    postOrder,
    rejectOrder,
    recieveOrder,
    giveOrder
}