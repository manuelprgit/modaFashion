import { getConnection } from "../database/dbconfig.js";


const createInvoice = async (req, res) => {
    const invoice = req.body;
    console.log(req.body);
    try {
        let dateTime = new Date().toISOString().split('T');
        let time = dateTime[1].substring(0, 7);
        let date = dateTime[0];
        let pool = await getConnection();
        let invoiceInserted = await pool.query(`
            DECLARE @InsertedRecords TABLE (
                invoiceId INT 
            )
            insert into invoice.bills (
                invoiceCreationDate,
                idCustomer,
                nameCustomer,
                idSeller,
                total,
                note,
                cash,
                creditCard,
                checkType,
                credit
            )
            OUTPUT
                INSERTED.invoiceId
            INTO @InsertedRecords
            values (
                '${date} ${time}',
                ${invoice.customerId},
                '${invoice.customerName}',
                ${invoice.idSeller},
                ${invoice.total},
                '${invoice.note}',
                ${invoice.cash},
                ${invoice.creditCard},
                ${invoice.checkType},
                ${invoice.credit}               
            )
    
            SELECT * FROM @InsertedRecords;
        `);

        let invoiceId = invoiceInserted.recordset[0].invoiceId;
        insertInviceDetails(invoiceId, invoice.articleDetails);
        
        let {recordset} =  await pool.query(`
            select * from invoice.bills
            where invoiceId = ${invoiceId}
        `);

        console.log(recordset[0]);

        res.status(201).json(recordset[0]);

    } catch (error) {
        res.status(400).json({
            msg: 'Problema al crear la factura',
            error: 400
        });
    }
}

const insertInviceDetails = async (invoiceId, productsDetails) => {
 
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
    createInvoice
}