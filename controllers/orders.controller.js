import { getConnection } from "../database/dbconfig.js";


const createOrders = async (req, res) => {
    const {
        customerId,
        orderStatusId,
        orderCreationDate,
        orderDetails
    } = req.body;
    console.log(req.body);
    try {
        let dateTime = new Date().toISOString().split('T');
        let time = dateTime[1].substring(0, 7);
        let date = dateTime[0];
        let pool = await getConnection();
        let idOrderInserted = await pool.query(`
        insert into invoice.orders(
            customerId,
            orderStatusId,
            orderCreationDate
        )
        values(
            ${customerId},
            ${orderStatusId},
            '${orderCreationDate}'
        )
        
        DECLARE @orderId INT;
        SET @orderId = SCOPE_IDENTITY();
        
        select @orderId as orderId
        `);

        let orderIdInserted = idOrderInserted.recordset[0];

        insertOrderDetails(orderIdInserted, orderDetails);

        let newOrder = await pool.query(`
            select * from invoice.orders 
            where orderId = ${orderIdInserted.orderId}
        `);

        res.status(201).json(newOrder.recordset[0]);

    } catch (error) {
        res.status(400).json({
            msg: 'Problema al crear la orden',
            error: 400,
            errorType: error
        });
    }
}

const insertOrderDetails = async (id, orderDetails) => {
    console.log(id,orderDetails);
    let pool = await getConnection();
    try {
        for (let orderDetail of orderDetails) {
            await pool.query(`
                insert into invoice.orderDetails(
                    orderId,
                    productId,
                    productBarCode,
                    productQuantity,
                    price,
                    total
                )values(
                    ${id.orderId},
                    ${orderDetail.productId},
                    '${orderDetail.productBarCode}',
                    ${orderDetail.productQuantity},
                    ${orderDetail.price},
                    ${orderDetail.total}
                )
            `);
        }
    } catch (error) {
        console.log(error);
    }

}

export {
    createOrders
}