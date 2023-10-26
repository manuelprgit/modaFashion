import { getConnection } from "../database/dbconfig.js";


const createOrders = async (req, res) => {
    const {
        customerId,
        customerName,
        customerLastname,
        customerIdentification,
        outStandingDebt,
        orderStatusId,
        orderCreationDate
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
            customerName,
            customerLastname,
            customerIdentification,
            outStandingDebt,
            orderStatusId,
            orderCreationDate
        )
        values(
            ${customerId},
            '${customerName}',
            '${customerLastname}',
            '${customerIdentification}',
            ${outStandingDebt},
            ${orderStatusId},
            '${orderCreationDate}'
        )
        
        DECLARE @orderId INT;
        SET @orderId = SCOPE_IDENTITY();
        
        select @orderId
        `);

        console.log(idOrderInserted.recordset[0]);

        // let invoiceId = invoiceInserted.recordset[0].invoiceId;
        // insertOrderDetails(invoiceId, invoice.articleDetails);
        
        // let {recordset} =  await pool.query(`
        //     select * from invoice.bills
        //     where invoiceId = ${invoiceId}
        // `);

        // console.log(recordset[0]);

        res.status(201).json({id: idOrderInserted.recordset[0]});

    } catch (error) {
        res.status(400).json({
            msg: 'Problema al crear la orden',
            error: 400,
            errorType: error
        });
    }
}

const insertOrderDetails = async (invoiceId, productsDetails) => {
 
    let pool = await getConnection();
    try {
        for (let product of productsDetails) {
            await pool.query(`
                insert into invoice.billsDetail (
                    invoiceId,
                    productId,
                    productBarCode,
                    productName,
                    productDetail,
                    productPrice,
                    subtotal,
                    familyId,
                    categoryId,
                    quantity
                )
                values (
                    ${invoiceId},
                    ${product.productId},
                    '${product.productName}',
                    '${product.productBarCode}',
                    '${product.productDetail}',
                    ${product.productPrice},
                    ${product.subTotal},
                    ${product.productFamily},
                    ${product.productCategory},
                    ${product.productQuantity}
                )
            `);
        }
    } catch (error) {
        return error
    }

}

export {
    createOrders
}