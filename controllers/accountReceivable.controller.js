import { getConnection } from "../database/dbconfig.js";

const getAccountReceivable = async (_, res) => {
    let pool = await getConnection();
    let { recordset } = await pool.query(`
        select * from invoice.accountsReceivable
    `)
    let accountReceivable = recordset;

    res.json(accountReceivable);
}

const getInvoicesWithPendingBills = async (req, res) => {

    let customerId = req.params.customerId;

    let pool = await getConnection();

    let customer = await pool.query(`
        select * from invoice.customers
        where idCustomer = ${customerId}
    `);
    if (customer.recordset.length <= 0) {
        res.status(400).json({
            msg: 'El cliente no existe',
            status: 400
        });
        return
    }
    customer = customer.recordset[0];

    let invoice = await pool.query(`
        select 
            b.documentId,
            b.paymentDate date,
            b.amount,
            c.receivable
        from invoice.customers a
        left join invoice.accountsReceivable b
        on a.idCustomer = b.customerId
        left join (
        select 
            documentId,
            sum(amount) receivable
        from invoice.accountsReceivable
        group by documentId
        ) c
        on b.documentId = c.documentId
        where a.idCustomer = ${customerId}
            and b.paymentTypeId = 1
            and b.accountStatus != 'Saldado'
        `)
    invoice = invoice.recordset;
    customer['invoices'] = invoice

    res.json(customer)
}

const billPayment = async (req, res) => {

    let pool = await getConnection();
    let {
        customerId,
        invoices
    } = req.body;

    for (let invoice of invoices) {

        let newInvoice = await pool.query(`
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
            values
            ( 
                ${customerId},
                ${invoice.documentId},
                -${invoice.amount},  
                '${invoice.date}',
                '',
                getdate(),
                2,
                'Pago'
            )

            DECLARE @invoice INT;
            SET @invoice = SCOPE_IDENTITY();
            
            select @invoice as invoice
        `)

        newInvoice = newInvoice.recordset[0].invoice;
        
        console.log(newInvoice);

        let { recordset } = await pool.query(`
            select
                sum(amount) receivable
            from invoice.accountsReceivable
            where documentId = ${invoice.documentId}
            group by documentId
        `);

        let invoiceAmount = recordset[0].receivable;

        if (invoiceAmount < 0) {

            await pool.query(`
                delete from invoice.accountsReceivable
                where accountId = ${newInvoice}
            `)

            res.status(400).json({
                msg: 'El monto es mayor al monto a pagar',
                status: 400
            });
            return


            // await pool.query(`
            //     update invoice.accountsReceivable
            //     set accountStatus = 'Saldado'
            //     where paymentTypeId = 1
            //     and documentId = ${invoice.documentId}
            // `)
        }

        if (invoiceAmount == 0) {
            await pool.query(`
                update invoice.accountsReceivable
                set accountStatus = 'Saldado'
                where paymentTypeId = 1
                and documentId = ${invoice.documentId}
            `)
        }

    }

    res.json({
        msg: 'Los pagos han sido aplicados exitosamente',
        status: 200,
        data: customerId
    })

}

export {
    getAccountReceivable,
    getInvoicesWithPendingBills,
    billPayment
}