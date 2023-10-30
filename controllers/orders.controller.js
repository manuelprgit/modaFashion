import { getConnection } from "../database/dbconfig.js";


const getOrders = async (req,res) => {
    let pool = await getConnection();
    let orders = await  pool.query(`
            select 
                a.orderId
                ,b.idCustomer
                ,b.nameCustomer
                ,b.lastNameCustomer
                ,b.customerIdentification
                ,2458 pendingDebt
            from  invoice.orders a
            left join invoice.customers b
            on a.customerId = b.idCustomer
    `);
    res.json(orders.recordset);
}

const getOrdersById = async (req,res) => { 

    try {
        let orderId = req.params.orderId;
    
        let pool = await getConnection();
        let orders = await  pool.query(`
            select 
                *
            from invoice.orders
            where orderId = ${orderId}
        `);
        
        orders = orders.recordset[0];
        let orderDetail = await  pool.query(`
            select 
                a.orderId,
                b.orderDetailId,
                c.productId,
                c.productBarCode,
                c.productDetail,
                15 quantity,
                c.productPrice,
                c.productCost
            from invoice.orders a
            inner join invoice.orderDetails b
            on a.orderId = b.orderId
            left join inventory.products c
            on b.productId = c.productId
            where a.orderId = ${orderId}
        `);
        orderDetail = orderDetail.recordset
        orders['orderDetail'] = orderDetail
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

    let dateTime = new Date().toISOString().split('T');
    let time = dateTime[1].substring(0, 7);
    let date = dateTime[0];

    try {
        let pool = await getConnection();
        let idOrderInserted = await pool.query(`
        insert into invoice.orders(
            customerId
        )
        values(
            ${customerId}
        )
        
        DECLARE @orderId INT;
        SET @orderId = SCOPE_IDENTITY();
        
        select @orderId as orderId
        `);

        let orderIdInserted = idOrderInserted.recordset[0];
        
        for(let detail of orderDetails){

        }

        let orderDetailInserted = await insertOrderDetails(orderIdInserted, orderDetails);

        if(!orderDetailInserted){
            res.status(400).json({
                msg: 'Problemas al insertar uno o mas artículos',
                error: 400,
                errorType: error
            });
            return
        }

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
        return false;
    }

}

// const updateOrder = async (req,res) => {
//     let {
//         customerId,
//         orderStatusId,
//         orderDetails
//     } = res.body

//     let orderId = res.param;

//     try {
//         let pool = await getConnection();
//         await pool.query(`
//             update invoice.orders
//             set customerId = ${customerId},
//                 orderStatusId = ${orderStatusId},
//         `);


        
//     } catch (error) {
//         console.log(error);
//     }

// }

export {
    getOrders,
    getOrdersById,
    createOrders,
    // updateOrder 
}