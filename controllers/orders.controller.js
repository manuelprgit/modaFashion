import { getConnection } from "../database/dbconfig.js";

const getOrders = async (req, res) => {
    let pool = await getConnection();

    let orders = await pool.query(`
        select * from invoice.orders
    `)
    let ordersStructured = [];

    for (let order of orders.recordset) {

        let { recordset } = await pool.query(` 
                select 
                    a.orderId,
                    a.orderCreationDate,
                    a.amount,
                    c.orderStatusId,
                    c.description statusDescription,
                    b.idCustomer,
                    b.nameCustomer,
                    b.lastNameCustomer,
                    b.customerIdentification
                from invoice.orders A
                left join invoice.customers b
                on a.customerId = b.idCustomer
                left join invoice.orderStatus c
                on a.orderStatusId = c.orderStatusId
                where a.orderId = ${order.orderId}
            `);
        let getOrders = recordset[0];

        let orderDetail = await pool.query(`
            select 
                a.orderId,
                b.orderDetailId,
                c.productId,
                c.productBarCode,
                c.productDetail,
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

const getOrdersFiltered = async (req, res) => {

}

const getOrderStatus = async (req, res) => {
    let pool = await getConnection();

    let { recordset } = await pool.query(`
        select * from invoice.orderStatus
    `)
    let odersStatus = recordset;

    res.json(odersStatus);
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
                c.description statusDescription,
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
        orderDetail
    } = req.body;

    let dateTime = new Date().toISOString().split('T');
    let time = dateTime[1].substring(0, 7);
    let date = dateTime[0];

    let totalAmount = orderDetail.reduce((acumulator, currentValue) => {
        return acumulator + (currentValue.price * currentValue.productQuantity);
    }, 0);

    console.log(totalAmount);

    try {
        let pool = await getConnection();
        let idOrderInserted = await pool.query(`
        insert into invoice.orders(
            customerId,
            orderCreationDate,
            amount
        )
        values(
            ${customerId},
            ${new Date().toISOString().substring(0, 10)},
            ${totalAmount}
        )
        
        DECLARE @orderId INT;
        SET @orderId = SCOPE_IDENTITY();
        
        select @orderId as orderId
        `);

        let orderIdInserted = idOrderInserted.recordset[0].orderId;
        let orderDetailInserted = await insertOrderDetails(orderIdInserted, orderDetail);

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
            error: 400,
            errorType: error
        });
    }
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

const updateOrders = async (req, res) => {

    let {
        customerId,
        orderStatusId,
        orderDetail
    } = req.body

    let totalAmount = orderDetail.reduce((acumulator, currentValue) => {
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

        let newOrdersDetails = [];
        // for (let order of orderDetail) {
        //     if (order.orderDetailId == 0) {
        //         console.log('Si es igual a cero');
        //         newOrdersDetails.push(order);
        //     } else {
        //         console.log('No es igual a cero');
        //         await updateOrderDetail(order)
        //     }
        // } 
        await insertOrderDetails(orderId, orderDetail);

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

export {
    getOrders,
    getOrdersById,
    createOrders,
    updateOrders,
    getOrderStatus
}